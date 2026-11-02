import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "medvision.db"


def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with get_conn() as c:
        c.execute(
            """CREATE TABLE IF NOT EXISTS patients (
                id TEXT PRIMARY KEY, name TEXT NOT NULL, age INTEGER,
                gender TEXT, contact TEXT, notes TEXT)"""
        )
        c.execute(
            """CREATE TABLE IF NOT EXISTS analyses (
                study_id TEXT PRIMARY KEY, patient_id TEXT, modality TEXT,
                prediction TEXT, confidence REAL, priority TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP)"""
        )
