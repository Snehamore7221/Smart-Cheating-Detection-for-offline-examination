import sqlite3
from pathlib import Path
from config.settings import DATABASE_PATH
from utils.logger import logger

def get_db_connection(db_path: Path = DATABASE_PATH) -> sqlite3.Connection:
    """
    Creates and returns a connection to the local SQLite database.
    """
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    return conn

def init_db(db_path: Path = DATABASE_PATH):
    """
    Initializes database tables for incident logging if they do not exist.
    """
    conn = get_db_connection(db_path)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS incidents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            alert_id TEXT UNIQUE NOT NULL,
            bench_id TEXT NOT NULL,
            activity_type TEXT NOT NULL,
            timestamp_str TEXT NOT NULL,
            timestamp_seconds REAL NOT NULL,
            video_filename TEXT NOT NULL,
            confidence REAL,
            status TEXT NOT NULL DEFAULT 'Flagged for Review',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()
    logger.info("Database initialized successfully.")
