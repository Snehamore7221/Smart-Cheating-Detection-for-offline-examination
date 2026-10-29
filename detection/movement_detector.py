from typing import List, Dict, Any
from detection.base_detector import BaseDetector

class MovementDetector(BaseDetector):
    """
    Suspicious Movement & Head Turning Detector Module (Stub for future stages).
    Will monitor frame motion deltas within bench boundaries.
    """

    def detect(self, frame_data: Any, bench_map: Any) -> List[Dict[str, Any]]:
        # Stub implementation for Stage 1 (no CV logic executed)
        return []
