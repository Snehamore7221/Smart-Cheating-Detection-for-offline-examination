import json
import os
from typing import List, Dict, Any, Optional, Tuple
from utils.geometry_utils import is_point_in_polygon
from config.settings import DEFAULT_BENCH_MAP_PATH

class BenchMapper:
    """
    Maps video frame coordinates (x, y) to bench numbers and exam hall regions.
    """

    def __init__(self, map_file_path: str = str(DEFAULT_BENCH_MAP_PATH)):
        self.map_file_path = map_file_path
        self.bench_data: List[Dict[str, Any]] = []
        self.load_bench_map()

    def load_bench_map(self):
        """Loads bench ROI mapping from JSON configuration file."""
        if os.path.exists(self.map_file_path):
            try:
                with open(self.map_file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.bench_data = data.get("benches", [])
            except Exception:
                self.bench_data = []

    def get_bench_id_at_point(self, point: Tuple[int, int]) -> Optional[str]:
        """
        Determines which bench region contains the given (x, y) point.
        """
        for bench in self.bench_data:
            polygon = [tuple(p) for p in bench.get("roi_polygon", [])]
            if is_point_in_polygon(point, polygon):
                return bench.get("bench_id")
        return None

    def get_all_benches(self) -> List[Dict[str, Any]]:
        """Returns list of configured bench regions."""
        return self.bench_data
