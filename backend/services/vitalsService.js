const { Vitals, Patient } = require('../models');
const { normalizePayload } = require('../utils/payload');
const { emitVitals, emitLocation } = require('../sockets/socketManager');
const logger = require('../utils/logger');

const ingestVitals = async (raw) => {
    const payload = normalizePayload(raw);
    const vital = await Vitals.create(payload);

    // Upsert patient metadata when new patient_id arrives
    await Patient.updateOne(
        { patient_id: payload.patient_id },
        { $setOnInsert: { device_id: payload.device_id, name: payload.patient_id } },
        { upsert: true }
    );

    emitVitals(payload);
    emitLocation({
        ambulance_id: payload.patient_id,
        patient_id: payload.patient_id,
        latitude: payload.latitude,
        longitude: payload.longitude,
        speed: payload.speed,
        status: payload.status,
        timestamp: payload.timestamp
    });

    return vital;
};

const getRecentVitals = async (patientId, limit = 50) => {
    return Vitals.find({ patient_id: patientId }).sort({ timestamp: -1 }).limit(limit);
};

const listPatientsWithLatestVitals = async () => {
    const patients = await Patient.find();
    const results = await Promise.all(patients.map(async (p) => {
        const latest = await Vitals.findOne({ patient_id: p.patient_id }).sort({ timestamp: -1 });
        return { ...p.toObject(), vitals: latest };
    }));
    return results;
};

module.exports = {
    ingestVitals,
    getRecentVitals,
    listPatientsWithLatestVitals,
};
