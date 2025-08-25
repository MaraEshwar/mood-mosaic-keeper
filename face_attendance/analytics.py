from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime
from typing import Optional, Tuple

import pandas as pd

from .db import fetch_attendance


def attendance_dataframe(start_date: Optional[date] = None, end_date: Optional[date] = None) -> pd.DataFrame:
    rows = fetch_attendance(start_date, end_date)
    df = pd.DataFrame(rows, columns=["ID", "Name", "Date", "Time", "Status"])
    if not df.empty:
        df["Date"] = pd.to_datetime(df["Date"]).dt.date
    return df


def compute_attendance_percentage(df: pd.DataFrame) -> pd.DataFrame:
    if df.empty:
        return pd.DataFrame(columns=["ID", "Name", "Attendance%"])
    present = df[df["Status"].str.lower() == "present"]
    days_present = present.groupby(["ID", "Name"]).agg({"Date": "nunique"}).rename(columns={"Date": "DaysPresent"})
    total_days = df.groupby("Date").size().shape[0]
    # If total days is zero (shouldn't happen if df not empty), avoid division by zero
    if total_days == 0:
        total_days = 1
    result = days_present.reset_index()
    result["Attendance%"] = (result["DaysPresent"] / total_days) * 100.0
    return result.sort_values(["Attendance%"], ascending=False)


def daily_trend(df: pd.DataFrame) -> pd.DataFrame:
    if df.empty:
        return pd.DataFrame(columns=["Date", "Count"])
    trend = df[df["Status"].str.lower() == "present"].groupby("Date").size().reset_index(name="Count")
    return trend.sort_values("Date")


def summary_counts(df: pd.DataFrame) -> pd.Series:
    if df.empty:
        return pd.Series({"Present": 0, "Absent": 0})
    present = (df["Status"].str.lower() == "present").sum()
    absent = (df["Status"].str.lower() != "present").sum()
    return pd.Series({"Present": int(present), "Absent": int(absent)})
