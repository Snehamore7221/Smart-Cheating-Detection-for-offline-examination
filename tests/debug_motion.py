import sys
import os
import cv2
import numpy as np
import math

sys.path.append(os.path.join(os.path.dirname(__file__), '../cv'))
from motion_detector import MotionDetector
from bench_mapper import BenchMapper

def debug_scenario():
    mapper = BenchMapper()
    detector = MotionDetector()
    width, height = 1280, 720
    base_frame = np.full((height, width, 3), 120, dtype=np.uint8)

    print("--- DEBUGGING SCENARIO F (Persistent Movement on B04) ---")
    for f in range(20):
        frame = base_frame.copy()
        # Shift rectangle back and forth across B04 (x: 700 to 950, y: 360 to 450)
        shift = int((f % 10) * 15)
        cv2.rectangle(frame, (750 + shift, 360), (900 + shift, 460), (255, 255, 255), -1)

        alerts = detector.detect_suspicious(frame, mapper, width, height)
        state = detector._get_state("B04")
        print(f"Frame {f:02d}: score={state['score']:.1f}, consecutive={state['consecutive']}, alerts={len(alerts)}")

if __name__ == '__main__':
    debug_scenario()
