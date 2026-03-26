const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const {
  getAllAmbulances,
  getAmbulanceById,
  getAmbulancePatient,
  getStats,
} = require('../controllers/ambulancesController');

// GET /api/ambulances/stats  — must be before /:id
router.get('/stats', protect, getStats);

// GET /api/ambulances
router.get('/', protect, getAllAmbulances);

// GET /api/ambulances/:id
router.get('/:id', protect, getAmbulanceById);

// GET /api/ambulances/:id/patient
router.get('/:id/patient', protect, getAmbulancePatient);

module.exports = router;
