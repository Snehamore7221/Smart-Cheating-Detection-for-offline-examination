from typing import List, Dict, Any
from detection.base_detector import BaseDetector

class DetectionOrchestrator:
    """
    Coordinates and runs active detection algorithms on video frames.
    """

    def __init__(self):
        self.detectors: List[BaseDetector] = []

    def register_detector(self, detector: BaseDetector):
        """Registers a new detection module."""
        self.detectors.append(detector)

    def process_frame(self, frame_data: Any, bench_map: Any) -> List[Dict[str, Any]]:
        """Runs all registered detectors on the current frame."""
        alerts = []
        for detector in self.detectors:
            results = detector.detect(frame_data, bench_map)
            alerts.extend(results)
        return alerts
