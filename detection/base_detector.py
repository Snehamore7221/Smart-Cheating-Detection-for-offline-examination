from abc import ABC, abstractmethod
from typing import List, Dict, Any

class BaseDetector(ABC):
    """
    Abstract Base Class for all detection algorithms.
    Each detector operates on video frame data and ROI bench mappings.
    """

    @abstractmethod
    def detect(self, frame_data: Any, bench_map: Any) -> List[Dict[str, Any]]:
        """
        Executes detection on frame data.
        Returns list of flagged suspicious activity dictionaries.
        """
        pass
