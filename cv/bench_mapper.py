"""
Classroom Bench and Student ROI Spatial Mapper.
Stores and translates student ROIs (x, y, width, height) relative to original video dimensions.
"""

import json
import os

class BenchMapper:
    """
    Manages student ROIs for traditional computer vision surveillance.
    Supports dynamic classroom grid configurations and customized rectangular ROIs.
    """
    def __init__(self, config_path=None, rois_data=None, video_id=None):
        self.student_rois = []

        if rois_data and isinstance(rois_data, list):
            self.student_rois = rois_data
        elif rois_data and isinstance(rois_data, dict):
            self.student_rois = rois_data.get("student_rois", rois_data.get("benches", []))
        else:
            if config_path is None:
                config_path = os.path.join(os.path.dirname(__file__), '../backend/config/student_rois.json')
            
            if os.path.exists(config_path):
                try:
                    with open(config_path, 'r') as f:
                        data = json.load(f)
                        if isinstance(data, list):
                            self.student_rois = data
                        elif "student_rois" in data:
                            self.student_rois = data["student_rois"]
                except Exception as e:
                    print(f"[BenchMapper Warning] Could not parse student ROIs: {e}")

        if not self.student_rois:
            self._generate_default_rois(rows=2, benches_per_row=2, seats_per_bench=2)

    def _generate_default_rois(self, rows=2, benches_per_row=2, seats_per_bench=2, frame_w=1920, frame_h=1080):
        """
        Generates standard default classroom layout ROIs if none are specified by faculty.
        """
        self.student_rois = []
        bench_count = 1

        top_margin = int(frame_h * 0.12)
        avail_h = int(frame_h * 0.78)
        row_h = avail_h // max(1, rows)

        left_margin = int(frame_w * 0.06)
        avail_w = int(frame_w * 0.88)
        bench_w = avail_w // max(1, benches_per_row)

        for r in range(1, rows + 1):
            for b in range(1, benches_per_row + 1):
                bx = left_margin + (b - 1) * bench_w
                by = top_margin + (r - 1) * row_h
                bw = int(bench_w * 0.88)
                bh = int(row_h * 0.82)

                seat_w = bw // max(1, seats_per_bench)
                for s in range(1, seats_per_bench + 1):
                    sx = bx + (s - 1) * seat_w
                    sy = by
                    sw = int(seat_w * 0.90)
                    sh = bh

                    student_name = f"Student {bench_count}-{s}"
                    seat_id = f"B{bench_count:02d}-S{s:02d}"

                    self.student_rois.append({
                        "studentName": student_name,
                        "row": r,
                        "bench": b,
                        "seat": s,
                        "benchId": f"B{bench_count:02d}",
                        "seatId": seat_id,
                        "x": sx,
                        "y": sy,
                        "width": sw,
                        "height": sh,
                    })

                bench_count += 1

    def get_rois(self):
        return self.student_rois
