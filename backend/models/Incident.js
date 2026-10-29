const mongoose = require('mongoose');

/**
 * Traditional Computer Vision Incident Schema
 * Stores suspicious movement, boundary violations, and neighbor-zone crossovers.
 */
const incidentSchema = new mongoose.Schema(
  {
    videoId: {
      type: String,
      required: true,
      index: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
      default: 'Student',
    },
    studentId: {
      type: String,
      trim: true,
      default: '',
    },
    row: {
      type: Number,
      default: 1,
    },
    bench: {
      type: Number,
      default: 1,
    },
    seat: {
      type: Number,
      default: 1,
    },
    benchId: {
      type: String,
      trim: true,
      default: 'B01',
    },
    seatId: {
      type: String,
      trim: true,
      default: 'B01-S01',
    },
    activityType: {
      type: String,
      required: true,
      enum: [
        'BOUNDARY_VIOLATION',
        'NEIGHBOR_ZONE_MOVEMENT',
        'SUSPICIOUS_MOVEMENT',
        'MOVEMENT_DETECTED',
        'Suspicious Movement Detected',
        'Suspicious Activity Detected',
        'Possible Interaction',
      ],
      default: 'BOUNDARY_VIOLATION',
    },
    type: {
      type: String,
      default: 'BOUNDARY_VIOLATION',
    },
    timestamp: {
      type: String, // e.g. "00:14:32"
      required: true,
    },
    timeSec: {
      type: Number,
      default: 0,
    },
    frameNumber: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number, // Duration of movement in seconds (e.g. 2.4)
      default: 1.0,
    },
    outsideRatio: {
      type: Number, // Ratio of movement outside the student's assigned ROI (e.g. 0.38)
      default: 0.0,
    },
    movementArea: {
      type: Number, // Total movement area in pixels
      default: 0,
    },
    relatedStudent: {
      type: String, // Neighbor student whose zone was encroached upon, if any
      default: null,
    },
    coordinates: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
    },
    roi: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      width: { type: Number, default: 100 },
      height: { type: Number, default: 100 },
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM',
    },
    status: {
      type: String,
      enum: ['Needs Review', 'Reviewed', 'Dismissed', 'NEW', 'REVIEWED', 'DISMISSED'],
      default: 'Needs Review',
    },
    evidencePath: {
      type: String,
      default: null,
    },
    reason: {
      type: String,
      default: '',
    },
    note: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Incident', incidentSchema);
