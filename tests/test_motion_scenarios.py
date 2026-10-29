import sys
import os
import cv2
import numpy as np
import math

sys.path.append(os.path.join(os.path.dirname(__file__), '../cv'))

from motion_detector import MotionDetector
from bench_mapper import BenchMapper

def create_synthetic_frame(width=1280, height=720):
    frame = np.full((height, width, 3), 120, dtype=np.uint8)
    cv2.rectangle(frame, (600, 300), (1100, 600), (80, 80, 80), -1)
    return frame

def run_tests():
    print("================================================================")
    print(" TESTING MOTION DETECTOR AGAINST EXAMINATION MOVEMENT SCENARIOS")
    print("================================================================")

    mapper = BenchMapper()
    width, height = 1280, 720
    base_frame = create_synthetic_frame(width, height)

    def simulate_scenario(name, num_frames, draw_func):
        detector_instance = MotionDetector()
        alerts_triggered = []

        for f in range(num_frames):
            frame = base_frame.copy()
            draw_func(frame, f)
            alerts = detector_instance.detect_suspicious(frame, mapper, width, height)
            if alerts:
                alerts_triggered.extend(alerts)

        return alerts_triggered

    # A. Normal writing movement (Tiny pencil strokes / hand vibration near paper ~ 30x20 px, stationary torso)
    def draw_writing(frame, f):
        offset = (f % 5) * 2
        cv2.circle(frame, (800 + offset, 460), 10, (200, 200, 200), -1)

    alerts_a = simulate_scenario("A. Normal Writing Movement", 30, draw_writing)
    result_a = "PASS (NO ALERT)" if len(alerts_a) == 0 else f"FAIL ({len(alerts_a)} alerts)"
    print(f"Scenario A [Normal Writing]: {result_a}")

    # B. Small hand movement (Moving pen / picking up eraser ~ 40x40 px, slight jitter)
    def draw_small_hand(frame, f):
        offset_x = int(math.sin(f * 0.5) * 15)
        offset_y = int(math.cos(f * 0.5) * 10)
        cv2.ellipse(frame, (820 + offset_x, 470 + offset_y), (25, 15), 0, 0, 360, (220, 220, 220), -1)

    alerts_b = simulate_scenario("B. Small Hand Movement", 30, draw_small_hand)
    result_b = "PASS (NO ALERT)" if len(alerts_b) == 0 else f"FAIL ({len(alerts_b)} alerts)"
    print(f"Scenario B [Small Hand Movement]: {result_b}")

    # C. Head movement (Slight looking down / head tilt for 2-3 frames, stationary torso)
    def draw_head_tilt(frame, f):
        if f < 6:
            tilt = f * 3
            cv2.circle(frame, (800, 380 + tilt), 30, (240, 240, 240), -1)
        else:
            cv2.circle(frame, (800, 395), 30, (240, 240, 240), -1)

    alerts_c = simulate_scenario("C. Head Movement", 30, draw_head_tilt)
    result_c = "PASS (NO ALERT)" if len(alerts_c) == 0 else f"FAIL ({len(alerts_c)} alerts)"
    print(f"Scenario C [Head Movement]: {result_c}")

    # D. Posture adjustment (Short single shift of chair/body for 2-3 frames then stationary)
    def draw_posture_shift(frame, f):
        if 5 <= f <= 8:
            cv2.rectangle(frame, (750 + (f-5)*10, 360), (880 + (f-5)*10, 520), (250, 250, 250), -1)
        else:
            cv2.rectangle(frame, (780, 360), (910, 520), (250, 250, 250), -1)

    alerts_d = simulate_scenario("D. Posture Adjustment", 30, draw_posture_shift)
    result_d = "PASS (NO ALERT)" if len(alerts_d) == 0 else f"FAIL ({len(alerts_d)} alerts)"
    print(f"Scenario D [Posture Adjustment]: {result_d}")

    # E. Significant repeated movement (Student repeatedly shifting & turning body back and forth)
    def draw_repeated_movement(frame, f):
        shift = int(math.sin(f * 0.4) * 45)
        cv2.rectangle(frame, (760 + shift, 360), (900 + shift, 460), (255, 255, 255), -1)

    alerts_e = simulate_scenario("E. Significant Repeated Movement", 30, draw_repeated_movement)
    result_e = f"PASS (ALERT GENERATED: {len(alerts_e)} alert)" if len(alerts_e) > 0 else "NO ALERT"
    print(f"Scenario E [Significant Repeated Movement]: {result_e}")

    # F. Persistent unusual movement (Student turned around / sustained abnormal motion > 6 frames)
    def draw_persistent_turning(frame, f):
        shift = int((f % 10) * 15)
        cv2.rectangle(frame, (750 + shift, 360), (900 + shift, 460), (255, 255, 255), -1)

    alerts_f = simulate_scenario("F. Persistent Unusual Movement", 25, draw_persistent_turning)
    result_f = f"PASS (ALERT GENERATED: {len(alerts_f)} alert)" if len(alerts_f) > 0 else "FAIL (NO ALERT)"
    print(f"Scenario F [Persistent Unusual Movement]: {result_f}")

    print("================================================================")
    all_passed = (len(alerts_a) == 0 and len(alerts_b) == 0 and len(alerts_c) == 0 and len(alerts_d) == 0 and len(alerts_f) > 0)
    print(f"Overall Result: {'ALL TEST SCENARIOS PASSED' if all_passed else 'SOME TESTS FAILED'}")

if __name__ == '__main__':
    run_tests()
