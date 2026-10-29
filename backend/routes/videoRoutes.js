const express = require('express');
const router = express.Router();
const uploadVideo = require('../middleware/uploadMiddleware');
const { protectFaculty } = require('../middleware/authMiddleware');
const {
  uploadCCTVVideo,
  listVideos,
  streamVideo,
  processVideoCV,
  getCVProcessingStatus,
  stopVideoCV,
} = require('../controllers/videoController');

// Video management routes
router.get('/', protectFaculty, listVideos);

// Upload video with inline Multer error handling
router.post(
  '/upload',
  protectFaculty,
  (req, res, next) => {
    uploadVideo.single('cctvVideo')(req, res, (err) => {
      if (err) {
        console.error('[Multer Upload Error]:', err.message);
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload validation failed.',
        });
      }
      next();
    });
  },
  uploadCCTVVideo
);

router.get('/stream/:filename', streamVideo); // Streaming endpoint
router.post('/process', protectFaculty, processVideoCV);
router.get('/process/status/:videoId', protectFaculty, getCVProcessingStatus);
router.post('/stop', protectFaculty, stopVideoCV);

module.exports = router;
