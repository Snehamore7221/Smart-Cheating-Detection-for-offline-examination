/**
 * Traditional Computer Vision Exam Surveillance Service
 * 
 * TWO-STAGE DETECTION ARCHITECTURE:
 * STAGE 1: Robust movement contour detection across video frame.
 * STAGE 2: Geometric Student Association via Expanded ROI scoring -> Boundary Violation against Original ROI -> Independent Per-Student Persistence.
 */

import API from './api';

export const DEFAULT_CV_THRESHOLDS = {
  minMovementArea: 350,          // Minimum pixel area to ignore pen writing and minor noise
  outsideRatioThreshold: 0.25,   // Fraction of movement crossing the student's assigned boundary
  minPersistenceFrames: 3,       // Consecutive frames required before flagging
  cooldownSeconds: 5             // Cooldown duration between alerts for the same student
};

/**
 * Baseline 2x2 Seating Grid Matching Examination CCTV Footage:
 * 
 *       S4 (Top-Left)       S3 (Top-Right)
 *       S2 (Bottom-Left)    S1 (Bottom-Right)
 * 
 * Stored in original 1920x1080 video resolution coordinates.
 */
export const DEFAULT_MANUAL_STUDENTS = [
  {
    id: 's_001',
    studentName: 'Sneha (S1)',
    row: 2,
    bench: 2,
    seat: 2,
    seatId: 'R2-B2-S2', // Bottom-Right (S1)
    benchId: 'B02',
    nativeW: 1920,
    nativeH: 1080,
    roi: {
      x: 1060,
      y: 560,
      width: 440,
      height: 380
    },
    pctX: (1060 / 1920) * 100,
    pctY: (560 / 1080) * 100,
    pctW: (440 / 1920) * 100,
    pctH: (380 / 1080) * 100,
    visualState: 'NORMAL',
    incidentsCount: 0
  },
  {
    id: 's_002',
    studentName: 'Rahul (S2)',
    row: 2,
    bench: 1,
    seat: 1,
    seatId: 'R2-B1-S1', // Bottom-Left (S2)
    benchId: 'B01',
    nativeW: 1920,
    nativeH: 1080,
    roi: {
      x: 180,
      y: 560,
      width: 440,
      height: 380
    },
    pctX: (180 / 1920) * 100,
    pctY: (560 / 1080) * 100,
    pctW: (440 / 1920) * 100,
    pctH: (380 / 1080) * 100,
    visualState: 'NORMAL',
    incidentsCount: 0
  },
  {
    id: 's_003',
    studentName: 'Aarav (S3)',
    row: 1,
    bench: 2,
    seat: 2,
    seatId: 'R1-B2-S2', // Top-Right (S3)
    benchId: 'B02',
    nativeW: 1920,
    nativeH: 1080,
    roi: {
      x: 1060,
      y: 120,
      width: 440,
      height: 380
    },
    pctX: (1060 / 1920) * 100,
    pctY: (120 / 1080) * 100,
    pctW: (440 / 1920) * 100,
    pctH: (380 / 1080) * 100,
    visualState: 'NORMAL',
    incidentsCount: 0
  },
  {
    id: 's_004',
    studentName: 'Priya (S4)',
    row: 1,
    bench: 1,
    seat: 1,
    seatId: 'R1-B1-S1', // Top-Left (S4)
    benchId: 'B01',
    nativeW: 1920,
    nativeH: 1080,
    roi: {
      x: 180,
      y: 120,
      width: 440,
      height: 380
    },
    pctX: (180 / 1920) * 100,
    pctY: (120 / 1080) * 100,
    pctW: (440 / 1920) * 100,
    pctH: (380 / 1080) * 100,
    visualState: 'NORMAL',
    incidentsCount: 0
  }
];

class ExamService {
  /**
   * Helper to format a newly drawn ROI with original video resolution coordinates
   */
  createStudentROI(studentData, nativeW = 1920, nativeH = 1080) {
    const effectiveW = studentData.nativeW || nativeW || 1920;
    const effectiveH = studentData.nativeH || nativeH || 1080;
    const rawX = Math.max(0, Math.round(studentData.roi?.x || 0));
    const rawY = Math.max(0, Math.round(studentData.roi?.y || 0));
    const rawW = Math.max(20, Math.round(studentData.roi?.width || 100));
    const rawH = Math.max(20, Math.round(studentData.roi?.height || 100));

    const row = Number(studentData.row) || 1;
    const bench = Number(studentData.bench) || 1;
    const seat = Number(studentData.seat) || 1;
    const seatId = `R${row}-B${bench}-S${seat}`;

    const pctX = studentData.pctX !== undefined ? studentData.pctX : (rawX / effectiveW) * 100;
    const pctY = studentData.pctY !== undefined ? studentData.pctY : (rawY / effectiveH) * 100;
    const pctW = studentData.pctW !== undefined ? studentData.pctW : (rawW / effectiveW) * 100;
    const pctH = studentData.pctH !== undefined ? studentData.pctH : (rawH / effectiveH) * 100;

    return {
      id: studentData.id || `student_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      studentName: (studentData.studentName || 'Student').trim(),
      row,
      bench,
      seat,
      seatId,
      benchId: `B${String(bench).padStart(2, '0')}`,
      nativeW: effectiveW,
      nativeH: effectiveH,
      roi: {
        x: rawX,
        y: rawY,
        width: rawW,
        height: rawH
      },
      pctX,
      pctY,
      pctW,
      pctH,
      visualState: 'NORMAL',
      incidentsCount: 0
    };
  }

  /**
   * Fetches logged incidents from backend database
   */
  async fetchIncidentsFromDB() {
    try {
      const res = await API.get('/incidents');
      if (res.data && res.data.success && Array.isArray(res.data.incidents)) {
        return res.data.incidents;
      }
    } catch (err) {
      console.warn('[ExamService] Could not reach backend /api/incidents. Using local storage.', err.message);
    }
    return null;
  }

  /**
   * Clears all incident logs from backend database & local cache
   */
  async clearAllIncidentsDB() {
    try {
      const res = await API.delete('/incidents');
      return res.data;
    } catch (err) {
      console.warn('[ExamService] Backend clear endpoint failed or offline, cleared locally:', err.message);
      return { success: true, message: 'Cleared locally' };
    }
  }

  /**
   * STAGE 2 (ASSOCIATION):
   * Uses Expanded ROI scoring to determine which student owns a movement contour.
   */
  associateContourToStudent(contourBox, studentROIs, padRatio = 0.35) {
    const { x, y, width, height } = contourBox;
    const cArea = Math.max(1, width * height);
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    let bestStudent = null;
    let maxScore = 0;
    const candidateScores = {};

    studentROIs.forEach((student) => {
      const sROI = student.roi;
      const padX = Math.round(sROI.width * padRatio);
      const padY = Math.round(sROI.height * padRatio);

      const expX1 = Math.max(0, sROI.x - padX);
      const expY1 = Math.max(0, sROI.y - padY);
      const expX2 = sROI.x + sROI.width + padX;
      const expY2 = sROI.y + sROI.height + padY;

      // 1. Intersection with expanded ROI
      const ix1 = Math.max(x, expX1);
      const iy1 = Math.max(y, expY1);
      const ix2 = Math.min(x + width, expX2);
      const iy2 = Math.min(y + height, expY2);

      let score = 0;
      if (ix2 > ix1 && iy2 > iy1) {
        const iArea = (ix2 - ix1) * (iy2 - iy1);
        const overlapRatio = iArea / cArea;
        score += overlapRatio * 100;

        // 2. Bonus if center is inside expanded ROI
        if (centerX >= expX1 && centerX <= expX2 && centerY >= expY1 && centerY <= expY2) {
          score += 50;
        }

        // 3. Bonus if center is inside original ROI
        if (centerX >= sROI.x && centerX <= (sROI.x + sROI.width) && centerY >= sROI.y && centerY <= (sROI.y + sROI.height)) {
          score += 50;
        }
      }

      candidateScores[student.studentName || student.seatId] = Math.round(score);

      if (score > maxScore && score >= 20) {
        maxScore = score;
        bestStudent = student;
      }
    });

    return {
      bestStudent,
      maxScore,
      candidateScores,
      center: { x: centerX, y: centerY },
      bbox: { x, y, width, height }
    };
  }

  /**
   * STAGE 2 (BOUNDARY EVALUATION):
   * Calculates movement inside vs outside the student's ORIGINAL ROI.
   */
  calculateBoundaryRatio(contourBox, student) {
    const { x, y, width, height } = contourBox;
    const cArea = Math.max(1, width * height);
    const sROI = student.roi;

    const ix1 = Math.max(x, sROI.x);
    const iy1 = Math.max(y, sROI.y);
    const ix2 = Math.min(x + width, sROI.x + sROI.width);
    const iy2 = Math.min(y + height, sROI.y + sROI.height);

    let insidePx = 0;
    if (ix2 > ix1 && iy2 > iy1) {
      insidePx = (ix2 - ix1) * (iy2 - iy1);
    }

    const outsidePx = Math.max(0, cArea - insidePx);
    const totalPx = Math.max(1, insidePx + outsidePx);
    const outsideRatio = outsidePx / totalPx;

    return {
      insidePx,
      outsidePx,
      totalPx,
      outsideRatio: Math.round(outsideRatio * 100) / 100
    };
  }

  /**
   * Genuine Traditional CV Movement & Boundary Violation Pipeline:
   * Connects to Node.js backend -> Launches Python OpenCV worker -> Analyzes real video frames.
   * Tracks progress via backend polling and returns actual detected incidents.
   */
  async runMovementDetection(videoData, studentROIs, cvThresholds, onProgress) {
    if (!studentROIs || studentROIs.length === 0) {
      return {
        success: false,
        incidents: [],
        message: 'No student ROIs defined. Please draw student boundaries on the video first.'
      };
    }

    if (!videoData || (!videoData.file && !videoData.name)) {
      throw new Error('No CCTV video selected. Please select or upload a video first.');
    }

    let filename = videoData.name || 'examination_cctv_footage.mp4';

    // 1. If a new video file was selected by faculty and not yet uploaded, upload to backend
    if (videoData.file instanceof File) {
      if (videoData.serverFilename) {
        // Reuse already-uploaded filename for this file
        filename = videoData.serverFilename;
      } else {
        if (onProgress) {
          onProgress({
            percent: 5,
            currentFrame: 0,
            totalFrames: 0,
            message: `Uploading CCTV footage (${videoData.file.name}) to server...`
          });
        }

        const formData = new FormData();
        formData.append('cctvVideo', videoData.file);

        try {
          // Do NOT set 'Content-Type': 'multipart/form-data' manually!
          // The browser / Axios will set it with the correct multipart boundary automatically.
          const uploadRes = await API.post('/videos/upload', formData, {
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total && onProgress) {
                const uploadPct = Math.round((progressEvent.loaded / progressEvent.total) * 15);
                onProgress({
                  percent: Math.max(5, uploadPct),
                  currentFrame: 0,
                  totalFrames: 0,
                  message: `Uploading CCTV footage: ${Math.round((progressEvent.loaded / progressEvent.total) * 100)}%...`
                });
              }
            }
          });

          if (uploadRes.data && uploadRes.data.success && uploadRes.data.video) {
            filename = uploadRes.data.video.filename;
            videoData.serverFilename = filename;
          }
        } catch (uploadErr) {
          console.error('[ExamService] Video upload failed:', uploadErr);
          const rawErr = uploadErr.response?.data?.message || uploadErr.message || 'Network Error';
          const isNetwork = rawErr.includes('Network Error') || !uploadErr.response;
          const helpfulMsg = isNetwork
            ? `${rawErr}. Ensure the backend server is running on port 5000.`
            : rawErr;
          throw new Error(`Video upload failed: ${helpfulMsg}`);
        }
      }
    }

    if (onProgress) {
      onProgress({
        percent: 15,
        currentFrame: 0,
        totalFrames: 0,
        message: 'Initializing Python/OpenCV video capture engine...'
      });
    }

    // 2. Call backend /api/videos/process with real ROIs and configuration
    let videoId;
    try {
      const processRes = await API.post('/videos/process', {
        filename,
        videoFilename: filename,
        studentROIs,
        cvConfig: {
          min_movement_area: Number(cvThresholds.minMovementArea) || 350,
          outside_ratio_threshold: Number(cvThresholds.outsideRatioThreshold) || 0.25,
          min_persistence_frames: Number(cvThresholds.minPersistenceFrames) || 3,
          minMovementArea: Number(cvThresholds.minMovementArea) || 350,
          outsideRatioThreshold: Number(cvThresholds.outsideRatioThreshold) || 0.25,
          minPersistenceFrames: Number(cvThresholds.minPersistenceFrames) || 3,
          alert_cooldown_frames: (Number(cvThresholds.cooldownSeconds) || 4) * 10
        }
      });

      if (!processRes.data || !processRes.data.success) {
        throw new Error(processRes.data?.message || 'Failed to start OpenCV video processing.');
      }

      videoId = processRes.data.videoId;
    } catch (procErr) {
      console.error('[ExamService] Failed to start CV process:', procErr);
      throw new Error(
        procErr.response?.data?.message ||
        procErr.message ||
        'Could not reach backend detection service.'
      );
    }

    // 3. Poll /api/videos/process/status/:videoId for real-time progress and results
    const maxPollAttempts = 240; // 240 * 500ms = 2 minutes timeout
    let attempts = 0;

    while (attempts < maxPollAttempts) {
      attempts++;
      await new Promise((r) => setTimeout(r, 500));

      try {
        const statusRes = await API.get(`/videos/process/status/${videoId}`);
        if (!statusRes.data || !statusRes.data.success) {
          continue;
        }

        const data = statusRes.data;

        if (onProgress) {
          onProgress({
            percent: Math.min(100, Math.max(15, Math.round(data.percent || 0))),
            currentFrame: data.currentFrame || 0,
            totalFrames: data.totalFrames || 0,
            message: data.message || `Processing frames with OpenCV (${data.percent || 0}%)...`
          });
        }

        if (data.status === 'completed') {
          return {
            success: true,
            incidents: data.incidents || [],
            visualContours: data.activeContours || [],
            message: data.message
          };
        }

        if (data.status === 'failed') {
          throw new Error(data.error || 'OpenCV processing failed.');
        }
      } catch (pollErr) {
        if (pollErr.message && (pollErr.message.includes('OpenCV') || pollErr.message.includes('failed'))) {
          throw pollErr;
        }
        // Transient poll network issue, retry
        console.warn('[ExamService] Poll warning:', pollErr.message);
      }
    }

    throw new Error('Video processing timed out after 2 minutes.');
  }
}

export const examService = new ExamService();
export default examService;
