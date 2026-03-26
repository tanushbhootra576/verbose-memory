const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const vitalsRoutes = require('./routes/vitalsRoutes');
const ambulanceRoutes = require('./routes/ambulanceRoutes');
const { initSocket } = require('./sockets/socketManager');
const { ensureSeedUser } = require('./services/authService');
const { startMockLoop } = require('./services/ambulanceService');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Routes
app.use('/api', authRoutes);
app.use('/api', vitalsRoutes);
app.use('/api', ambulanceRoutes);

// Error handler
app.use(errorHandler);

// DB connect
mongoose.connect(config.mongoUri)
    .then(() => logger.info('MongoDB connected'))
    .catch(err => logger.error('MongoDB connection error', err));

// Seed admin user
ensureSeedUser().catch(err => logger.error('Seed user error', err));

// Socket setup
initSocket(server);
startMockLoop();

const PORT = config.port;

if (config.disableSocket && process.env.VERCEL) {
    module.exports = app;
} else {
    server.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
}
