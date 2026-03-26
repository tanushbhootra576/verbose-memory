const jwt = require('jsonwebtoken');
const config = require('../config');

const auth = (roles = []) => {
    const allowed = Array.isArray(roles) ? roles : [roles];
    return (req, res, next) => {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
        if (!token) return res.status(401).json({ error: 'Unauthorized' });
        try {
            const payload = jwt.verify(token, config.jwtSecret);
            if (allowed.length && !allowed.includes(payload.role)) {
                return res.status(403).json({ error: 'Forbidden' });
            }
            req.user = payload;
            next();
        } catch (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }
    };
};

module.exports = auth;
