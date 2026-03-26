const asyncHandler = require('../utils/asyncHandler');
const { listAmbulances, getAmbulance, upsertAmbulance } = require('../services/ambulanceService');
const { normalizePayload } = require('../utils/payload');

const getAll = asyncHandler(async (req, res) => {
    const data = await listAmbulances();
    res.json(data);
});

const getOne = asyncHandler(async (req, res) => {
    const data = await getAmbulance(req.params.id);
    res.json(data);
});

const updateLocation = asyncHandler(async (req, res) => {
    const normalized = normalizePayload(req.body || {});
    const payload = {
        ambulance_id: req.params.id || normalized.patient_id,
        patient_id: normalized.patient_id,
        latitude: normalized.latitude,
        longitude: normalized.longitude,
        speed: normalized.speed,
        status: normalized.status,
        timestamp: normalized.timestamp,
    };
    const updated = await upsertAmbulance(payload);
    res.status(200).json(updated);
});

module.exports = {
    getAll,
    getOne,
    updateLocation,
};
