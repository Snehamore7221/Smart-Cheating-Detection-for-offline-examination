/**
 * Detection Service (Pluggable Computer Vision / Phone Detection API Layer)
 * 
 * Architecture:
 * Frontend UI  <--->  DetectionService  <--->  [Mock Engine / YOLO Backend API]
 * 
 * To connect a live FastAPI/YOLO model later, simply replace the mock handlers
 * in this service with your backend endpoints (e.g. axios.post('/api/yolo/detect')).
 */

export const INITIAL_CAMERAS = [
  {
    id: 'CAM-01',
    name: 'Camera 01 — Room A101',
    room: 'Room A101',
    status: 'Online',
    studentsCount: 32,
    phonesDetected: 2,
    fps: 30,
    resolution: '1080p FHD',
    activeDetections: [
      {
        id: 'DET-01-A',
        studentId: 'STU-012',
        studentName: 'Rahul Sharma',
        seat: 'Seat A12',
        confidence: 96,
        timestamp: '10:14:21',
        timeSec: 4.2,
        box: { x: 42, y: 55, w: 14, h: 22 }, // percentages
        status: 'Confirmed'
      },
      {
        id: 'DET-01-B',
        studentId: 'STU-027',
        studentName: 'Priya Patel',
        seat: 'Seat B04',
        confidence: 91,
        timestamp: '10:19:14',
        timeSec: 9.1,
        box: { x: 70, y: 48, w: 12, h: 20 },
        status: 'Review Required'
      }
    ]
  },
  {
    id: 'CAM-02',
    name: 'Camera 02 — Room A102',
    room: 'Room A102',
    status: 'Online',
    studentsCount: 28,
    phonesDetected: 1,
    fps: 30,
    resolution: '1080p FHD',
    activeDetections: [
      {
        id: 'DET-02-A',
        studentId: 'STU-045',
        studentName: 'Aman Verma',
        seat: 'Seat C08',
        confidence: 88,
        timestamp: '10:22:05',
        timeSec: 15.0,
        box: { x: 55, y: 60, w: 13, h: 21 },
        status: 'Review Required'
      }
    ]
  },
  {
    id: 'CAM-03',
    name: 'Camera 03 — Room A103',
    room: 'Room A103',
    status: 'Online',
    studentsCount: 30,
    phonesDetected: 3,
    fps: 30,
    resolution: '1080p FHD',
    activeDetections: [
      {
        id: 'DET-03-A',
        studentId: 'STU-088',
        studentName: 'Sneha Rao',
        seat: 'Seat A02',
        confidence: 97,
        timestamp: '10:05:40',
        timeSec: 21.3,
        box: { x: 28, y: 52, w: 15, h: 24 },
        status: 'Confirmed'
      },
      {
        id: 'DET-03-B',
        studentId: 'STU-094',
        studentName: 'Karan Mehra',
        seat: 'Seat D11',
        confidence: 84,
        timestamp: '10:11:18',
        timeSec: 28.5,
        box: { x: 62, y: 38, w: 12, h: 19 },
        status: 'Review Required'
      },
      {
        id: 'DET-03-C',
        studentId: 'STU-102',
        studentName: 'Ananya Gupta',
        seat: 'Seat B07',
        confidence: 93,
        timestamp: '10:26:50',
        timeSec: 34.0,
        box: { x: 80, y: 65, w: 14, h: 22 },
        status: 'Confirmed'
      }
    ]
  },
  {
    id: 'CAM-04',
    name: 'Camera 04 — Room A104',
    room: 'Room A104',
    status: 'Online',
    studentsCount: 30,
    phonesDetected: 1,
    fps: 30,
    resolution: '1080p FHD',
    activeDetections: [
      {
        id: 'DET-04-A',
        studentId: 'STU-118',
        studentName: 'Vikram Malhotra',
        seat: 'Seat C03',
        confidence: 89,
        timestamp: '10:18:32',
        timeSec: 42.1,
        box: { x: 35, y: 44, w: 13, h: 20 },
        status: 'Review Required'
      }
    ]
  }
];

export const INITIAL_STUDENTS = [
  { id: 'STU-012', name: 'Rahul Sharma', seat: 'Seat A12', camera: 'CAM-01', room: 'Room A101', detectionsCount: 2, status: 'Review Required', lastDetection: '10:14:21' },
  { id: 'STU-027', name: 'Priya Patel', seat: 'Seat B04', camera: 'CAM-01', room: 'Room A101', detectionsCount: 1, status: 'Review Required', lastDetection: '10:19:14' },
  { id: 'STU-045', name: 'Aman Verma', seat: 'Seat C08', camera: 'CAM-02', room: 'Room A102', detectionsCount: 1, status: 'Review Required', lastDetection: '10:22:05' },
  { id: 'STU-088', name: 'Sneha Rao', seat: 'Seat A02', camera: 'CAM-03', room: 'Room A103', detectionsCount: 1, status: 'Confirmed', lastDetection: '10:05:40' },
  { id: 'STU-094', name: 'Karan Mehra', seat: 'Seat D11', camera: 'CAM-03', room: 'Room A103', detectionsCount: 1, status: 'Review Required', lastDetection: '10:11:18' },
  { id: 'STU-102', name: 'Ananya Gupta', seat: 'Seat B07', camera: 'CAM-03', room: 'Room A103', detectionsCount: 1, status: 'Confirmed', lastDetection: '10:26:50' },
  { id: 'STU-118', name: 'Vikram Malhotra', seat: 'Seat C03', camera: 'CAM-04', room: 'Room A104', detectionsCount: 1, status: 'Review Required', lastDetection: '10:18:32' },
  { id: 'STU-001', name: 'Aarav Mehta', seat: 'Seat A01', camera: 'CAM-01', room: 'Room A101', detectionsCount: 0, status: 'Clear', lastDetection: '-' },
  { id: 'STU-002', name: 'Diya Sen', seat: 'Seat A02', camera: 'CAM-01', room: 'Room A101', detectionsCount: 0, status: 'Clear', lastDetection: '-' },
  { id: 'STU-003', name: 'Rohan Joshi', seat: 'Seat A03', camera: 'CAM-01', room: 'Room A101', detectionsCount: 0, status: 'Clear', lastDetection: '-' },
  { id: 'STU-004', name: 'Ishita Roy', seat: 'Seat A04', camera: 'CAM-01', room: 'Room A101', detectionsCount: 0, status: 'Clear', lastDetection: '-' },
  { id: 'STU-005', name: 'Aditya Das', seat: 'Seat A05', camera: 'CAM-01', room: 'Room A101', detectionsCount: 0, status: 'Clear', lastDetection: '-' },
  { id: 'STU-006', name: 'Tanvi Nair', seat: 'Seat A06', camera: 'CAM-01', room: 'Room A101', detectionsCount: 0, status: 'Clear', lastDetection: '-' },
  { id: 'STU-007', name: 'Manish Kumar', seat: 'Seat A07', camera: 'CAM-01', room: 'Room A101', detectionsCount: 0, status: 'Clear', lastDetection: '-' },
  { id: 'STU-008', name: 'Kavya Pillai', seat: 'Seat A08', camera: 'CAM-01', room: 'Room A101', detectionsCount: 0, status: 'Clear', lastDetection: '-' },
];

export const INITIAL_DETECTION_LOGS = [
  { id: 'D-001', timestamp: '00:04:21', camera: 'CAM-01', studentId: 'STU-012', studentName: 'Rahul Sharma', object: 'Mobile Phone', confidence: 96, status: 'Confirmed', box: { x: 42, y: 55, w: 14, h: 22 } },
  { id: 'D-002', timestamp: '00:09:14', camera: 'CAM-01', studentId: 'STU-027', studentName: 'Priya Patel', object: 'Mobile Phone', confidence: 91, status: 'Review Required', box: { x: 70, y: 48, w: 12, h: 20 } },
  { id: 'D-003', timestamp: '00:15:02', camera: 'CAM-02', studentId: 'STU-045', studentName: 'Aman Verma', object: 'Mobile Phone', confidence: 88, status: 'Review Required', box: { x: 55, y: 60, w: 13, h: 21 } },
  { id: 'D-004', timestamp: '00:21:40', camera: 'CAM-03', studentId: 'STU-088', studentName: 'Sneha Rao', object: 'Mobile Phone', confidence: 97, status: 'Confirmed', box: { x: 28, y: 52, w: 15, h: 24 } },
  { id: 'D-005', timestamp: '00:28:18', camera: 'CAM-03', studentId: 'STU-094', studentName: 'Karan Mehra', object: 'Mobile Phone', confidence: 84, status: 'Review Required', box: { x: 62, y: 38, w: 12, h: 19 } },
  { id: 'D-006', timestamp: '00:34:50', camera: 'CAM-03', studentId: 'STU-102', studentName: 'Ananya Gupta', object: 'Mobile Phone', confidence: 93, status: 'Confirmed', box: { x: 80, y: 65, w: 14, h: 22 } },
  { id: 'D-007', timestamp: '00:42:32', camera: 'CAM-04', studentId: 'STU-118', studentName: 'Vikram Malhotra', object: 'Mobile Phone', confidence: 89, status: 'Review Required', box: { x: 35, y: 44, w: 13, h: 20 } },
];

class DetectionService {
  constructor() {
    this.cameras = [...INITIAL_CAMERAS];
    this.students = [...INITIAL_STUDENTS];
    this.detectionLogs = [...INITIAL_DETECTION_LOGS];
    this.confidenceThreshold = 75; // percentage
  }

  getDashboardStats() {
    const activeCameras = this.cameras.filter(c => c.status === 'Online').length;
    const studentsMonitored = this.students.length > 0 ? 120 : 0;
    const phonesDetected = this.detectionLogs.filter(d => d.status !== 'Dismissed').length;
    const alertsGenerated = phonesDetected;

    return {
      activeCameras,
      studentsMonitored,
      phonesDetected,
      alertsGenerated,
      detectionAccuracy: '94.2%',
      framesAnalyzed: 8420,
      avgConfidence: '91.8%'
    };
  }

  getCameras() {
    return this.cameras;
  }

  getStudents() {
    return this.students;
  }

  getDetections() {
    return this.detectionLogs.filter(d => d.confidence >= this.confidenceThreshold);
  }

  updateDetectionStatus(detectionId, newStatus) {
    this.detectionLogs = this.detectionLogs.map(d => {
      if (d.id === detectionId) {
        return { ...d, status: newStatus };
      }
      return d;
    });
    return this.detectionLogs;
  }

  setConfidenceThreshold(val) {
    this.confidenceThreshold = Number(val);
  }

  getConfidenceThreshold() {
    return this.confidenceThreshold;
  }

  /**
   * Pluggable Video Analysis Runner
   * Simulates AI frame-by-frame inference with realistic progress callbacks
   */
  async processExaminationVideo(file, onProgress) {
    const totalFrames = 8420;
    const steps = 20;
    
    for (let i = 1; i <= steps; i++) {
      await new Promise(r => setTimeout(r, 120)); // simulated frame processing tick
      const progressPercent = Math.min(100, Math.round((i / steps) * 100));
      const currentFrames = Math.round((progressPercent / 100) * totalFrames);
      
      if (onProgress) {
        onProgress({
          percent: progressPercent,
          currentFrames,
          totalFrames,
          stage: progressPercent < 40 
            ? 'Decoding video frames...' 
            : progressPercent < 85 
            ? 'Running Mobile Phone Object Detection (YOLO inference)...' 
            : 'Generating detection timestamps & bounding boxes...'
        });
      }
    }

    return {
      success: true,
      videoName: file?.name || 'examination_hall_cctv_sample.mp4',
      fileSize: file?.size ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : '42.8 MB',
      duration: '00:05:30',
      framesAnalyzed: 8420,
      phonesDetected: 6,
      processingTime: '18.4s',
      accuracy: '95.4%',
      detections: [
        { id: 'D-101', timeSec: 4.2, timestamp: '00:04', camera: 'CAM-01', studentId: 'Student 12', studentName: 'Rahul Sharma', confidence: 96, status: 'Confirmed', box: { x: 42, y: 55, w: 14, h: 22 } },
        { id: 'D-102', timeSec: 9.1, timestamp: '00:09', camera: 'CAM-01', studentId: 'Student 27', studentName: 'Priya Patel', confidence: 91, status: 'Review Required', box: { x: 70, y: 48, w: 12, h: 20 } },
        { id: 'D-103', timeSec: 15.0, timestamp: '00:15', camera: 'CAM-01', studentId: 'Student 12', studentName: 'Rahul Sharma', confidence: 94, status: 'Confirmed', box: { x: 43, y: 54, w: 13, h: 21 } },
        { id: 'D-104', timeSec: 21.3, timestamp: '00:21', camera: 'CAM-01', studentId: 'Student 08', studentName: 'Kavya Pillai', confidence: 89, status: 'Review Required', box: { x: 26, y: 50, w: 15, h: 23 } },
        { id: 'D-105', timeSec: 28.5, timestamp: '00:28', camera: 'CAM-01', studentId: 'Student 94', studentName: 'Karan Mehra', confidence: 92, status: 'Review Required', box: { x: 60, y: 40, w: 12, h: 18 } },
        { id: 'D-106', timeSec: 34.0, timestamp: '00:34', camera: 'CAM-01', studentId: 'Student 102', studentName: 'Ananya Gupta', confidence: 95, status: 'Confirmed', box: { x: 78, y: 64, w: 14, h: 22 } },
      ]
    };
  }

  exportCSV() {
    const headers = ['Detection ID', 'Timestamp', 'Camera', 'Student ID', 'Student Name', 'Object Detected', 'Confidence', 'Status'];
    const rows = this.detectionLogs.map(d => [
      d.id,
      d.timestamp,
      d.camera,
      d.studentId,
      `"${d.studentName}"`,
      d.object,
      `${d.confidence}%`,
      d.status
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `smart_cheating_detection_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const detectionService = new DetectionService();
export default detectionService;
