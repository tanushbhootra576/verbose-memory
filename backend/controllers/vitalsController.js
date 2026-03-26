const VitalSign = require('../models/VitalSign');
const Ambulance = require('../models/Ambulance');
const { normalizeVitalPayload } = require('../services/normalizeService');
const { computeStatus, computeConditionScore, generateAlertMessage } = require('../services/alertService');
const logger = require('../utils/logger');

// POST /api/vitals  (ESP32 sends data here)
const ingestVitals = async (req, res, next) => {
  try {
    const normalized = normalizeVitalPayload(req.body);
    const status = computeStatus(normalized);
    const conditionScore = computeConditionScore(normalized);
    const alerts = generateAlertMessage(normalized);

    const vital = await VitalSign.create({ ...normalized, status });

    // Update ambulance cached vitals + location
    await Ambulance.findOneAndUpdate(
      { device_id: normalized.device_id },
      {
        latitude:  normalized.latitude,
        longitude: normalized.longitude,
        speed:     normalized.speed,
        isOnline:  true,
        'latestVitals.hr':          normalized.hr,
        'latestVitals.spo2':        normalized.spo2,
        'latestVitals.temperature': normalized.temperature,
        'latestVitals.status':      status,
        'latestVitals.updatedAt':   new Date(),
      },
      { new: true }
    );

    // Emit real-time event via Socket.IO (attached to app)
    const io = req.app.get('io');
    if (io) {
      const payload = {
        ...normalized,
        status,
        conditionScore,
        alerts,
        timestamp: new Date().toISOString(),
      };
      io.emit('vitalsUpdate', payload);
      io.emit('locationUpdate', {
        device_id:  normalized.device_id,
        patient_id: normalized.patient_id,
        latitude:   normalized.latitude,
        longitude:  normalized.longitude,
        speed:      normalized.speed,
        timestamp:  payload.timestamp,
      });
    }

    logger.info(`Vitals ingested for device ${normalized.device_id} — status: ${status}`);
    res.status(201).json({ success: true, data: { vital, status, conditionScore, alerts } });
  } catch (err) {
    next(err);
  }
};

// GET /api/vitals/:device_id
const getVitalsByDevice = async (req, res, next) => {
  try {
    const { device_id } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const vitals = await VitalSign.find({ device_id })
      .sort({ createdAt: -1 })
      .limit(limit);
    res.status(200).json({ success: true, count: vitals.length, data: { vitals } });
  } catch (err) {
    next(err);
  }
};

// GET /api/patient/:id/vitals
const getVitalsByPatient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 100;
    const vitals = await VitalSign.find({ patient_id: id })
      .sort({ createdAt: -1 })
      .limit(limit);
    res.status(200).json({ success: true, count: vitals.length, data: { vitals } });
  } catch (err) {
    next(err);
  }
};

module.exports = { ingestVitals, getVitalsByDevice, getVitalsByPatient };
