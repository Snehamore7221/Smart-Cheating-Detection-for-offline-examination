import React, { createContext, useContext, useState, useEffect } from 'react';
import examService, {
  DEFAULT_CV_THRESHOLDS,
  DEFAULT_MANUAL_STUDENTS
} from '../services/examService';

const ExamContext = createContext(null);

export const ExamProvider = ({ children }) => {
  // 1. Faculty User State
  const [facultyUser, setFacultyUser] = useState(() => {
    const saved = localStorage.getItem('smart_exam_faculty');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return { name: 'Prof. Invigilator', email: 'faculty@exam.edu', role: 'FACULTY' };
  });

  // 2. Video State
  const [video, setVideo] = useState({
    file: null,
    name: 'examination_cctv_footage.mp4',
    url: null,
    duration: 330, // 05:30 min
    currentTime: 0,
    seekTarget: null
  });

  // 3. Manually Configured Student ROIs (No automatic mapping)
  const [studentROIs, setStudentROIs] = useState(() => {
    const saved = localStorage.getItem('smart_exam_manual_rois');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Detect corrupted legacy state where all students were accidentally overwritten to Row 1, Bench 1, Seat 1
          const isCorruptedDuplicate =
            parsed.length > 1 &&
            parsed.every((s) => Number(s.row) === 1 && Number(s.bench) === 1 && Number(s.seat) === 1);

          if (isCorruptedDuplicate) {
            console.warn('[ExamContext] Recovered from legacy duplicated seating bug. Loaded distinct student ROIs.');
            return DEFAULT_MANUAL_STUDENTS;
          }

          // Ensure each student has a guaranteed immutable unique ID
          return parsed.map((s, idx) => ({
            ...s,
            id: s.id || `s_${String(idx + 1).padStart(3, '0')}`,
            nativeW: s.nativeW || 1920,
            nativeH: s.nativeH || 1080
          }));
        }
      } catch (e) {}
    }
    return DEFAULT_MANUAL_STUDENTS;
  });

  // Persist student ROIs to local storage
  useEffect(() => {
    try {
      localStorage.setItem('smart_exam_manual_rois', JSON.stringify(studentROIs));
    } catch (e) {}
  }, [studentROIs]);

  // 4. Manual Drawing & ROI Edit State
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [pendingDrawnROI, setPendingDrawnROI] = useState(null); // { x, y, width, height, pctX, pctY, pctW, pctH }
  const [editingStudent, setEditingStudent] = useState(null); // Student being edited in modal
  const [hoveredStudentId, setHoveredStudentId] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [showOverlayOnVideo, setShowOverlayOnVideo] = useState(true);
  const [visualContours, setVisualContours] = useState([]); // Visual debug contours

  // 5. Traditional CV Thresholds
  const [cvThresholds, setCvThresholds] = useState(DEFAULT_CV_THRESHOLDS);

  // 6. Incidents & Detection State (Persistent in DB & Local Cache)
  const [incidents, setIncidents] = useState(() => {
    const saved = localStorage.getItem('smart_exam_incidents');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  // Persist incidents
  useEffect(() => {
    try {
      localStorage.setItem('smart_exam_incidents', JSON.stringify(incidents));
    } catch (e) {}
  }, [incidents]);

  // Fetch initial incidents from backend if available
  useEffect(() => {
    let isMounted = true;
    examService.fetchIncidentsFromDB().then((dbIncidents) => {
      if (isMounted && Array.isArray(dbIncidents) && dbIncidents.length > 0) {
        setIncidents(dbIncidents);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const [detectionState, setDetectionState] = useState('idle'); // 'idle' | 'processing' | 'completed' | 'failed'
  const [detectionProgress, setDetectionProgress] = useState(null);
  const [detectionError, setDetectionError] = useState(null);
  const [detectionSummary, setDetectionSummary] = useState(null);
  const [activeAlert, setActiveAlert] = useState(null);
  const [selectedIncidentForModal, setSelectedIncidentForModal] = useState(null);

  // Sync visual states for each manually defined student ROI independently
  useEffect(() => {
    setStudentROIs((prevROIs) => {
      return prevROIs.map((s) => {
        const studentIncidents = incidents.filter(
          (inc) =>
            inc.seatId === s.seatId ||
            inc.studentName === s.studentName ||
            (inc.row === s.row && inc.bench === s.bench && inc.seat === s.seat)
        );

        const isCurrentlyViolating = studentIncidents.some(
          (inc) => Math.abs(inc.timeSec - video.currentTime) <= 3.0
        );

        let vState = 'NORMAL';
        if (isCurrentlyViolating) {
          vState = 'FLAGGED';
        } else if (studentIncidents.length > 0) {
          vState = 'MOVEMENT';
        }

        return {
          ...s,
          visualState: vState,
          incidentsCount: studentIncidents.length,
          lastIncident: studentIncidents[studentIncidents.length - 1] || null
        };
      });
    });
  }, [incidents, video.currentTime]);

  // Auth Methods
  const loginFaculty = (email, password) => {
    const user = {
      name: email.split('@')[0]
        ? `Prof. ${email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)}`
        : 'Prof. Invigilator',
      email: email || 'faculty@exam.edu',
      role: 'FACULTY'
    };
    setFacultyUser(user);
    localStorage.setItem('smart_exam_faculty', JSON.stringify(user));
    return true;
  };

  const logoutFaculty = () => {
    setFacultyUser(null);
    localStorage.removeItem('smart_exam_faculty');
  };

  // Video Methods
  const handleUploadVideo = (file) => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setVideo({
      file,
      name: file.name,
      url: objectUrl,
      duration: 330,
      currentTime: 0,
      seekTarget: 0
    });
    setDetectionState('idle');
  };

  const handleSeekVideo = (seconds, studentId = null) => {
    setVideo((prev) => ({
      ...prev,
      currentTime: seconds,
      seekTarget: seconds
    }));
    if (studentId) {
      setSelectedStudentId(studentId);
      setHoveredStudentId(studentId);
    }
  };

  // Manual Student ROI Management Methods
  const addStudentROI = (newStudentData) => {
    const formatted = examService.createStudentROI(
      newStudentData,
      newStudentData.nativeW || 1920,
      newStudentData.nativeH || 1080
    );
    setStudentROIs((prev) => [...prev, formatted]);
    setIsDrawingMode(false);
    setPendingDrawnROI(null);
  };

  const updateStudentROI = (studentId, updatedData) => {
    setStudentROIs((prev) =>
      prev.map((s) => {
        // Strictly match by immutable unique ID only - never match by shared seatId
        if (s.id === studentId) {
          const row = Number(updatedData.row !== undefined ? updatedData.row : s.row) || 1;
          const bench = Number(updatedData.bench !== undefined ? updatedData.bench : s.bench) || 1;
          const seat = Number(updatedData.seat !== undefined ? updatedData.seat : s.seat) || 1;
          const seatId = `R${row}-B${bench}-S${seat}`;

          const roi = updatedData.roi || s.roi;
          const nativeW = s.nativeW || 1920;
          const nativeH = s.nativeH || 1080;

          return {
            ...s,
            studentName: (updatedData.studentName !== undefined ? updatedData.studentName : s.studentName).trim(),
            row,
            bench,
            seat,
            seatId,
            benchId: `B${String(bench).padStart(2, '0')}`,
            nativeW,
            nativeH,
            roi,
            pctX: (roi.x / nativeW) * 100,
            pctY: (roi.y / nativeH) * 100,
            pctW: (roi.width / nativeW) * 100,
            pctH: (roi.height / nativeH) * 100
          };
        }
        return s;
      })
    );

    // Also update matching incident logs for this specific student
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.studentId === studentId) {
          return {
            ...inc,
            studentName: updatedData.studentName || inc.studentName,
            row: updatedData.row !== undefined ? updatedData.row : inc.row,
            bench: updatedData.bench !== undefined ? updatedData.bench : inc.bench,
            seat: updatedData.seat !== undefined ? updatedData.seat : inc.seat
          };
        }
        return inc;
      })
    );

    setEditingStudent(null);
  };

  const removeStudentROI = (studentId) => {
    // Strictly filter by student ID
    setStudentROIs((prev) => prev.filter((s) => s.id !== studentId));
    setIncidents((prev) => prev.filter((inc) => inc.studentId !== studentId));
    if (selectedStudentId === studentId) setSelectedStudentId(null);
    if (hoveredStudentId === studentId) setHoveredStudentId(null);
  };

  const clearAllStudentROIs = () => {
    setStudentROIs([]);
    setSelectedStudentId(null);
    setHoveredStudentId(null);
  };

  const resetToDefaultROIs = () => {
    setStudentROIs(DEFAULT_MANUAL_STUDENTS);
  };

  // Clear Flagged Incidents (Leaves student ROIs intact)
  const clearAllIncidents = async () => {
    try {
      await examService.clearAllIncidentsDB();
    } catch (e) {
      console.warn('Failed clearing incidents in DB:', e);
    }
    setIncidents([]);
    setActiveAlert(null);
    setVisualContours([]);
    setSelectedIncidentForModal(null);
    localStorage.removeItem('smart_exam_incidents');
    return true;
  };

  // Update CV Thresholds (Traditional CV Parameters)
  const updateCVThresholds = (newThresholds) => {
    setCvThresholds((prev) => ({ ...prev, ...newThresholds }));
  };

  // Start Traditional CV Movement & Boundary Detection Pipeline
  const startMovementDetection = async () => {
    if (studentROIs.length === 0) {
      alert('Please manually draw at least one student ROI on the video first.');
      return;
    }

    // Reset previous run and clear stale data
    setDetectionState('processing');
    setDetectionError(null);
    setDetectionSummary(null);
    setIncidents([]);
    setActiveAlert(null);
    setVisualContours([]);
    setDetectionProgress({ percent: 5, currentFrame: 0, totalFrames: 0, message: 'Initiating OpenCV analysis...' });

    try {
      const result = await examService.runMovementDetection(
        video,
        studentROIs,
        cvThresholds,
        (prog) => {
          setDetectionProgress(prog);
        }
      );

      if (result.success) {
        setIncidents(result.incidents || []);
        if (result.visualContours) {
          setVisualContours(result.visualContours);
        }
        setDetectionState('completed');
        setDetectionSummary({
          incidentsCount: (result.incidents || []).length,
          message: result.message || 'Detection completed successfully.'
        });

        if (result.incidents && result.incidents.length > 0) {
          const first = result.incidents[0];
          setActiveAlert({
            studentName: first.studentName,
            row: first.row,
            bench: first.bench,
            seat: first.seat,
            seatId: first.seatId,
            type: first.type,
            outsideRatio: first.outsideRatio,
            duration: first.duration,
            relatedStudent: first.relatedStudent,
            timestamp: first.timestamp
          });
        }
      } else {
        setDetectionState('failed');
        setDetectionError(result.message || 'Detection failed to complete.');
      }
    } catch (err) {
      console.error('[OpenCV Movement Detection Error]:', err);
      setDetectionState('failed');
      setDetectionError(err.message || 'Computer Vision detection encountered an unexpected error.');
    }
  };

  return (
    <ExamContext.Provider
      value={{
        facultyUser,
        loginFaculty,
        logoutFaculty,
        video,
        handleUploadVideo,
        handleSeekVideo,
        studentROIs,
        addStudentROI,
        updateStudentROI,
        removeStudentROI,
        clearAllStudentROIs,
        resetToDefaultROIs,
        isDrawingMode,
        setIsDrawingMode,
        pendingDrawnROI,
        setPendingDrawnROI,
        editingStudent,
        setEditingStudent,
        hoveredStudentId,
        setHoveredStudentId,
        selectedStudentId,
        setSelectedStudentId,
        showOverlayOnVideo,
        setShowOverlayOnVideo,
        visualContours,
        setVisualContours,
        cvThresholds,
        updateCVThresholds,
        incidents,
        setIncidents,
        clearAllIncidents,
        detectionState,
        detectionProgress,
        detectionError,
        detectionSummary,
        startMovementDetection,
        activeAlert,
        setActiveAlert,
        selectedIncidentForModal,
        setSelectedIncidentForModal
      }}
    >
      {children}
    </ExamContext.Provider>
  );
};

export const useExam = () => {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error('useExam must be used within an ExamProvider');
  }
  return context;
};
