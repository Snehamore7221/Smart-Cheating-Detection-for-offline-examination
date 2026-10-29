const Incident = require('../models/Incident');

/**
 * @desc    Get all logged incidents with optional filtering by status or bench
 * @route   GET /api/incidents
 * @access  Private (Faculty Only)
 */
const getIncidents = async (req, res) => {
  try {
    const { videoId, status, benchId, limit = 50 } = req.query;

    const query = {};
    if (videoId) query.videoId = videoId;
    if (status) query.status = status;
    if (benchId) query.benchId = benchId;

    let incidents = [];
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      try {
        incidents = await Incident.find(query)
          .sort({ createdAt: -1 })
          .limit(parseInt(limit, 10));
      } catch (dbErr) {
        console.warn('[Incident Controller] DB fetch failed, returning empty list fallback.');
        incidents = [];
      }
    }

    return res.status(200).json({
      success: true,
      count: incidents.length,
      incidents,
    });
  } catch (error) {
    console.error('[Get Incidents Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch incident log history.',
      error: error.message,
    });
  }
};

/**
 * @desc    Create a new incident log
 * @route   POST /api/incidents
 * @access  Private (Faculty Only)
 */
const createIncident = async (req, res) => {
  try {
    const incidentData = req.body;
    let incident;
    try {
      incident = await Incident.create(incidentData);
    } catch (err) {
      incident = { _id: 'temp_' + Date.now(), ...incidentData, createdAt: new Date() };
    }

    return res.status(201).json({
      success: true,
      message: 'Incident logged successfully.',
      incident,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create incident.',
      error: error.message,
    });
  }
};

/**
 * @desc    Update incident status (e.g. mark REVIEWED or DISMISSED)
 * @route   PATCH /api/incidents/:id/status
 * @access  Private (Faculty Only)
 */
const updateIncidentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!['NEW', 'REVIEWED', 'DISMISSED', 'Needs Review', 'Reviewed', 'Dismissed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status provided.',
      });
    }

    let incident;
    try {
      incident = await Incident.findById(id);
      if (!incident) {
        return res.status(404).json({
          success: false,
          message: 'Incident record not found.',
        });
      }

      incident.status = status;
      if (note !== undefined) incident.note = note;
      await incident.save();
    } catch (dbErr) {
      incident = { _id: id, status, note };
    }

    return res.status(200).json({
      success: true,
      message: `Incident status updated to ${status}.`,
      incident,
    });
  } catch (error) {
    console.error('[Update Incident Status Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update incident record.',
      error: error.message,
    });
  }
};

/**
 * @desc    Clear all logged incidents
 * @route   DELETE /api/incidents
 * @access  Private (Faculty Only)
 */
const clearIncidents = async (req, res) => {
  try {
    const { videoId } = req.query;
    const query = {};
    if (videoId) query.videoId = videoId;

    let deletedCount = 0;
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      try {
        const result = await Incident.deleteMany(query);
        deletedCount = result.deletedCount || 0;
      } catch (dbErr) {
        console.warn('[Incident Controller] DB clear failed:', dbErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Incident history cleared successfully.',
      deletedCount,
    });
  } catch (error) {
    console.error('[Clear Incidents Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to clear incident history.',
      error: error.message,
    });
  }
};

/**
 * @desc    Get bench activity summary stats
 * @route   GET /api/incidents/summary
 * @access  Private (Faculty Only)
 */
const getIncidentSummary = async (req, res) => {
  try {
    let summary = [];
    try {
      summary = await Incident.aggregate([
        { $group: { _id: '$benchId', count: { $sum: 1 }, latest: { $max: '$createdAt' } } },
        { $sort: { count: -1 } },
      ]);
    } catch (err) {
      summary = [];
    }

    return res.status(200).json({
      success: true,
      summary,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to compute summary stats.',
    });
  }
};

module.exports = {
  getIncidents,
  createIncident,
  updateIncidentStatus,
  clearIncidents,
  getIncidentSummary,
};
