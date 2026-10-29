from dataclasses import dataclass, asdict
from typing import Dict, Any, Optional

@dataclass
class Alert:
    """
    Data model for suspicious activity flag.
    Includes bench number, suspicious activity type, video timestamp, and status.
    """
    alert_id: str
    bench_id: str
    activity_type: str
    timestamp_str: str
    timestamp_seconds: float
    video_filename: str
    confidence: Optional[float] = 1.0
    status: str = "Flagged for Review"

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
