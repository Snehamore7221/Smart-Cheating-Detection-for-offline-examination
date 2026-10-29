"""
Traditional Computer Vision Examination Surveillance Video Processor.

Pipeline:
MP4 Video -> cv2.VideoCapture -> Grayscale -> Gaussian Blur ->
Frame Differencing & MOG2 -> Binary Threshold -> Morphological Clean-up ->
Student ROI Analysis -> Outside Movement Ratio -> Neighbor Overlap ->
Temporal Consistency Filter -> JSON Event Output + Annotated Evidence Snapshots
"""

import sys
import os
import json
import argparse
import time

from bench_mapper import BenchMapper
from motion_detector import MotionDetector, DEFAULT_CV_CONFIG

try:
    import cv2
    import numpy as np
    OPENCV_AVAILABLE = True
except ImportError:
    OPENCV_AVAILABLE = False


SAMPLE_RATE = 3  # Process every 3rd frame (at 30fps = ~10 analysis frames/sec)


def format_timestamp(seconds):
    hrs  = int(seconds // 3600)
    mins = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    return f"{hrs:02d}:{mins:02d}:{secs:02d}"


def process_video(video_path, video_id, rois_data=None, cv_config_overrides=None):
    if not os.path.exists(video_path):
        print(json.dumps({"error": f"Video file not found: {video_path}"}))
        sys.exit(1)

    mapper = BenchMapper(rois_data=rois_data, video_id=video_id)
    student_rois = mapper.get_rois()

    cfg = dict(DEFAULT_CV_CONFIG)
    if cv_config_overrides:
        cfg.update(cv_config_overrides)

    detector = MotionDetector(config=cfg)

    evidence_dir = os.path.join(os.path.dirname(__file__), "../data/evidence")
    os.makedirs(evidence_dir, exist_ok=True)

    # -----------------------------------------------------------------------
    # Explicit check: traditional non-AI OpenCV must be available
    # No synthetic or silent fallback simulation
    # -----------------------------------------------------------------------
    if not OPENCV_AVAILABLE:
        err_msg = (
            "OpenCV (cv2) or NumPy is not available in the Python environment. "
            "Real examination movement analysis requires OpenCV. Please verify cv2 is installed."
        )
        print(json.dumps({"type": "ERROR", "error": err_msg}), flush=True)
        print(f"[CV Engine Error] {err_msg}", file=sys.stderr, flush=True)
        sys.exit(1)

    # -----------------------------------------------------------------------
    # Real OpenCV Video Stream Processing
    # -----------------------------------------------------------------------
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        err_msg = f"Cannot open video stream: {video_path}"
        print(json.dumps({"type": "ERROR", "error": err_msg}), flush=True)
        print(f"[CV Engine Error] {err_msg}", file=sys.stderr, flush=True)
        sys.exit(1)

    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    frame_w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)) or 1920
    frame_h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)) or 1080
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 0
    frame_count = 0
    total_alerts_count = 0

    # Emit INIT message
    print(json.dumps({
        "type": "INIT",
        "totalFrames": total_frames,
        "fps": round(fps, 2),
        "width": frame_w,
        "height": frame_h,
        "studentCount": len(student_rois)
    }), flush=True)

    print(
        f"[CV Engine] Started. Video={video_path} {frame_w}x{frame_h}@{fps:.1f}fps, total_frames={total_frames}. "
        f"Tracking {len(student_rois)} student ROIs with Traditional CV.",
        file=sys.stderr, flush=True
    )

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret or frame is None:
            break

        frame_count += 1
        if frame_count % SAMPLE_RATE != 0:
            continue

        # Warmup period for MOG2 background subtractor (first ~0.3s of video stream)
        if frame_count <= (SAMPLE_RATE * 3):
            continue

        current_sec = frame_count / fps

        # 1. Extract Foreground Motion Mask using Traditional Image Processing
        motion_mask, contours = detector.extract_motion_mask(frame)

        # 2. Analyze Student ROIs for Boundary Violations & Neighbor Overlaps
        alerts, visual_states = detector.analyze_student_rois(
            frame, motion_mask, student_rois, current_sec=current_sec
        )

        # 3. Handle Generated Incidents & Save Evidence Snapshots
        for alert in alerts:
            total_alerts_count += 1
            s_name = alert["studentName"]
            s_key = alert["seatId"]
            ev_file = f"ev_boundary_{video_id}_f{frame_count}_{s_key}.jpg"
            ev_path = os.path.join(evidence_dir, ev_file)

            # Generate annotated evidence snapshot
            draw = frame.copy()
            roi = alert["roi"]
            rx, ry, rw, rh = roi["x"], roi["y"], roi["width"], roi["height"]

            # Draw student ROI in Green
            cv2.rectangle(draw, (rx, ry), (rx + rw, ry + rh), (0, 220, 0), 2)
            cv2.putText(
                draw, f"{s_name} ({alert['seatId']})",
                (rx, max(20, ry - 8)), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 255, 0), 2
            )

            # Draw movement boundary warning banner
            is_neighbor = alert.get("relatedStudent") is not None
            banner_color = (0, 0, 255) if is_neighbor else (0, 140, 255)
            tag_text = (
                f"FLAGGED: NEIGHBOR OVERLAP ({alert.get('relatedStudent')})"
                if is_neighbor else f"FLAGGED: BOUNDARY VIOLATION ({int(alert['outsideRatio']*100)}% OUTSIDE)"
            )

            cv2.putText(
                draw, tag_text, (max(10, rx - 30), max(30, ry + rh + 24)),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, banner_color, 2
            )

            # Save frame snapshot
            try:
                cv2.imwrite(ev_path, draw)
                alert["evidencePath"] = f"/evidence/{ev_file}"
            except Exception:
                alert["evidencePath"] = None

            alert["videoId"] = video_id
            alert["frameNumber"] = frame_count
            alert["eventType"] = "INCIDENT"

            # Emit structured JSON line for backend cvBridge
            print(json.dumps(alert), flush=True)

        # Periodic Progress Broadcast (every 15 frames = ~0.5s of video footage)
        if frame_count % (SAMPLE_RATE * 5) == 0:
            pct = min(99.0, round((frame_count / max(1, total_frames)) * 100, 1)) if total_frames > 0 else 0
            print(json.dumps({
                "type": "PROGRESS",
                "currentFrame": frame_count,
                "totalFrames": total_frames,
                "percent": pct,
                "timeSec": round(current_sec, 1)
            }), flush=True)

    cap.release()

    # Emit final COMPLETED event
    print(json.dumps({
        "type": "COMPLETED",
        "totalFrames": total_frames,
        "processedFrames": frame_count,
        "totalAlerts": total_alerts_count
    }), flush=True)

    print(
        f"[CV Engine] Video processing completed. Analyzed {frame_count} frames, {total_alerts_count} alerts.",
        file=sys.stderr, flush=True
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Traditional OpenCV Student ROI Boundary Violation Processor")
    parser.add_argument("--video", required=True, help="Path to CCTV video file")
    parser.add_argument("--id", required=True, help="Unique Video ID")
    parser.add_argument("--rois", required=False, help="JSON file path or string of student ROIs")
    parser.add_argument("--config", required=False, help="JSON string of CV configuration thresholds")
    args = parser.parse_args()

    parsed_rois = None
    if args.rois:
        if os.path.exists(args.rois):
            try:
                with open(args.rois, 'r') as f:
                    parsed_rois = json.load(f)
            except Exception as e:
                print(f"[Warning] Failed to load ROIs file: {e}", file=sys.stderr)
        else:
            try:
                parsed_rois = json.loads(args.rois)
            except Exception:
                pass

    parsed_cv_cfg = None
    if args.config:
        try:
            parsed_cv_cfg = json.loads(args.config)
        except Exception:
            pass

    process_video(args.video, args.id, rois_data=parsed_rois, cv_config_overrides=parsed_cv_cfg)
