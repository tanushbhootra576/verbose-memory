const Patient = require('../models/Patient');
const VitalSign = require('../models/VitalSign');
const logger = require('../utils/logger');

// GET /api/patients
const getAllPatients = async (req, res, next) => {
  try {
    const patients = await Patient.find({ isActive: true });
    res.status(200).json({ success: true, count: patients.length, data: { patients } });
  } catch (err) {
    next(err);
  }
};

// GET /api/patient/:id
const getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ patient_id: req.params.id });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }
    res.status(200).json({ success: true, data: { patient } });
  } catch (err) {
    next(err);
  }
};

// GET /api/patient/:id/history
const getPatientWithHistory = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ patient_id: req.params.id });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    const recentVitals = await VitalSign.find({ patient_id: req.params.id })
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      data: { patient, recentVitals },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllPatients, getPatientById, getPatientWithHistory };
