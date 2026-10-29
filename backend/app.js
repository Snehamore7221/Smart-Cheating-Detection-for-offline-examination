const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/authRoutes');
const videoRoutes = require('./routes/videoRoutes');
const incidentRoutes = require('./routes/incidentRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure required data directories exist
const evidenceDir = path.join(__dirname, '../data/evidence');
const videosDir = path.join(__dirname, '../data/videos');
if (!fs.existsSync(evidenceDir)) fs.mkdirSync(evidenceDir, { recursive: true });
if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir, { recursive: true });

// Static files (evidence frames preview & static assets)
app.use('/evidence', express.static(evidenceDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/incidents', incidentRoutes);

// Bench layout configuration endpoint (supports presets & per-video layouts)
app.get('/api/benches', (req, res) => {
  try {
    const benchesFile = path.join(__dirname, 'config/benches.json');
    if (!fs.existsSync(benchesFile)) {
      return res.status(404).json({ success: false, message: 'Bench layout config not found' });
    }

    const data = JSON.parse(fs.readFileSync(benchesFile, 'utf8'));
    const { videoId } = req.query;

    let activePresetKey = data.defaultPreset || 'centered_3col';
    if (videoId && data.videoLayouts && data.videoLayouts[videoId]) {
      activePresetKey = data.videoLayouts[videoId];
    }

    const presetObj = data.presets[activePresetKey] || data.presets[data.defaultPreset] || Object.values(data.presets)[0];

    return res.status(200).json({
      success: true,
      activePreset: activePresetKey,
      presets: data.presets,
      benches: presetObj.benches,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Update bench layout preset for a specific video
app.post('/api/benches/layout', (req, res) => {
  try {
    const { videoId, presetKey } = req.body;
    const benchesFile = path.join(__dirname, 'config/benches.json');
    if (!fs.existsSync(benchesFile)) {
      return res.status(404).json({ success: false, message: 'Bench config file not found' });
    }

    const data = JSON.parse(fs.readFileSync(benchesFile, 'utf8'));

    if (!data.presets[presetKey]) {
      return res.status(400).json({ success: false, message: `Invalid preset key: ${presetKey}` });
    }

    if (!data.videoLayouts) data.videoLayouts = {};
    if (videoId) {
      data.videoLayouts[videoId] = presetKey;
    }

    fs.writeFileSync(benchesFile, JSON.stringify(data, null, 2), 'utf8');

    return res.status(200).json({
      success: true,
      message: `Bench layout updated to ${presetKey}`,
      activePreset: presetKey,
      benches: data.presets[presetKey].benches,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Healthcheck Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    system: 'Smart Cheating Detection System',
    timestamp: new Date().toISOString(),
  });
});

// 404 Route handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global App Error Handler]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
