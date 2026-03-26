const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getAllPatients,
  getPatientById,
  getPatientWithHistory,
} = require('../controllers/patientsController');
const { getVitalsByPatient } = require('../controllers/vitalsController');

// GET /api/patients
router.get('/', protect, getAllPatients);

// GET /api/patient/:id
router.get('/:id', protect, getPatientById);

// GET /api/patient/:id/history
router.get('/:id/history', protect, getPatientWithHistory);

// GET /api/patient/:id/vitals
router.get('/:id/vitals', protect, getVitalsByPatient);

module.exports = router;
