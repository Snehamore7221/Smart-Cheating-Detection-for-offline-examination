try:
    import cv2
    import numpy as np
    OPENCV_AVAILABLE = True
except ImportError:
    OPENCV_AVAILABLE = False

class InteractionDetector:
    """
    Visual cue detector for potential student interactions/proximity/turning around.
    Labels results strictly as "Possible Interaction" (not confirmed talking).
    """
    def __init__(self, max_interaction_dist=250):
        self.max_dist = max_interaction_dist

    def detect_interactions(self, motion_boxes, frame_dimensions):
        """
        Calculates spatial proximity and motion vectors between neighboring student desks
        """
        if not motion_boxes:
            return []

        height, width = frame_dimensions[:2]
        interactions = []

        centers = []
        for (x, y, w, h) in motion_boxes:
            cx = x + w // 2
            cy = y + h // 2
            centers.append({'cx': cx, 'cy': cy, 'x': x, 'y': y, 'w': w, 'h': h})

        # Pairwise check for motion spanning neighboring rows or columns (e.g. turning back B04 <-> B06)
        for i in range(len(centers)):
            for j in range(i + 1, len(centers)):
                c1 = centers[i]
                c2 = centers[j]

                dist = ((c1['cx'] - c2['cx']) ** 2 + (c1['cy'] - c2['cy']) ** 2) ** 0.5

                if dist < self.max_dist:
                    mid_x = (c1['cx'] + c2['cx']) // 2
                    mid_y = (c1['cy'] + c2['cy']) // 2
                    interactions.append({
                        'x': mid_x,
                        'y': mid_y,
                        'distance': round(dist, 1),
                        'activityType': 'Possible Interaction'
                    })

        return interactions
