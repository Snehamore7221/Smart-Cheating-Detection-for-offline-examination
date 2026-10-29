const Incident = require('../models/Incident');

// In-memory record of recent alerts for cooldown/debounce per student + activity (video-seconds based)
const alertCooldowns = new Map();

/**
 * AlertManager service handles temporal debounce, filtering duplicate detection events,
 * and storing valid incident logs into MongoDB/Memory.
 */
class AlertManager {
  constructor() {
    // Video-seconds cooldown between alerts for the same student + event type
    this.cooldownSec = parseFloat(process.env.ALERT_COOLDOWN_SEC) || 3.5;
  }

  /**
   * Process a raw detection event from Traditional Computer Vision engine
   * @param {Object} eventData
   * @returns {Object|null} Created incident object or null if suppressed by cooldown
   */
  async processEvent(eventData) {
    const {
      videoId,
      studentName,
      studentId,
      row,
      bench,
      seat,
      benchId,
      seatId,
      activityType,
      type,
      timestamp,
      timeSec,
      frameNumber,
      duration,
      outsideRatio,
      movementArea,
      relatedStudent,
      coordinates,
      roi,
      severity,
      evidencePath,
      reason,
    } = eventData;

    const eventTimeSec = Number(timeSec) || 0;
    const studentKey = seatId || `${row || 1}_${bench || 1}_${seat || 1}`;
    const cooldownKey = `${videoId}_${studentKey}_${activityType || type}`;

    // Check if within video-time cooldown period
    if (alertCooldowns.has(cooldownKey)) {
      const lastAlertSec = alertCooldowns.get(cooldownKey);
      if (Math.abs(eventTimeSec - lastAlertSec) < this.cooldownSec) {
        // Suppress repetitive alert within same video cooldown window
        return null;
      }
    }

    // Update last alert timestamp in video seconds
    alertCooldowns.set(cooldownKey, eventTimeSec);

    const mongoose = require('mongoose');
    const isDbConnected = mongoose.connection.readyState === 1;
    const incidentId = 'inc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

    try {
      if (isDbConnected) {
        // Save incident to Database
        const incident = await Incident.create({
          videoId: videoId || 'VID_DEFAULT',
          studentName: studentName || 'Student',
          studentId: studentId || seatId || `B${String(bench || 1).padStart(2, '0')}-S${String(seat || 1).padStart(2, '0')}`,
          row: Number(row) || 1,
          bench: Number(bench) || 1,
          seat: Number(seat) || 1,
          benchId: benchId || `B${String(bench || 1).padStart(2, '0')}`,
          seatId: seatId || `B${String(bench || 1).padStart(2, '0')}-S${String(seat || 1).padStart(2, '0')}`,
          activityType: activityType || type || 'BOUNDARY_VIOLATION',
          type: type || activityType || 'BOUNDARY_VIOLATION',
          timestamp: timestamp || '00:00:00',
          timeSec: eventTimeSec,
          frameNumber: Number(frameNumber) || 0,
          duration: Number(duration) || 1.0,
          outsideRatio: Number(outsideRatio) || 0.0,
          movementArea: Number(movementArea) || 0,
          relatedStudent: relatedStudent || null,
          coordinates: coordinates || { x: 0, y: 0 },
          roi: roi || { x: 0, y: 0, width: 100, height: 100 },
          severity: severity || 'MEDIUM',
          status: 'Needs Review',
          evidencePath: evidencePath || null,
          reason: reason || '',
        });

        console.log(
          `[AlertManager] New Incident: ${incident.studentName} (R${incident.row}-B${incident.bench}-S${incident.seat}) - ${incident.activityType} at ${incident.timestamp}`
        );
        const obj = incident.toObject ? incident.toObject() : incident;
        obj.id = String(obj._id || incidentId);
        return obj;
      }
    } catch (err) {
      console.warn('[AlertManager DB fallback] DB write failed, logging in-memory:', err.message);
    }

    // Fallback in-memory representation if DB is offline or not yet connected
    const fallbackIncident = {
      id: incidentId,
      _id: incidentId,
      videoId: videoId || 'VID_DEFAULT',
      studentName: studentName || 'Student',
      studentId: studentId || seatId || `B${String(bench || 1).padStart(2, '0')}-S${String(seat || 1).padStart(2, '0')}`,
      row: Number(row) || 1,
      bench: Number(bench) || 1,
      seat: Number(seat) || 1,
      benchId: benchId || `B${String(bench || 1).padStart(2, '0')}`,
      seatId: seatId || `B${String(bench || 1).padStart(2, '0')}-S${String(seat || 1).padStart(2, '0')}`,
      activityType: activityType || type || 'BOUNDARY_VIOLATION',
      type: type || activityType || 'BOUNDARY_VIOLATION',
      timestamp: timestamp || '00:00:00',
      timeSec: eventTimeSec,
      frameNumber: Number(frameNumber) || 0,
      duration: Number(duration) || 1.0,
      outsideRatio: Number(outsideRatio) || 0.0,
      movementArea: Number(movementArea) || 0,
      relatedStudent: relatedStudent || null,
      coordinates: coordinates || { x: 0, y: 0 },
      roi: roi || { x: 0, y: 0, width: 100, height: 100 },
      severity: severity || 'MEDIUM',
      status: 'Needs Review',
      evidencePath: evidencePath || null,
      reason: reason || '',
      createdAt: new Date(),
    };
    return fallbackIncident;
  }

  /**
   * Clear cooldown cache for a specific video session
   */
  clearSessionCooldowns(videoId) {
    if (!videoId) {
      alertCooldowns.clear();
      return;
    }
    for (const key of alertCooldowns.keys()) {
      if (key.startsWith(videoId)) {
        alertCooldowns.delete(key);
      }
    }
  }
}

module.exports = new AlertManager();
