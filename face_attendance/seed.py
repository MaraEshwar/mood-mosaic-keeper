from __future__ import annotations

import argparse
from datetime import date, datetime, timedelta
from pathlib import Path

from .config import ensure_directories, DATASET_DIR
from .db import init_db, upsert_person, mark_attendance
from .reporting import generate_weekly_report


def daterange(start: date, end: date):
    d = start
    while d <= end:
        yield d
        d += timedelta(days=1)


def seed_people_and_attendance(start: date, end: date) -> None:
    ensure_directories()
    init_db()

    # Create sample dataset folder structure
    (DATASET_DIR / "1001_Alice").mkdir(parents=True, exist_ok=True)
    (DATASET_DIR / "1002_Bob").mkdir(parents=True, exist_ok=True)

    upsert_person("1001", "Alice")
    upsert_person("1002", "Bob")

    for d in daterange(start, end):
        # Alice present every day
        mark_attendance("1001", "Alice", status="Present", when=datetime.combine(d, datetime.min.time()))
        # Bob present 3 days per week (Mon/Wed/Fri)
        if d.weekday() in (0, 2, 4):
            mark_attendance("1002", "Bob", status="Present", when=datetime.combine(d, datetime.min.time()))


def main():
    parser = argparse.ArgumentParser(description="Seed sample people and attendance, optionally generate report")
    parser.add_argument("--start", required=True, help="YYYY-MM-DD")
    parser.add_argument("--end", required=True, help="YYYY-MM-DD")
    parser.add_argument("--report", action="store_true", help="Generate weekly report after seeding")
    args = parser.parse_args()

    start = datetime.strptime(args.start, "%Y-%m-%d").date()
    end = datetime.strptime(args.end, "%Y-%m-%d").date()

    seed_people_and_attendance(start, end)
    print(f"Seeded attendance from {start} to {end}")

    if args.report:
        paths = generate_weekly_report(start, end)
        print("Generated:", paths)


if __name__ == "__main__":
    main()
