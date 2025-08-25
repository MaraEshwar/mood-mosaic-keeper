from __future__ import annotations

import sqlite3
from contextlib import contextmanager
from dataclasses import dataclass
from datetime import datetime, date
from pathlib import Path
from typing import Iterable, Iterator, Optional, Tuple

from .config import DB_PATH, ensure_directories


@dataclass
class Person:
    person_id: str
    name: str


def _connect(db_path: Path) -> sqlite3.Connection:
    ensure_directories()
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


@contextmanager
def get_conn(db_path: Path = DB_PATH) -> Iterator[sqlite3.Connection]:
    conn = _connect(db_path)
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    with get_conn() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS people (
                person_id TEXT PRIMARY KEY,
                name TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS face_encodings (
                person_id TEXT NOT NULL,
                encoding BLOB NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (person_id) REFERENCES people(person_id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS attendance (
                person_id TEXT NOT NULL,
                name TEXT NOT NULL,
                date TEXT NOT NULL,
                time TEXT NOT NULL,
                status TEXT NOT NULL,
                PRIMARY KEY (person_id, date),
                FOREIGN KEY (person_id) REFERENCES people(person_id) ON DELETE CASCADE
            );
            """
        )


def upsert_person(person_id: str, name: str) -> None:
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO people(person_id, name) VALUES(?, ?)\n"
            "ON CONFLICT(person_id) DO UPDATE SET name=excluded.name",
            (person_id, name),
        )


def insert_encoding(person_id: str, encoding_bytes: bytes) -> None:
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO face_encodings(person_id, encoding, created_at) VALUES(?, ?, ?)",
            (person_id, encoding_bytes, datetime.utcnow().isoformat()),
        )


def get_people() -> list[Person]:
    with get_conn() as conn:
        cur = conn.execute("SELECT person_id, name FROM people ORDER BY person_id")
        return [Person(*row) for row in cur.fetchall()]


def get_person(person_id: str) -> Optional[Person]:
    with get_conn() as conn:
        cur = conn.execute("SELECT person_id, name FROM people WHERE person_id=?", (person_id,))
        row = cur.fetchone()
        return Person(*row) if row else None


def get_encodings() -> list[Tuple[str, bytes]]:
    with get_conn() as conn:
        cur = conn.execute("SELECT person_id, encoding FROM face_encodings")
        return [(row[0], row[1]) for row in cur.fetchall()]


def get_encodings_for(person_id: str) -> list[bytes]:
    with get_conn() as conn:
        cur = conn.execute(
            "SELECT encoding FROM face_encodings WHERE person_id=? ORDER BY created_at DESC",
            (person_id,),
        )
        return [row[0] for row in cur.fetchall()]


def mark_attendance(person_id: str, name: str, status: str = "Present", when: Optional[datetime] = None) -> None:
    dt = when or datetime.now()
    d = dt.date().isoformat()
    t = dt.time().strftime("%H:%M:%S")
    with get_conn() as conn:
        conn.execute(
            "INSERT OR IGNORE INTO attendance(person_id, name, date, time, status) VALUES(?, ?, ?, ?, ?)",
            (person_id, name, d, t, status),
        )


def fetch_attendance(start_date: Optional[date] = None, end_date: Optional[date] = None) -> list[tuple]:
    query = "SELECT person_id, name, date, time, status FROM attendance"
    params: list = []
    if start_date and end_date:
        query += " WHERE date BETWEEN ? AND ?"
        params.extend([start_date.isoformat(), end_date.isoformat()])
    elif start_date:
        query += " WHERE date >= ?"
        params.append(start_date.isoformat())
    elif end_date:
        query += " WHERE date <= ?"
        params.append(end_date.isoformat())
    query += " ORDER BY date DESC, time DESC"
    with get_conn() as conn:
        cur = conn.execute(query, params)
        return cur.fetchall()
