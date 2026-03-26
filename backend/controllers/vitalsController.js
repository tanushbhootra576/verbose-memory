const asyncHandler = require('../utils/asyncHandler');
const { ingestVitals, getRecentVitals, listPatientsWithLatestVitals } = require('../services/vitalsService');

const postVitals = asyncHandler(async (req, res) => {
    const vital = await ingestVitals(req.body || {});
    res.status(201).json(vital);
});

const getPatients = asyncHandler(async (req, res) => {
    const patients = await listPatientsWithLatestVitals();
    res.json(patients);
});

const getPatientHistory = asyncHandler(async (req, res) => {
    const vitals = await getRecentVitals(req.params.id, 50);
    res.json({ patient_id: req.params.id, history: vitals, latest: vitals[0] });
});

module.exports = {
    postVitals,
    getPatients,
    getPatientHistory,
};
