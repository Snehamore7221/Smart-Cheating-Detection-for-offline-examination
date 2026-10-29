import json
import subprocess
import os

rois = [
  {
    'id': 's_001',
    'studentName': 'Sneha (S1)',
    'row': 2, 'bench': 2, 'seat': 2,
    'seatId': 'R2-B2-S2',
    'nativeW': 1920, 'nativeH': 1080,
    'roi': {'x': 1060, 'y': 560, 'width': 440, 'height': 380}
  },
  {
    'id': 's_002',
    'studentName': 'Rahul (S2)',
    'row': 2, 'bench': 1, 'seat': 1,
    'seatId': 'R2-B1-S1',
    'nativeW': 1920, 'nativeH': 1080,
    'roi': {'x': 180, 'y': 560, 'width': 440, 'height': 380}
  },
  {
    'id': 's_003',
    'studentName': 'Aarav (S3)',
    'row': 1, 'bench': 2, 'seat': 2,
    'seatId': 'R1-B2-S2',
    'nativeW': 1920, 'nativeH': 1080,
    'roi': {'x': 1060, 'y': 120, 'width': 440, 'height': 380}
  },
  {
    'id': 's_004',
    'studentName': 'Priya (S4)',
    'row': 1, 'bench': 1, 'seat': 1,
    'seatId': 'R1-B1-S1',
    'nativeW': 1920, 'nativeH': 1080,
    'roi': {'x': 180, 'y': 120, 'width': 440, 'height': 380}
  }
]

os.makedirs('data', exist_ok=True)
with open('data/test_rois.json', 'w') as f:
    json.dump(rois, f, indent=2)

video_file = 'data/videos/Final_footage-1793195851441-321695762.mp4'

res = subprocess.run([
    'python', 'cv/video_processor.py',
    '--video', video_file,
    '--id', 'test_final_4rois',
    '--rois', 'data/test_rois.json',
    '--config', json.dumps({
        'min_movement_area': 350,
        'outside_ratio_threshold': 0.25,
        'min_persistence_frames': 3
    })
], capture_output=True, text=True)

print('Exit code:', res.returncode)
lines = res.stdout.strip().split('\n')
print('Stdout lines count:', len(lines))
for line in lines:
    if any(k in line for k in ['INIT', 'COMPLETED', 'INCIDENT', 'BOUNDARY', 'NEIGHBOR', 'ERROR']):
        print(line)

print('\n--- STDERR SAMPLE (last 20 lines) ---')
err_lines = res.stderr.strip().split('\n')
for line in err_lines[-20:]:
    print(line)
