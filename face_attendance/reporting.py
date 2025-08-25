from __future__ import annotations

import argparse
from datetime import date, datetime
from pathlib import Path
from typing import Optional

import matplotlib
matplotlib.use("Agg")  # Ensure headless rendering
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd

from .config import REPORTS_DIR
from .analytics import attendance_dataframe, compute_attendance_percentage, daily_trend, summary_counts


def _parse_date(s: str) -> date:
    return datetime.strptime(s, "%Y-%m-%d").date()


def generate_weekly_report(start: date, end: date, output_dir: Path = REPORTS_DIR) -> tuple[Path, Path, Path]:
    output_dir.mkdir(parents=True, exist_ok=True)
    df = attendance_dataframe(start, end)

    # Build figures
    sns.set_theme(style="whitegrid")
    paths: list[Path] = []
    fig_paths: dict[str, Path] = {}

    # Attendance percentage per person
    perc = compute_attendance_percentage(df)
    fig1, ax1 = plt.subplots(figsize=(8, 4))
    if not perc.empty:
        sns.barplot(data=perc, x="Name", y="Attendance%", ax=ax1, color="#4C78A8")
        ax1.set_title("Attendance Percentage")
        ax1.set_xticklabels(ax1.get_xticklabels(), rotation=30, ha="right")
    else:
        ax1.text(0.5, 0.5, "No data", ha="center", va="center")
        ax1.set_axis_off()
    fig1.tight_layout()
    fig1_path = output_dir / f"attendance_percentage_{start}_{end}.png"
    fig1.savefig(fig1_path, dpi=150)
    plt.close(fig1)
    fig_paths["percentage"] = fig1_path

    # Daily trend line chart
    trend = daily_trend(df)
    fig2, ax2 = plt.subplots(figsize=(8, 4))
    if not trend.empty:
        sns.lineplot(data=trend, x="Date", y="Count", marker="o", ax=ax2, color="#72B7B2")
        ax2.set_title("Daily Attendance Trend")
    else:
        ax2.text(0.5, 0.5, "No data", ha="center", va="center")
        ax2.set_axis_off()
    fig2.tight_layout()
    fig2_path = output_dir / f"daily_trend_{start}_{end}.png"
    fig2.savefig(fig2_path, dpi=150)
    plt.close(fig2)
    fig_paths["trend"] = fig2_path

    # Summary pie chart
    summ = summary_counts(df)
    fig3, ax3 = plt.subplots(figsize=(4, 4))
    if summ.sum() > 0:
        ax3.pie(summ.values, labels=summ.index, autopct="%1.1f%%", colors=["#4C78A8", "#F58518"])
        ax3.set_title("Overall Summary")
    else:
        ax3.text(0.5, 0.5, "No data", ha="center", va="center")
        ax3.set_axis_off()
    fig3.tight_layout()
    fig3_path = output_dir / f"summary_{start}_{end}.png"
    fig3.savefig(fig3_path, dpi=150)
    plt.close(fig3)
    fig_paths["summary"] = fig3_path

    # Excel export
    excel_path = output_dir / f"attendance_{start}_{end}.xlsx"
    with pd.ExcelWriter(excel_path, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Logs")
        perc.to_excel(writer, index=False, sheet_name="Percentage")
        trend.to_excel(writer, index=False, sheet_name="Trend")
        pd.DataFrame(summ).reset_index().rename(columns={"index": "Status", 0: "Count"}).to_excel(writer, index=False, sheet_name="Summary")

    # Simple PDF: use matplotlib's PdfPages to bundle images
    from matplotlib.backends.backend_pdf import PdfPages

    pdf_path = output_dir / f"attendance_{start}_{end}.pdf"
    with PdfPages(pdf_path) as pdf:
        for title, path in ("Attendance %", fig1_path), ("Daily Trend", fig2_path), ("Summary", fig3_path):
            fig, ax = plt.subplots(figsize=(8.27, 11.69))  # A4 portrait in inches approximately
            img = plt.imread(path)
            ax.imshow(img)
            ax.axis("off")
            ax.set_title(title)
            pdf.savefig(fig)
            plt.close(fig)

    return fig1_path, excel_path, pdf_path


def main():
    parser = argparse.ArgumentParser(description="Generate weekly attendance reports")
    sub = parser.add_subparsers(dest="mode", required=True)

    p_week = sub.add_parser("weekly")
    p_week.add_argument("--start", required=True, help="YYYY-MM-DD")
    p_week.add_argument("--end", required=True, help="YYYY-MM-DD")

    args = parser.parse_args()
    if args.mode == "weekly":
        start = _parse_date(args.start)
        end = _parse_date(args.end)
        paths = generate_weekly_report(start, end)
        print("Generated:", paths)


if __name__ == "__main__":
    main()
