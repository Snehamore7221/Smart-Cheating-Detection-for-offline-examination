"""
Traditional Computer Vision Movement & Boundary Violation Detector.

TWO-STAGE DETECTION ARCHITECTURE:
STAGE 1: Global Movement Detection (Grayscale -> Gaussian Blur -> Frame Difference & MOG2 -> Binary Threshold -> Morphology -> External Contours)
STAGE 2: Geometric Student Association via Expanded ROI scoring -> Boundary Violation Calculation against Original ROI -> Independent Temporal Persistence

STRICTLY NON-AI:
- NO YOLO / CNN / Deep Learning / PyTorch / TensorFlow
- NO Face Recognition / Pretrained Weights
"""

import sys
import math

try:
    import cv2
    import numpy as np
    OPENCV_AVAILABLE = True
except ImportError:
    OPENCV_AVAILABLE = False


# ---------------------------------------------------------------------------
# CONFIGURABLE TRADITIONAL CV THRESHOLDS
# Centralized, non-AI parameters for examination surveillance
# ---------------------------------------------------------------------------
DEFAULT_CV_CONFIG = {
    # 1. Pixel Difference Intensity Threshold for Frame Differencing (0-255)
    "pixel_diff_threshold": 25,

    # 2. Gaussian Blur Kernel Size (must be odd, e.g. 15) for noise suppression
    "gaussian_blur_ksize": 15,

    # 3. Morphological Kernel Size for connecting body contours & eliminating isolated noise
    "morph_kernel_size": 5,

    # 4. Minimum Movement Area (in pixels)
    # Ignores normal writing, pen tip jitters, and minor paper rustling
    "min_movement_area": 350,

    # 5. Outside Movement Ratio Threshold (outside_area / total_area)
    # Significant movement extending outside the student's assigned ROI
    "outside_ratio_threshold": 0.25,

    # 6. Minimum Temporal Persistence Frames
    # Movement must persist across multiple consecutive frames before becoming an event
    "min_persistence_frames": 3,

    # 7. Neighbor Overlap Ratio Threshold
    # Movement area encroaching into an adjacent student's ROI
    "neighbor_overlap_threshold": 0.15,

    # 8. Alert Cooldown Frames (Debouncing duplicate alerts for the same movement)
    # At 10 fps sample rate, 40 frames = 4.0 seconds cooldown per student
    "alert_cooldown_frames": 40,

    # 9. Expanded Analysis Region Padding (fraction of width/height)
    "expanded_roi_padding_ratio": 0.35,
}
# ---------------------------------------------------------------------------


class MotionDetector:
    """
    Traditional CV Movement & Boundary Violation Detector.
    Two-stage architecture: Robust global movement detection + Geometric ROI association.
    """

    def __init__(self, config=None):
        self.cfg = dict(DEFAULT_CV_CONFIG)
        if config:
            self.cfg.update(config)

        self.pixel_diff_threshold = int(self.cfg.get("pixel_diff_threshold", 25))
        self.gaussian_blur_ksize  = int(self.cfg.get("gaussian_blur_ksize", 15))
        self.morph_kernel_size    = int(self.cfg.get("morph_kernel_size", 5))
        self.min_movement_area    = int(self.cfg.get("min_movement_area", self.cfg.get("minMovementArea", 350)))
        self.outside_ratio_thresh = float(self.cfg.get("outside_ratio_threshold", self.cfg.get("outsideRatioThreshold", 0.25)))
        self.min_persistence      = int(self.cfg.get("min_persistence_frames", self.cfg.get("minPersistenceFrames", 3)))
        self.neighbor_overlap_th  = float(self.cfg.get("neighbor_overlap_threshold", self.cfg.get("neighborOverlapThreshold", 0.15)))
        self.cooldown_frames      = int(self.cfg.get("alert_cooldown_frames", self.cfg.get("alertCooldownFrames", 40)))
        self.pad_ratio            = float(self.cfg.get("expanded_roi_padding_ratio", 0.35))

        self.prev_gray = None
        self.bg_subtractor = None
        self.morph_kernel = None

        if OPENCV_AVAILABLE:
            self.morph_kernel = cv2.getStructuringElement(
                cv2.MORPH_RECT, (self.morph_kernel_size, self.morph_kernel_size)
            )

        # Per-student temporal tracking state:
        # student_key -> {
        #   "consecutive_violation_frames": int,
        #   "first_violation_sec": float,
        #   "last_incident_time": float,
        #   "cooldown": int
        # }
        self.student_states = {}

    def extract_motion_mask(self, frame):
        """
        STAGE 1: Extract foreground motion mask using Gaussian Blur + Frame Differencing + MOG2.
        Applies morphological opening & dilation to clean up camera noise.
        """
        if not OPENCV_AVAILABLE or frame is None:
            return None, []

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        ksize = self.gaussian_blur_ksize
        if ksize % 2 == 0:
            ksize += 1
        blurred = cv2.GaussianBlur(gray, (ksize, ksize), 0)

        # Initialize MOG2 background subtractor if needed
        if self.bg_subtractor is None:
            self.bg_subtractor = cv2.createBackgroundSubtractorMOG2(
                history=120, varThreshold=30, detectShadows=False
            )

        fg_mog2 = self.bg_subtractor.apply(frame)

        # Frame Differencing with previous frame
        if self.prev_gray is None:
            self.prev_gray = blurred
            return fg_mog2, []

        frame_delta = cv2.absdiff(self.prev_gray, blurred)
        self.prev_gray = blurred

        # Binary thresholding
        _, delta_thresh = cv2.threshold(
            frame_delta, self.pixel_diff_threshold, 255, cv2.THRESH_BINARY
        )

        # Combine MOG2 and absolute frame delta for high fidelity
        motion_combined = cv2.bitwise_or(delta_thresh, fg_mog2)

        # Morphological operations: Open (removes isolated noise) then Dilate (connects arms/body)
        if self.morph_kernel is not None:
            motion_cleaned = cv2.morphologyEx(motion_combined, cv2.MORPH_OPEN, self.morph_kernel)
            motion_cleaned = cv2.dilate(motion_cleaned, self.morph_kernel, iterations=2)
        else:
            motion_cleaned = motion_combined

        # Find external contours of movement globally across the frame
        contours, _ = cv2.findContours(
            motion_cleaned, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )

        valid_contours = [c for c in contours if cv2.contourArea(c) >= 50]
        return motion_cleaned, valid_contours

    def associate_contour_to_student(self, contour, resolved_rois, frame_w, frame_h):
        """
        STAGE 2 (ASSOCIATION):
        Compares contour bounding box and center against each student's EXPANDED ROI.
        Uses scoring: (overlap area with expanded ROI) + (center inside bonus).
        
        Returns:
        - best_student: dict of matching student ROI (or None)
        - best_score: float score
        - candidate_scores: dict mapping student key -> score %
        - bbox: (bx, by, bw, bh)
        - center: (cx, cy)
        """
        if not OPENCV_AVAILABLE or contour is None:
            return None, 0.0, {}, (0,0,0,0), (0,0)

        bx, by, bw, bh = cv2.boundingRect(contour)
        c_area = max(1, cv2.contourArea(contour))
        cx = bx + bw // 2
        cy = by + bh // 2

        best_student = None
        max_score = 0.0
        candidate_scores = {}

        for s in resolved_rois:
            sx, sy, sw, sh = s["px"], s["py"], s["pw"], s["ph"]

            # Compute student's expanded analysis ROI
            pad_x = int(sw * self.pad_ratio)
            pad_y = int(sh * self.pad_ratio)

            exp_x1 = max(0, sx - pad_x)
            exp_y1 = max(0, sy - pad_y)
            exp_x2 = min(frame_w, sx + sw + pad_x)
            exp_y2 = min(frame_h, sy + sh + pad_y)

            # 1. Calculate intersection with expanded ROI
            ix1 = max(bx, exp_x1)
            iy1 = max(by, exp_y1)
            ix2 = min(bx + bw, exp_x2)
            iy2 = min(by + bh, exp_y2)

            score = 0.0
            if ix2 > ix1 and iy2 > iy1:
                intersect_area = (ix2 - ix1) * (iy2 - iy1)
                overlap_ratio = intersect_area / float(c_area)
                score += overlap_ratio * 100.0

                # 2. Check if contour center is inside the expanded ROI
                if exp_x1 <= cx <= exp_x2 and exp_y1 <= cy <= exp_y2:
                    score += 50.0

                # 3. Bonus if contour center is inside original ROI
                if sx <= cx <= (sx + sw) and sy <= cy <= (sy + sh):
                    score += 50.0

            candidate_scores[s["key"]] = round(score, 1)

            if score > max_score and score >= 20.0:
                max_score = score
                best_student = s

        return best_student, max_score, candidate_scores, (bx, by, bw, bh), (cx, cy)

    def calculate_boundary_violation(self, contour, student, resolved_rois, frame_w, frame_h):
        """
        STAGE 2 (BOUNDARY EVALUATION):
        Evaluates how much of the student's associated contour extends outside their ORIGINAL ROI.
        Also checks if the outside portion encroaches into another student's ROI.
        
        Returns:
        - inside_px: area inside original ROI
        - outside_px: area outside original ROI
        - total_px: total contour area
        - outside_ratio: fraction (outside / total)
        - is_neighbor_overlap: boolean
        - related_student_name: str or None
        """
        bx, by, bw, bh = cv2.boundingRect(contour)
        c_area = max(1, cv2.contourArea(contour))

        sx, sy, sw, sh = student["px"], student["py"], student["pw"], student["ph"]

        # Calculate intersection with student's ORIGINAL ROI
        ix1 = max(bx, sx)
        iy1 = max(by, sy)
        ix2 = min(bx + bw, sx + sw)
        iy2 = min(by + bh, sy + sh)

        inside_px = 0
        if ix2 > ix1 and iy2 > iy1:
            inside_px = (ix2 - ix1) * (iy2 - iy1)

        outside_px = max(0, c_area - inside_px)
        total_px = max(1, inside_px + outside_px)
        outside_ratio = outside_px / float(total_px)

        # Check for neighbor encroachment
        is_neighbor_overlap = False
        related_student_name = None

        if outside_px > 60:
            for other in resolved_rois:
                if other["key"] == student["key"]:
                    continue
                ox, oy, ow, oh = other["px"], other["py"], other["pw"], other["ph"]

                # Intersection of contour with other student's ROI
                o_ix1 = max(bx, ox)
                o_iy1 = max(by, oy)
                o_ix2 = min(bx + bw, ox + ow)
                o_iy2 = min(by + bh, oy + oh)

                if o_ix2 > o_ix1 and o_iy2 > o_iy1:
                    overlap_area = (o_ix2 - o_ix1) * (o_iy2 - o_iy1)
                    if overlap_area >= int(self.min_movement_area * self.neighbor_overlap_th):
                        is_neighbor_overlap = True
                        related_student_name = other["name"]
                        break

        return inside_px, outside_px, total_px, outside_ratio, is_neighbor_overlap, related_student_name

    def analyze_student_rois(self, frame, motion_mask, student_rois, current_sec=0.0):
        """
        Two-stage movement and boundary analysis pipeline:
        1. Extract global movement contours.
        2. Geometrically associate contours with students via expanded ROI scoring.
        3. Measure outside boundary violation against original ROI.
        4. Update isolated per-student persistence counters and emit incidents.
        """
        if not OPENCV_AVAILABLE or motion_mask is None or not student_rois:
            return [], {}

        frame_h, frame_w = motion_mask.shape[:2]
        self._tick_cooldowns()

        alerts = []
        visual_states = {s.get("id") or s.get("seatId"): "NORMAL" for s in student_rois}

        # 1. Resolve student ROIs to current processing frame dimensions
        resolved_rois = []
        for s in student_rois:
            roi_data = s.get("roi") if isinstance(s.get("roi"), dict) else s

            raw_x = float(roi_data.get("x", s.get("x", 0)))
            raw_y = float(roi_data.get("y", s.get("y", 0)))
            raw_w = float(roi_data.get("width", roi_data.get("w", s.get("width", s.get("w", 100)))))
            raw_h = float(roi_data.get("height", roi_data.get("h", s.get("height", s.get("h", 100)))))

            pct_x = s.get("pctX") if s.get("pctX") is not None else (roi_data.get("pctX") if isinstance(roi_data, dict) else None)
            pct_y = s.get("pctY") if s.get("pctY") is not None else (roi_data.get("pctY") if isinstance(roi_data, dict) else None)
            pct_w = s.get("pctW") if s.get("pctW") is not None else (roi_data.get("pctW") if isinstance(roi_data, dict) else None)
            pct_h = s.get("pctH") if s.get("pctH") is not None else (roi_data.get("pctH") if isinstance(roi_data, dict) else None)

            if pct_x is not None and pct_w is not None and float(pct_w) > 0:
                # Percentage of frame dimensions (0-100)
                px = max(0, int((float(pct_x) / 100.0) * frame_w))
                py = max(0, int((float(pct_y) / 100.0) * frame_h))
                pw = max(1, min(frame_w - px, int((float(pct_w) / 100.0) * frame_w)))
                ph = max(1, min(frame_h - py, int((float(pct_h) / 100.0) * frame_h)))
            elif raw_w <= 1.0 and raw_h <= 1.0:
                # Normalized [0.0, 1.0] coordinates
                px = max(0, int(raw_x * frame_w))
                py = max(0, int(raw_y * frame_h))
                pw = max(1, min(frame_w - px, int(raw_w * frame_w)))
                ph = max(1, min(frame_h - py, int(raw_h * frame_h)))
            else:
                native_w = float(s.get("nativeW", 1920))
                native_h = float(s.get("nativeH", 1080))
                # Check if coordinates were already authored in current frame resolution
                if native_w == frame_w and native_h == frame_h:
                    scale_x = 1.0
                    scale_y = 1.0
                elif raw_x + raw_w <= frame_w and raw_y + raw_h <= frame_h and raw_x < frame_w * 0.8:
                    scale_x = 1.0
                    scale_y = 1.0
                else:
                    scale_x = frame_w / native_w if native_w > 0 else 1.0
                    scale_y = frame_h / native_h if native_h > 0 else 1.0

                px = max(0, int(raw_x * scale_x))
                py = max(0, int(raw_y * scale_y))
                pw = max(1, min(frame_w - px, int(raw_w * scale_x)))
                ph = max(1, min(frame_h - py, int(raw_h * scale_y)))

            student_key = s.get("id") or s.get("seatId") or f"R{s.get('row',1)}-B{s.get('bench',1)}-S{s.get('seat',1)}"
            resolved_rois.append({
                "meta": s,
                "key": student_key,
                "name": s.get("studentName", f"Student {student_key}"),
                "row": s.get("row", 1),
                "bench": s.get("bench", 1),
                "seat": s.get("seat", 1),
                "px": px,
                "py": py,
                "pw": max(1, pw),
                "ph": max(1, ph),
            })

        # 2. Extract movement contours from global motion mask
        contours, _ = cv2.findContours(
            motion_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )
        # Filter: ignore micro-noise (< 50px) and global camera shifts/warmup artifacts (> 55% of entire frame)
        max_contour_area = frame_w * frame_h * 0.55
        valid_contours = [c for c in contours if 50 <= cv2.contourArea(c) <= max_contour_area]

        fg_pixels = cv2.countNonZero(motion_mask)

        # Log Global Frame Status (as requested in Section 4)
        print(
            f"[CV Frame {round(current_sec*30)}] Sec={current_sec:.2f}s | "
            f"FG Pixels={fg_pixels} | Contours={len(valid_contours)}",
            file=sys.stderr, flush=True
        )

        # Track activity per student in this frame: student_key -> list of contour evaluations
        student_frame_activity = {s["key"]: [] for s in resolved_rois}

        for c_idx, contour in enumerate(valid_contours):
            best_student, score, scores_map, bbox, center = self.associate_contour_to_student(
                contour, resolved_rois, frame_w, frame_h
            )

            bx, by, bw, bh = bbox
            cx, cy = center
            c_area = int(cv2.contourArea(contour))

            # Debug log for contour association (as requested in Section 6)
            assigned_label = best_student["name"] if best_student else "UNASSIGNED"
            print(
                f"  Contour #{c_idx+1}: bbox=({bx},{by},{bw},{bh}) center=({cx},{cy}) area={c_area} "
                f"-> Scores: {scores_map} -> ASSIGNED: {assigned_label}",
                file=sys.stderr, flush=True
            )

            if best_student:
                inside_px, outside_px, total_px, outside_ratio, is_neighbor, related_name = (
                    self.calculate_boundary_violation(
                        contour, best_student, resolved_rois, frame_w, frame_h
                    )
                )

                student_frame_activity[best_student["key"]].append({
                    "contour": contour,
                    "bbox": bbox,
                    "center": center,
                    "inside_px": inside_px,
                    "outside_px": outside_px,
                    "total_px": total_px,
                    "outside_ratio": outside_ratio,
                    "is_neighbor": is_neighbor,
                    "related_name": related_name
                })

        # 3. Evaluate each student independently based on their associated activity
        for student in resolved_rois:
            s_key = student["key"]
            state = self._get_student_state(s_key)
            activities = student_frame_activity.get(s_key, [])

            if not activities:
                # No movement associated with this student
                visual_states[s_key] = "NORMAL"
                state["consecutive_violation_frames"] = max(0, state["consecutive_violation_frames"] - 1)
                continue

            # Aggregate activity metrics for this student
            total_student_movement = sum(a["total_px"] for a in activities)
            total_student_outside = sum(a["outside_px"] for a in activities)
            aggregate_outside_ratio = (
                total_student_outside / float(total_student_movement)
                if total_student_movement > 0 else 0.0
            )

            has_neighbor_overlap = any(a["is_neighbor"] for a in activities)
            related_student_name = next((a["related_name"] for a in activities if a["related_name"]), None)

            has_movement = total_student_movement >= self.min_movement_area
            is_boundary_violation = (
                has_movement and (
                    aggregate_outside_ratio >= self.outside_ratio_thresh or has_neighbor_overlap
                )
            )

            if is_boundary_violation:
                visual_states[s_key] = "FLAGGED"
                state["consecutive_violation_frames"] += 1

                if state["consecutive_violation_frames"] == 1:
                    state["first_violation_sec"] = current_sec

                duration_sec = round(max(0.5, current_sec - state["first_violation_sec"]), 1)

                print(
                    f"[CV Student Action] [{s_key} - {student['name']}] "
                    f"total_motion={total_student_movement}px outside_ratio={aggregate_outside_ratio:.2f} "
                    f"persistence={state['consecutive_violation_frames']}/{self.min_persistence} -> FLAGGED",
                    file=sys.stderr, flush=True
                )

                # Temporal consistency & debounced incident creation
                if (
                    state["consecutive_violation_frames"] >= self.min_persistence
                    and state["cooldown"] == 0
                ):
                    event_type = (
                        "NEIGHBOR_ZONE_MOVEMENT"
                        if has_neighbor_overlap
                        else "BOUNDARY_VIOLATION"
                    )

                    reason = (
                        f"Student movement crossed boundary (outside ratio: {aggregate_outside_ratio*100:.1f}%, "
                        f"area: {total_student_movement}px) for {duration_sec}s"
                    )
                    if related_student_name:
                        reason += f" encroaching toward {related_student_name}'s zone"

                    alerts.append({
                        "studentName": student["name"],
                        "studentId": student["meta"].get("id") or student["key"],
                        "row": student["row"],
                        "bench": student["bench"],
                        "seat": student["seat"],
                        "benchId": student["meta"].get("benchId") or f"B{student['bench']:02d}",
                        "seatId": student["meta"].get("seatId") or student["key"],
                        "timestamp": self._format_timestamp(current_sec),
                        "timeSec": round(current_sec, 1),
                        "activityType": event_type,
                        "type": event_type,
                        "duration": duration_sec,
                        "outsideRatio": round(aggregate_outside_ratio, 2),
                        "movementArea": total_student_movement,
                        "relatedStudent": related_student_name,
                        "status": "Needs Review",
                        "severity": "HIGH" if has_neighbor_overlap else "MEDIUM",
                        "reason": reason,
                        "roi": student["meta"].get("roi") if isinstance(student["meta"].get("roi"), dict) else {
                            "x": student["px"],
                            "y": student["py"],
                            "width": student["pw"],
                            "height": student["ph"],
                        },
                        "frameRoi": {
                            "x": student["px"],
                            "y": student["py"],
                            "width": student["pw"],
                            "height": student["ph"],
                        },
                        "coordinates": {
                            "x": student["px"] + student["pw"] // 2,
                            "y": student["py"] + student["ph"] // 2,
                        }
                    })

                    # Trigger cooldown and reset counter
                    state["cooldown"] = self.cooldown_frames
                    state["consecutive_violation_frames"] = 0

            elif has_movement:
                visual_states[s_key] = "MOVEMENT"
                state["consecutive_violation_frames"] = max(0, state["consecutive_violation_frames"] - 1)
            else:
                visual_states[s_key] = "NORMAL"
                state["consecutive_violation_frames"] = 0

        return alerts, visual_states

    def _get_student_state(self, student_key):
        if student_key not in self.student_states:
            self.student_states[student_key] = {
                "consecutive_violation_frames": 0,
                "first_violation_sec": 0.0,
                "last_incident_time": 0.0,
                "cooldown": 0,
            }
        return self.student_states[student_key]

    def _tick_cooldowns(self):
        for state in self.student_states.values():
            if state["cooldown"] > 0:
                state["cooldown"] -= 1

    def _format_timestamp(self, seconds):
        hrs  = int(seconds // 3600)
        mins = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        return f"{hrs:02d}:{mins:02d}:{secs:02d}"
