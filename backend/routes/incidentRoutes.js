const express = require('express');
const router = express.Router();
const { protectFaculty } = require('../middleware/authMiddleware');
const {
  getIncidents,
  createIncident,
  updateIncidentStatus,
  clearIncidents,
  getIncidentSummary,
} = require('../controllers/incidentController');

// Incident routes protected by Faculty authorization
router.get('/', protectFaculty, getIncidents);
router.post('/', protectFaculty, createIncident);
router.delete('/', protectFaculty, clearIncidents);
router.delete('/clear', protectFaculty, clearIncidents);
router.get('/summary', protectFaculty, getIncidentSummary);
router.patch('/:id/status', protectFaculty, updateIncidentStatus);

module.exports = router;
