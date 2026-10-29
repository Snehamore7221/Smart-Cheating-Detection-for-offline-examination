from typing import List, Dict, Any
from detection.base_detector import BaseDetector

class StandingDetector(BaseDetector):
    """
    Standing & Area Abandonment Detector (Stub for future stages).
    Detects when a student moves out of their assigned bench polygon.
    """

    def detect(self, frame_data: Any, bench_map: Any) -> List[Dict[str, Any]]:
        # Stub implementation for Stage 1 (no CV logic executed)
        return []
