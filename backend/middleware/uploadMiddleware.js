const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../data/videos');

// Ensure destination folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Disk Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBaseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${safeBaseName}-${uniqueSuffix}${ext}`);
  },
});

// File filter validation (mp4, avi, mov)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.mp4', '.avi', '.mov'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid video file format: ${ext}. Only MP4, AVI, and MOV files are supported.`
      ),
      false
    );
  }
};

const maxSizeBytes = (parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 500) * 1024 * 1024;

const uploadVideo = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSizeBytes },
});

module.exports = uploadVideo;
