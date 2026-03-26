const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { register, login, getMe } = require('../controllers/authController');

const registerSchema = Joi.object({
  name:           Joi.string().min(2).max(60).required(),
  email:          Joi.string().email().required(),
  password:       Joi.string().min(6).required(),
  role:           Joi.string().valid('admin', 'doctor').default('doctor'),
  department:     Joi.string().allow('').optional(),
  specialization: Joi.string().allow('').optional(),
});

const loginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().required(),
});

// POST /api/auth/register
router.post('/register', validate(registerSchema), register);

// POST /api/auth/login
router.post('/login', validate(loginSchema), login);

// GET /api/auth/me
router.get('/me', protect, getMe);

module.exports = router;
