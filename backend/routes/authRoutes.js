const express = require('express');
const router = express.Router();
const { loginController } = require('../controllers/authController');

router.post('/auth/login', loginController);

module.exports = router;
