const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const alertManager = require('./alertManager');

// In-memory registry of CV processing jobs
// videoId -> {
//   videoId,
//   videoPath,
//   status: 'processing' | 'completed' | 'failed',
//   percent: number,
//   currentFrame: number,
//   totalFrames: number,
//   fps: number,
//   message: string,
//   incidents: Array,
//   activeContours: Array,
//   error: string | null,
//   startTime: number,
//   completedAt: number | null,
//   stderrBuffer: Array,
//   pyProcess: ChildProcess
// }
const jobs = new Map();

/**
 * Service to execute Python OpenCV processing script asynchronously
 * @param {string} videoId
 * @param {string} videoPath
 * @param {Array|null} studentROIs
 * @param {Object|null} cvConfig
 * @param {Function|null} onAlertCallback
 */
const runCVProcessor = (videoId, videoPath, studentROIs = null, cvConfig = null, onAlertCallback = null) => {
  // If an active process is already running for this videoId, return existing job
  if (jobs.has(videoId)) {
    const existingJob = jobs.get(videoId);
    if (existingJob.status === 'processing') {
      console.log(`[cvBridge] CV processor already actively running for video: ${videoId}`);
      return existingJob;
    }
  }

  const pythonScript = path.join(__dirname, '../../cv/video_processor.py');
  const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';

  console.log(`[cvBridge] Launching Traditional OpenCV engine for ${videoPath}`);

  // Clear any existing cooldowns for this video session to ensure fresh detection
  alertManager.clearSessionCooldowns(videoId);

  // Create temporary ROIs JSON file to avoid command-line length limits on Windows
  let tempRoisFile = null;
  const tempDir = path.join(__dirname, '../../data');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  if (studentROIs && Array.isArray(studentROIs) && studentROIs.length > 0) {
    tempRoisFile = path.join(tempDir, `temp_rois_${videoId}_${Date.now()}.json`);
    try {
      fs.writeFileSync(tempRoisFile, JSON.stringify(studentROIs, null, 2), 'utf8');
    } catch (e) {
      console.warn('[cvBridge] Could not write temp ROIs file, will pass as JSON string fallback:', e.message);
      tempRoisFile = null;
    }
  }

  const args = [pythonScript, '--video', videoPath, '--id', videoId];

  if (tempRoisFile) {
    args.push('--rois', tempRoisFile);
  } else if (studentROIs && Array.isArray(studentROIs) && studentROIs.length > 0) {
    args.push('--rois', JSON.stringify(studentROIs));
  }

  if (cvConfig && typeof cvConfig === 'object') {
    args.push('--config', JSON.stringify(cvConfig));
  }

  const job = {
    videoId,
    videoPath,
    status: 'processing',
    percent: 0,
    currentFrame: 0,
    totalFrames: 0,
    fps: 30,
    message: 'Initializing OpenCV video capture and student ROIs...',
    incidents: [],
    activeContours: [],
    error: null,
    startTime: Date.now(),
    completedAt: null,
    stderrBuffer: [],
    pyProcess: null,
    tempRoisFile
  };

  jobs.set(videoId, job);

  let pyProcess;
  try {
    pyProcess = spawn(pythonCmd, args);
    job.pyProcess = pyProcess;
  } catch (err) {
    job.status = 'failed';
    job.error = `Failed to spawn Python process: ${err.message}. Please verify Python is installed.`;
    return job;
  }

  pyProcess.stdout.on('data', async (data) => {
    const lines = data.toString().split(/\r?\n/);
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;
      try {
        if (line.startsWith('{') && line.endsWith('}')) {
          const eventData = JSON.parse(line);

          // 1. INIT event
          if (eventData.type === 'INIT') {
            job.totalFrames = eventData.totalFrames || 0;
            job.fps = eventData.fps || 30;
            job.message = `OpenCV initialized (${eventData.width}x${eventData.height} @ ${eventData.fps}fps). Analyzing video frames...`;
            continue;
          }

          // 2. PROGRESS event
          if (eventData.type === 'PROGRESS') {
            job.currentFrame = eventData.currentFrame || job.currentFrame;
            job.totalFrames = eventData.totalFrames || job.totalFrames;
            job.percent = eventData.percent || job.percent;
            job.message = `Processing frame ${job.currentFrame}/${job.totalFrames} (${job.percent}%) at ${eventData.timeSec || 0}s...`;
            continue;
          }

          // 3. COMPLETED event
          if (eventData.type === 'COMPLETED') {
            job.status = 'completed';
            job.percent = 100;
            job.totalFrames = eventData.totalFrames || job.totalFrames;
            job.currentFrame = eventData.processedFrames || job.totalFrames;
            job.completedAt = Date.now();
            job.message = `OpenCV Analysis complete. Evaluated ${job.currentFrame} frames. Detected ${job.incidents.length} boundary violation(s).`;
            continue;
          }

          // 4. ERROR event
          if (eventData.type === 'ERROR' || eventData.error) {
            job.status = 'failed';
            job.error = eventData.error || 'Computer Vision Engine encountered an error.';
            console.error('[cvBridge Error Event]:', job.error);
            continue;
          }

          // 5. INCIDENT event
          if (eventData.eventType === 'INCIDENT' || eventData.activityType) {
            eventData.videoId = videoId;
            const incident = await alertManager.processEvent(eventData);

            if (incident) {
              const formattedIncident = incident.toObject ? incident.toObject() : incident;
              job.incidents.push(formattedIncident);

              // Maintain active contours for frontend visual inspection
              if (eventData.roi) {
                job.activeContours.push({
                  id: `cnt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                  box: eventData.roi,
                  studentName: eventData.studentName,
                  studentKey: eventData.seatId,
                  timeSec: eventData.timeSec,
                  isFlagged: true
                });
              }

              if (typeof onAlertCallback === 'function') {
                onAlertCallback(formattedIncident);
              }
            }
          }
        } else {
          // Normal logging output
          console.log(`[Python CV Log]: ${line}`);
        }
      } catch (err) {
        console.log(`[Python CV parse note]: ${line}`);
      }
    }
  });

  pyProcess.stderr.on('data', (data) => {
    const text = data.toString().trim();
    console.warn(`[Python CV Stderr]: ${text}`);
    if (job.stderrBuffer.length < 50) {
      job.stderrBuffer.push(text);
    }
  });

  pyProcess.on('close', (code) => {
    console.log(`[cvBridge] Python CV process for ${videoId} finished with exit code ${code}`);

    // Clean up temporary ROIs file if created
    if (job.tempRoisFile && fs.existsSync(job.tempRoisFile)) {
      try {
        fs.unlinkSync(job.tempRoisFile);
      } catch (e) {}
    }

    if (code === 0) {
      if (job.status !== 'failed') {
        job.status = 'completed';
        job.percent = 100;
        job.completedAt = Date.now();
        if (!job.message.includes('complete')) {
          job.message = `OpenCV Analysis finished. Found ${job.incidents.length} incident(s).`;
        }
      }
    } else {
      job.status = 'failed';
      if (!job.error) {
        job.error = job.stderrBuffer.slice(-2).join(' ') || `OpenCV video processor exited with code ${code}.`;
      }
    }
  });

  pyProcess.on('error', (err) => {
    console.error(`[cvBridge Error] Failed to start Python process: ${err.message}`);
    job.status = 'failed';
    job.error = `Failed to start Python worker: ${err.message}. Ensure Python is installed and accessible in PATH.`;
  });

  return job;
};

/**
 * Retrieves current status of a CV processing job
 * @param {string} videoId
 */
const getCVJobStatus = (videoId) => {
  if (!jobs.has(videoId)) {
    return null;
  }
  const job = jobs.get(videoId);
  return {
    videoId: job.videoId,
    status: job.status,
    percent: job.percent,
    currentFrame: job.currentFrame,
    totalFrames: job.totalFrames,
    fps: job.fps,
    message: job.message,
    incidents: job.incidents,
    activeContours: job.activeContours,
    error: job.error,
    startTime: job.startTime,
    completedAt: job.completedAt
  };
};

/**
 * Stops an active CV processing job
 * @param {string} videoId
 */
const stopCVProcessor = (videoId) => {
  if (jobs.has(videoId)) {
    const job = jobs.get(videoId);
    if (job.pyProcess) {
      job.pyProcess.kill('SIGINT');
    }
    job.status = 'failed';
    job.error = 'Processing stopped by faculty.';
    console.log(`[cvBridge] Stopped CV processor for video: ${videoId}`);
  }
};

module.exports = {
  runCVProcessor,
  getCVJobStatus,
  stopCVProcessor,
};
