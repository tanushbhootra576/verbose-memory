const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getAll, getOne, updateLocation } = require('../controllers/ambulanceController');

router.get('/ambulances', auth(['admin', 'doctor']), getAll);
router.get('/ambulance/:id', auth(['admin', 'doctor']), getOne);
router.post('/ambulance/:id/location', updateLocation);

module.exports = router;
