const fs = require('fs');
const path = require('path');
const { runCVProcessor, stopCVProcessor, getCVJobStatus } = require('../services/cvBridge');

const videosDirectory = path.join(__dirname, '../../data/videos');

/**
 * @desc    Upload CCTV video file
 * @route   POST /api/videos/upload
 * @access  Private (Faculty Only)
 */
const uploadCCTVVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No CCTV video file uploaded. Please select a valid MP4, AVI, or MOV file.',
      });
    }

    const videoInfo = {
      id: path.parse(req.file.filename).name,
      filename: req.file.filename,
      originalName: req.file.originalname,
      sizeBytes: req.file.size,
      sizeFormatted: `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`,
      mimeType: req.file.mimetype,
      uploadedAt: new Date(),
      url: `/api/videos/stream/${req.file.filename}`,
    };

    console.log(`[Video Upload Success] Stored file: ${req.file.filename} (${videoInfo.sizeFormatted})`);

    return res.status(201).json({
      success: true,
      message: 'CCTV video uploaded successfully.',
      video: videoInfo,
    });
  } catch (error) {
    console.error('[Video Upload Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while processing video upload.',
      error: error.message,
    });
  }
};

/**
 * @desc    List all uploaded CCTV videos
 * @route   GET /api/videos
 * @access  Private (Faculty Only)
 */
const listVideos = async (req, res) => {
  try {
    if (!fs.existsSync(videosDirectory)) {
      return res.status(200).json({ success: true, count: 0, videos: [] });
    }

    const files = fs.readdirSync(videosDirectory);
    const videoFiles = files.filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return ['.mp4', '.avi', '.mov'].includes(ext);
    });

    const videoList = videoFiles.map((filename) => {
      const filePath = path.join(videosDirectory, filename);
      const stats = fs.statSync(filePath);
      return {
        id: path.parse(filename).name,
        filename,
        originalName: filename,
        sizeBytes: stats.size,
        sizeFormatted: `${(stats.size / (1024 * 1024)).toFixed(2)} MB`,
        uploadedAt: stats.birthtime,
        url: `/api/videos/stream/${filename}`,
      };
    });

    return res.status(200).json({
      success: true,
      count: videoList.length,
      videos: videoList,
    });
  } catch (error) {
    console.error('[List Videos Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve video files list.',
      error: error.message,
    });
  }
};

/**
 * @desc    Stream CCTV video with HTTP 206 Range headers support
 * @route   GET /api/videos/stream/:filename
 * @access  Public / Token Protected
 */
const streamVideo = (req, res) => {
  try {
    const filename = req.params.filename;
    const videoPath = path.join(videosDirectory, filename);

    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({
        success: false,
        message: 'CCTV Video file not found.',
      });
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    console.error('[Stream Video Error]:', error);
    res.status(500).end('Video streaming server error');
  }
};

/**
 * @desc    Trigger Traditional Computer Vision Processing on a video
 * @route   POST /api/videos/process
 * @access  Private (Faculty Only)
 */
const processVideoCV = async (req, res) => {
  try {
    const rawTarget = req.body.filename || req.body.videoFilename || req.body.videoPath;
    const studentROIs = req.body.studentROIs || req.body.students || null;
    const cvConfig = req.body.cvConfig || req.body.config || req.body.thresholds || null;

    if (!rawTarget || typeof rawTarget !== 'string' || !rawTarget.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Video filename parameter is required.',
      });
    }

    const trimmedTarget = rawTarget.trim();
    let videoPath = null;
    let filename = path.basename(trimmedTarget);

    if (path.isAbsolute(trimmedTarget) && fs.existsSync(trimmedTarget)) {
      videoPath = trimmedTarget;
    } else {
      videoPath = path.join(videosDirectory, filename);
      if (!fs.existsSync(videoPath)) {
        // Fallback 1: check with spaces replaced by underscores
        const altName = filename.replace(/\s+/g, '_');
        const altPath = path.join(videosDirectory, altName);
        if (fs.existsSync(altPath)) {
          videoPath = altPath;
        } else {
          // Fallback 2: look for uploaded file with matching base prefix (e.g. Final_footage-*.mp4)
          const baseName = path.basename(filename, path.extname(filename)).replace(/[^a-zA-Z0-9_-]/g, '_');
          const files = fs.readdirSync(videosDirectory);
          const matched = files
            .filter((f) => f.startsWith(baseName) && (f.endsWith('.mp4') || f.endsWith('.avi') || f.endsWith('.mov')))
            .map((f) => ({ f, mtime: fs.statSync(path.join(videosDirectory, f)).mtimeMs }))
            .sort((a, b) => b.mtime - a.mtime);

          if (matched.length > 0) {
            videoPath = path.join(videosDirectory, matched[0].f);
          } else {
            return res.status(404).json({
              success: false,
              message: `Target video file '${filename}' does not exist on server.`,
            });
          }
        }
      }
    }

    const videoId = path.parse(videoPath).name;

    // Run Python Traditional CV processing asynchronously
    const job = runCVProcessor(videoId, videoPath, studentROIs, cvConfig, (incident) => {
      console.log(`[CV Alert Dispatched]: ${incident.studentName} (${incident.activityType}) at ${incident.timestamp}`);
    });

    return res.status(200).json({
      success: true,
      message: 'Traditional Computer Vision movement detection pipeline initialized.',
      videoId,
      filename,
      status: job.status,
    });
  } catch (error) {
    console.error('[Process Video CV Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to launch CV processing engine.',
      error: error.message,
    });
  }
};

/**
 * @desc    Get Computer Vision Processing Status
 * @route   GET /api/videos/process/status/:videoId
 * @access  Private (Faculty Only)
 */
const getCVProcessingStatus = async (req, res) => {
  try {
    const { videoId } = req.params;
    const status = getCVJobStatus(videoId);

    if (!status) {
      return res.status(200).json({
        success: true,
        status: 'idle',
        message: 'No active CV processing job found for this video.',
        incidents: [],
        activeContours: [],
      });
    }

    return res.status(200).json({
      success: true,
      ...status,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching CV processing status.',
      error: error.message,
    });
  }
};

/**
 * @desc    Stop Computer Vision Processing
 * @route   POST /api/videos/stop
 * @access  Private (Faculty Only)
 */
const stopVideoCV = async (req, res) => {
  try {
    const { videoId } = req.body;
    if (videoId) {
      stopCVProcessor(videoId);
    }
    return res.status(200).json({
      success: true,
      message: 'CV processing stopped.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error stopping CV processing.',
    });
  }
};

module.exports = {
  uploadCCTVVideo,
  listVideos,
  streamVideo,
  processVideoCV,
  getCVProcessingStatus,
  stopVideoCV,
};
