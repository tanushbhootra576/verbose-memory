const dotenv = require('dotenv');
dotenv.config();

const config = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare',
    jwtSecret: process.env.JWT_SECRET || 'change-me-secret',
    corsOrigin: process.env.CORS_ORIGIN || '*',
    apiKey: process.env.ESP32_API_KEY,
    disableSocket: process.env.VERCEL === '1' || process.env.DISABLE_SOCKET === 'true',
};

module.exports = config;
