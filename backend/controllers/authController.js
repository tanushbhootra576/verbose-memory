const asyncHandler = require('../utils/asyncHandler');
const { login } = require('../services/authService');

const loginController = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const result = await login(email, password);
    res.json(result);
});

module.exports = { loginController };
