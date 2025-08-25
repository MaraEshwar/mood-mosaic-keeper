from __future__ import annotations

from pathlib import Path


BASE_DIR: Path = Path(__file__).resolve().parent.parent
DATA_DIR: Path = BASE_DIR / "data"
DATASET_DIR: Path = DATA_DIR / "dataset"
REPORTS_DIR: Path = DATA_DIR / "reports"
DB_PATH: Path = DATA_DIR / "attendance.db"


def ensure_directories() -> None:
    """Create required directories if they do not exist."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    DATASET_DIR.mkdir(parents=True, exist_ok=True)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
