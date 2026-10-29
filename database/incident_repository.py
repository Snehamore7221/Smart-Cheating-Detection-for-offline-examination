from typing import List, Dict, Any, Optional
from database.db_connection import get_db_connection
from alerts.alert_model import Alert

class IncidentRepository:
    """
    Repository for persisting and querying incident logs in SQLite.
    """

    def save_incident(self, alert: Alert) -> bool:
        """Saves a suspicious activity alert incident to the database."""
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("""
                INSERT OR IGNORE INTO incidents 
                (alert_id, bench_id, activity_type, timestamp_str, timestamp_seconds, video_filename, confidence, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                alert.alert_id,
                alert.bench_id,
                alert.activity_type,
                alert.timestamp_str,
                alert.timestamp_seconds,
                alert.video_filename,
                alert.confidence,
                alert.status
            ))
            conn.commit()
            return True
        except Exception:
            return False
        finally:
            conn.close()

    def get_all_incidents(self, video_filename: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieves recorded incident logs, optionally filtered by video file."""
        conn = get_db_connection()
        cursor = conn.cursor()
        if video_filename:
            cursor.execute("SELECT * FROM incidents WHERE video_filename = ? ORDER BY timestamp_seconds ASC", (video_filename,))
        else:
            cursor.execute("SELECT * FROM incidents ORDER BY id DESC")
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]

incident_repo = IncidentRepository()
