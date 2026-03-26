const Ambulance = require('../models/Ambulance');
const Patient = require('../models/Patient');
const logger = require('../utils/logger');

// GET /api/ambulances
const getAllAmbulances = async (req, res, next) => {
  try {
    const ambulances = await Ambulance.find({ isActive: true }).sort({ updatedAt: -1 });
    res.status(200).json({ success: true, count: ambulances.length, data: { ambulances } });
  } catch (err) {
    next(err);
  }
};

// GET /api/ambulances/:id
const getAmbulanceById = async (req, res, next) => {
  try {
    const ambulance = await Ambulance.findOne({ ambulance_id: req.params.id });
    if (!ambulance) {
      return res.status(404).json({ success: false, message: 'Ambulance not found.' });
    }
    res.status(200).json({ success: true, data: { ambulance } });
  } catch (err) {
    next(err);
  }
};

// GET /api/ambulances/:id/patient
const getAmbulancePatient = async (req, res, next) => {
  try {
    const ambulance = await Ambulance.findOne({ ambulance_id: req.params.id });
    if (!ambulance) {
      return res.status(404).json({ success: false, message: 'Ambulance not found.' });
    }
    if (!ambulance.patient_id) {
      return res.status(200).json({ success: true, data: { patient: null } });
    }

    const patient = await Patient.findOne({ patient_id: ambulance.patient_id });
    res.status(200).json({ success: true, data: { patient, ambulance } });
  } catch (err) {
    next(err);
  }
};

// GET /api/ambulances/stats
const getStats = async (req, res, next) => {
  try {
    const total = await Ambulance.countDocuments({ isActive: true });
    const online = await Ambulance.countDocuments({ isActive: true, isOnline: true });
    const critical = await Ambulance.countDocuments({
      isActive: true,
      'latestVitals.status': 'Critical',
    });
    const warning = await Ambulance.countDocuments({
      isActive: true,
      'latestVitals.status': 'Warning',
    });

    res.status(200).json({
      success: true,
      data: { total, online, critical, warning, normal: online - critical - warning },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllAmbulances, getAmbulanceById, getAmbulancePatient, getStats };
