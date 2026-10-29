import cv2

video_path = 'data/videos/Final footage.mp4'
cap = cv2.VideoCapture(video_path)
fps = cap.get(cv2.CAP_PROP_FPS) or 24.0
w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
print(f'Video: {w}x{h} @ {fps}fps')

# S2 ROI in 848x478 space (scaled from 1920x1080 default: x: 180, y: 560, w: 440, h: 380)
s2_x1 = 79
s2_y1 = 248
s2_w = 194
s2_h = 168
s2_x2 = s2_x1 + s2_w
s2_y2 = s2_y1 + s2_h
print(f'S2 ROI: ({s2_x1}, {s2_y1}) to ({s2_x2}, {s2_y2}) [w={s2_w}, h={s2_h}]')

pad_x = int(s2_w * 0.35)
pad_y = int(s2_h * 0.35)
exp_x1 = max(0, s2_x1 - pad_x)
exp_y1 = max(0, s2_y1 - pad_y)
exp_x2 = min(w, s2_x2 + pad_x)
exp_y2 = min(h, s2_y2 + pad_y)
print(f'S2 Expanded ROI: ({exp_x1}, {exp_y1}) to ({exp_x2}, {exp_y2})')

bg = cv2.createBackgroundSubtractorMOG2(history=120, varThreshold=25, detectShadows=False)
kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
prev_gray = None

frame_idx = 0
s2_events = []

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break
    frame_idx += 1
    current_sec = frame_idx / fps
    
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (15, 15), 0)
    fg_mog2 = bg.apply(frame)
    
    if prev_gray is None:
        prev_gray = blurred
        continue
    
    delta = cv2.absdiff(prev_gray, blurred)
    prev_gray = blurred
    _, delta_th = cv2.threshold(delta, 25, 255, cv2.THRESH_BINARY)
    combined = cv2.bitwise_or(delta_th, fg_mog2)
    cleaned = cv2.morphologyEx(combined, cv2.MORPH_OPEN, kernel)
    cleaned = cv2.dilate(cleaned, kernel, iterations=2)
    
    # Skip warmup
    if frame_idx <= 12:
        continue
        
    contours, _ = cv2.findContours(cleaned, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    for c in contours:
        c_area = cv2.contourArea(c)
        if c_area < 350 or c_area > w * h * 0.6:
            continue
        bx, by, bw, bh = cv2.boundingRect(c)
        cx = bx + bw // 2
        cy = by + bh // 2
        
        # Check intersection with S2 expanded ROI
        ix1 = max(bx, exp_x1)
        iy1 = max(by, exp_y1)
        ix2 = min(bx + bw, exp_x2)
        iy2 = min(by + bh, exp_y2)
        
        if ix2 > ix1 and iy2 > iy1:
            overlap = (ix2 - ix1) * (iy2 - iy1)
            # Intersection with original ROI
            ox1 = max(bx, s2_x1)
            oy1 = max(by, s2_y1)
            ox2 = min(bx + bw, s2_x2)
            oy2 = min(by + bh, s2_y2)
            inside = max(0, (ox2 - ox1) * (oy2 - oy1)) if (ox2 > ox1 and oy2 > oy1) else 0
            outside = max(0, c_area - inside)
            outside_ratio = outside / float(c_area)
            s2_events.append((frame_idx, current_sec, c_area, bx, by, bw, bh, cx, cy, inside, outside, outside_ratio))

print(f'Total S2 qualifying motion observations: {len(s2_events)}')
for ev in s2_events:
    f_idx, sec, area, bx, by, bw, bh, cx, cy, inside, outside, out_ratio = ev
    if out_ratio >= 0.20:
        print(f'Frame {f_idx:3d} ({sec:5.2f}s): area={area:6.0f}, bbox=({bx:3d},{by:3d},{bw:3d},{bh:3d}), center=({cx:3d},{cy:3d}), outside={out_ratio*100:5.1f}%')
