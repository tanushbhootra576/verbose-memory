const logger = require('../utils/logger');

// Centralized error responder
module.exports = (err, req, res, next) => {
    logger.error(err.message, { stack: err.stack });
    const status = err.status || 500;
    res.status(status).json({ error: err.message || 'Server error' });
};
