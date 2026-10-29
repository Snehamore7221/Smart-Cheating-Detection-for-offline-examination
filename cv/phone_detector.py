try:
    import cv2
    import numpy as np
    OPENCV_AVAILABLE = True
except ImportError:
    OPENCV_AVAILABLE = False

# ---------------------------------------------------------------------------
# PHONE DETECTOR THRESHOLDS
# ---------------------------------------------------------------------------
PHONE_THRESHOLDS = {
    # Minimum contour area in pixels. Must be large enough to represent a real
    # phone held by a student, not a pen tip or paper edge.
    "min_area": 1200,

    # Maximum contour area. Very large rectangles are desks/walls, not phones.
    "max_area": 9000,

    # Portrait aspect ratio range (height/width).
    # A phone held portrait: ~1.6 – 2.2
    # A phone held landscape: ~0.45 – 0.65 (handled via inverse check)
    "min_aspect_portrait": 1.5,
    "max_aspect_portrait": 2.3,

    # Landscape phone (turned sideways)
    "min_aspect_landscape": 0.43,
    "max_aspect_landscape": 0.67,

    # How "rectangular" the contour must be:
    # extent = contour_area / bounding_rect_area
    # Phones are rectangular → extent should be high (0.6+)
    "min_extent": 0.60,

    # Skip any detection whose centre is in the TOP fraction of the frame.
    # Ceiling fixtures, signs, and upper-wall objects are in this zone.
    # 0.25 means ignore the top 25% of frame height.
    "ignore_top_fraction": 0.20,

    # Skip any detection whose centre is in the BOTTOM fraction of the frame.
    # Floor-level noise / desk-edge artefacts.
    "ignore_bottom_fraction": 0.05,
}
# ---------------------------------------------------------------------------


class PhoneDetector:
    """
    Conservative mobile phone visual-cue detector for exam hall CCTV.

    Uses contour shape analysis (aspect ratio + rectangularity) on the
    student seating zone only (ignoring ceiling / walls / floor).

    Does NOT use a pretrained model — purely geometric heuristics.
    Designed to reduce false positives from everyday exam-hall objects
    (pens, rulers, erasers, paper corners).
    """

    def __init__(self):
        self.is_initialized = OPENCV_AVAILABLE
        cfg = PHONE_THRESHOLDS
        self.min_area         = cfg["min_area"]
        self.max_area         = cfg["max_area"]
        self.min_ar_portrait  = cfg["min_aspect_portrait"]
        self.max_ar_portrait  = cfg["max_aspect_portrait"]
        self.min_ar_landscape = cfg["min_aspect_landscape"]
        self.max_ar_landscape = cfg["max_aspect_landscape"]
        self.min_extent       = cfg["min_extent"]
        self.ignore_top       = cfg["ignore_top_fraction"]
        self.ignore_bottom    = cfg["ignore_bottom_fraction"]

    def detect_phones(self, frame):
        """
        Returns list of candidate bounding boxes in the student seating zone:
            [(x, y, w, h, confidence), ...]

        Returns empty list when nothing credible is found.
        """
        if not self.is_initialized or frame is None:
            return []

        frame_h, frame_w = frame.shape[:2]

        # Define the valid detection zone (student seating area only)
        zone_top    = int(frame_h * self.ignore_top)
        zone_bottom = int(frame_h * (1.0 - self.ignore_bottom))

        # Crop to student zone before analysis
        roi = frame[zone_top:zone_bottom, 0:frame_w]

        gray    = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (7, 7), 0)
        edges   = cv2.Canny(blurred, 60, 160)

        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        candidates  = []

        for c in contours:
            area = cv2.contourArea(c)
            if area < self.min_area or area > self.max_area:
                continue

            bx, by, bw, bh = cv2.boundingRect(c)

            # Extent check — contour should fill most of its bounding box
            extent = area / float(bw * bh) if bw * bh > 0 else 0
            if extent < self.min_extent:
                continue

            aspect = float(bh) / bw if bw > 0 else 0

            is_portrait  = self.min_ar_portrait  <= aspect <= self.max_ar_portrait
            is_landscape = self.min_ar_landscape <= aspect <= self.max_ar_landscape

            if not (is_portrait or is_landscape):
                continue

            # Translate coordinates back to full-frame space
            fy = by + zone_top
            confidence = round(min(0.92, 0.55 + (area / self.max_area) * 0.37), 2)
            candidates.append((bx, fy, bw, bh, confidence))

        return candidates
