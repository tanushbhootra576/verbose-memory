const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validate = require('../middleware/validate');
const { ingestVitals, getVitalsByDevice, getVitalsByPatient } = require('../controllers/vitalsController');

const vitalsSchema = Joi.object({
  device_id:     Joi.string().required(),
  patient_id:    Joi.string().default('P000'),
  hr:            Joi.alternatives().try(Joi.number(), Joi.string()),
  heartRate:     Joi.alternatives().try(Joi.number(), Joi.string()),
  heart_rate:    Joi.alternatives().try(Joi.number(), Joi.string()),
  spo2:          Joi.alternatives().try(Joi.number(), Joi.string()),
  SpO2:          Joi.alternatives().try(Joi.number(), Joi.string()),
  oxygen:        Joi.alternatives().try(Joi.number(), Joi.string()),
  temperature:   Joi.alternatives().try(Joi.number(), Joi.string()),
  temp:          Joi.alternatives().try(Joi.number(), Joi.string()),
  bodyTemp:      Joi.alternatives().try(Joi.number(), Joi.string()),
  latitude:      Joi.number(),
  lat:           Joi.number(),
  gps_lat:       Joi.number(),
  longitude:     Joi.number(),
  lng:           Joi.number(),
  lon:           Joi.number(),
  gps_lng:       Joi.number(),
  speed:         Joi.number(),
  patientId:     Joi.string(),
  deviceId:      Joi.string(),
}).options({ allowUnknown: true });

// POST /api/vitals — ESP32 data ingest (no auth, device-facing)
router.post('/', validate(vitalsSchema), ingestVitals);

// GET /api/vitals/:device_id
router.get('/device/:device_id', getVitalsByDevice);

module.exports = router;
