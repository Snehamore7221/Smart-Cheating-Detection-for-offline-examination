import cv2
import numpy as np
import os
import math
import json

def generate_exam_hall_cctv():
    output_dir = os.path.join(os.path.dirname(__file__), '../data/videos')
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, 'EXAM_HALL_CCTV_BENCHMARK.mp4')

    width, height = 1280, 720
    fps = 30
    duration_sec = 25
    total_frames = fps * duration_sec

    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    print(f"Generating realistic CCTV examination footage ({width}x{height} @ {fps}fps, {duration_sec}s)...")

    # Load benches layout from benches.json for centered_3col preset
    benches_file = os.path.join(os.path.dirname(__file__), '../backend/config/benches.json')
    benches = []
    if os.path.exists(benches_file):
        with open(benches_file, 'r') as f:
            data = json.load(f)
            benches = data.get('presets', {}).get('centered_3col', {}).get('benches', [])

    # Student shirt colors for variety
    student_colors = {
        'B01': (45, 52, 140),   # Burgundy / Dark Red
        'B02': (140, 100, 50),  # Blue
        'B03': (60, 110, 60),   # Dark Green
        'B04': (40, 45, 155),   # Burgundy
        'B05': (120, 120, 120), # Grey
        'B06': (130, 80, 30),   # Navy Blue
        'B07': (30, 90, 130),   # Orange-Brown
        'B08': (90, 50, 100),   # Purple
        'B09': (70, 100, 80),   # Olive
        'B10': (100, 90, 70),   # Steel
        'B11': (50, 60, 110),   # Crimson
        'B12': (80, 80, 90),    # Slate
    }

    for frame_idx in range(total_frames):
        current_sec = frame_idx / float(fps)

        # 1. Base Room Background (Classroom Wall & Floor Perspective)
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        
        # Classroom upper wall
        cv2.rectangle(frame, (0, 0), (width, int(height * 0.35)), (215, 220, 225), -1)
        # Blackboard
        cv2.rectangle(frame, (int(width * 0.3), 30), (int(width * 0.7), int(height * 0.22)), (40, 65, 45), -1)
        cv2.rectangle(frame, (int(width * 0.3), 30), (int(width * 0.7), int(height * 0.22)), (70, 50, 35), 4)
        cv2.putText(frame, "FINAL EXAMINATION - HALL A", (int(width * 0.35), 80),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (230, 230, 230), 2)
        cv2.putText(frame, "SILENCE PLEASE", (int(width * 0.43), 115),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (180, 220, 180), 1)

        # Classroom Tiled Floor
        cv2.rectangle(frame, (0, int(height * 0.35)), (width, height), (170, 175, 180), -1)
        # Perspective floor tile lines
        for x_line in range(0, width, 160):
            cv2.line(frame, (x_line, int(height * 0.35)), (int(x_line * 1.3 - width * 0.15), height), (150, 155, 160), 1)
        for y_line in range(int(height * 0.35), height, 70):
            cv2.line(frame, (0, y_line), (width, y_line), (150, 155, 160), 1)

        # 2. Render Student Desks and Seated Students in Back-to-Front Order (Row 4 down to Row 1)
        sorted_benches = sorted(benches, key=lambda b: b['yMin'])

        for bench in sorted_benches:
            bid = bench['id']
            bx1 = int(bench['xMin'] * width)
            by1 = int(bench['yMin'] * height)
            bx2 = int(bench['xMax'] * width)
            by2 = int(bench['yMax'] * height)

            bw = bx2 - bx1
            bh = by2 - by1

            desk_x1 = bx1 + int(bw * 0.1)
            desk_x2 = bx2 - int(bw * 0.1)
            desk_y1 = by1 + int(bh * 0.45)
            desk_y2 = by2 - int(bh * 0.05)

            # Center coordinates for the student
            student_cx = (bx1 + bx2) // 2
            student_cy = by1 + int(bh * 0.4)
            shirt_color = student_colors.get(bid, (100, 100, 100))

            # Default Student State (Normal Writing)
            head_offset_x = 0
            head_offset_y = 0
            torso_offset_x = 0
            hand_anim_x = int(math.sin(frame_idx * 0.4 + hash(bid) % 10) * 4)
            hand_anim_y = int(math.cos(frame_idx * 0.3 + hash(bid) % 10) * 2)
            show_phone = False

            # --- CONTROLLED SCENARIO EVENTS ---

            # Incident 1: Bench B04 turns around toward neighbor at B06 (Sec 5 to Sec 9)
            if bid == 'B04' and 5.0 <= current_sec <= 9.5:
                progress = math.sin((current_sec - 5.0) / 4.5 * math.pi)
                torso_offset_x = int(progress * 45)
                head_offset_x = int(progress * 55)
                head_offset_y = int(progress * -15)

            # Incident 2: Bench B03 exhibits persistent unusual movement/leaning across (Sec 12 to Sec 17)
            if bid == 'B03' and 12.0 <= current_sec <= 17.0:
                osc = math.sin((current_sec - 12.0) * 3.5)
                torso_offset_x = int(osc * 40)
                head_offset_x = int(osc * 48)
                head_offset_y = int(abs(osc) * 12)

            # Incident 3: Bench B02 holds up smartphone (Sec 19 to Sec 23)
            if bid == 'B02' and 19.0 <= current_sec <= 23.5:
                show_phone = True
                head_offset_y = 8

            # --- DRAW STUDENT (Back / Torso / Head / Arms) ---

            # Torso (Shoulders/Body)
            student_body_w = int(bw * 0.42)
            student_body_h = int(bh * 0.45)
            body_pt1 = (student_cx - student_body_w // 2 + torso_offset_x, student_cy - int(student_body_h * 0.2))
            body_pt2 = (student_cx + student_body_w // 2 + torso_offset_x, desk_y1 + 10)
            cv2.rectangle(frame, body_pt1, body_pt2, shirt_color, -1)
            cv2.rectangle(frame, body_pt1, body_pt2, (30, 30, 30), 1)

            # Head
            head_radius = max(8, int(bh * 0.18))
            head_center = (student_cx + head_offset_x, student_cy - head_radius + head_offset_y)
            # Hair (Dark)
            cv2.circle(frame, (head_center[0], head_center[1] - 2), head_radius + 2, (20, 20, 25), -1)
            # Face/Neck
            cv2.circle(frame, head_center, head_radius, (170, 195, 220), -1)

            # Desk Surface (Wooden Texture)
            cv2.rectangle(frame, (desk_x1, desk_y1), (desk_x2, desk_y2), (110, 145, 185), -1)
            cv2.rectangle(frame, (desk_x1, desk_y1), (desk_x2, desk_y2), (70, 95, 125), 2)
            # Desk Legs
            cv2.line(frame, (desk_x1 + 6, desk_y2), (desk_x1 + 6, desk_y2 + 15), (40, 40, 40), 3)
            cv2.line(frame, (desk_x2 - 6, desk_y2), (desk_x2 - 6, desk_y2 + 15), (40, 40, 40), 3)

            # Exam Answer Sheet (White Paper on Desk)
            paper_w = int(bw * 0.32)
            paper_h = int(bh * 0.30)
            paper_x1 = student_cx - paper_w // 2
            paper_y1 = desk_y1 + 4
            cv2.rectangle(frame, (paper_x1, paper_y1), (paper_x1 + paper_w, paper_y1 + paper_h), (245, 245, 250), -1)
            cv2.rectangle(frame, (paper_x1, paper_y1), (paper_x1 + paper_w, paper_y1 + paper_h), (180, 180, 180), 1)
            # Text lines on paper
            for line_y in range(paper_y1 + 6, paper_y1 + paper_h - 4, 5):
                cv2.line(frame, (paper_x1 + 4, line_y), (paper_x1 + paper_w - 6, line_y), (160, 160, 170), 1)

            # Student Arms & Writing Hand
            hand_x = student_cx + int(paper_w * 0.2) + hand_anim_x
            hand_y = paper_y1 + int(paper_h * 0.5) + hand_anim_y
            cv2.line(frame, (body_pt2[0] - 8 + torso_offset_x, body_pt1[1] + 15), (hand_x, hand_y), shirt_color, max(3, int(bh*0.08)))
            cv2.circle(frame, (hand_x, hand_y), max(3, int(bh * 0.05)), (170, 195, 220), -1)
            # Pen
            cv2.line(frame, (hand_x, hand_y), (hand_x + 6, hand_y - 8), (20, 20, 20), 2)

            # Mobile Phone (if triggered on B02)
            if show_phone:
                phone_x = student_cx + 12
                phone_y = desk_y1 + 10
                cv2.rectangle(frame, (phone_x, phone_y), (phone_x + 18, phone_y + 32), (15, 15, 20), -1)
                cv2.rectangle(frame, (phone_x + 2, phone_y + 2), (phone_x + 16, phone_y + 26), (180, 220, 255), -1) # Glowing screen

        # 3. Realistic CCTV Camera Timestamp & HUD Overlay
        mins = int(current_sec // 60)
        secs = int(current_sec % 60)
        cctv_time = f"2026-09-30 10:30:{secs:02d}.{int((frame_idx % fps)*3.3):02d}"

        # CCTV Dark banner bar
        cv2.rectangle(frame, (0, 0), (width, 32), (10, 10, 15), -1)
        cv2.circle(frame, (20, 16), 6, (0, 0, 255), -1)
        cv2.putText(frame, "REC  CAM-03 [HALL-A NORTH]", (34, 21),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.52, (255, 255, 255), 1)
        cv2.putText(frame, cctv_time, (width - 270, 21),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.52, (255, 255, 255), 1)

        out.write(frame)

    out.release()
    print(f"[OK] Video generated successfully at: {output_path}")

if __name__ == '__main__':
    generate_exam_hall_cctv()
