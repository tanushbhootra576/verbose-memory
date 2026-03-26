const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate');
const { vitalsSchema } = require('../utils/validators');
const { postVitals, getPatients, getPatientHistory } = require('../controllers/vitalsController');
const auth = require('../middleware/auth');
const config = require('../config');

const verifyApiKey = (req, res, next) => {
    if (config.apiKey && req.headers['x-api-key'] !== config.apiKey) {
        return res.status(401).json({ error: 'Unauthorized device' });
    }
    next();
};

router.post('/vitals', verifyApiKey, validate(vitalsSchema), postVitals);
router.get('/patients', auth(['admin', 'doctor']), getPatients);
router.get('/patient/:id', auth(['admin', 'doctor']), getPatientHistory);
router.get('/vitals/:id', auth(['admin', 'doctor']), getPatientHistory);

module.exports = router;
