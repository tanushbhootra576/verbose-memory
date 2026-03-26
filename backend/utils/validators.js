const Joi = require('joi');

const vitalsSchema = Joi.object({
    device_id: Joi.string().optional(),
    deviceId: Joi.string().optional(),
    patient_id: Joi.string().optional(),
    patientId: Joi.string().optional(),
    hr: Joi.number().optional(),
    heartRate: Joi.number().optional(),
    spo2: Joi.number().optional(),
    SpO2: Joi.number().optional(),
    spO2: Joi.number().optional(),
    temperature: Joi.number().optional(),
    temp: Joi.number().optional(),
    latitude: Joi.number().optional(),
    lat: Joi.number().optional(),
    longitude: Joi.number().optional(),
    lng: Joi.number().optional(),
    speed: Joi.number().optional(),
    status: Joi.string().valid('Normal', 'Warning', 'Critical').optional(),
    timestamp: Joi.date().optional()
}).unknown(true);

module.exports = {
    vitalsSchema,
};
