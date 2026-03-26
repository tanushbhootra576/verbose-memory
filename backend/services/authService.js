const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const config = require('../config');

const ensureSeedUser = async () => {
    const existing = await User.findOne({ email: 'admin@healthflow.local' });
    if (!existing) {
        const hashed = await bcrypt.hash('Admin@123', 10);
        await User.create({ email: 'admin@healthflow.local', password: hashed, role: 'admin' });
    }
};

const login = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error('Invalid credentials');
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new Error('Invalid credentials');
    const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, config.jwtSecret, { expiresIn: '12h' });
    return { token, role: user.role, email: user.email };
};

module.exports = {
    ensureSeedUser,
    login,
};
