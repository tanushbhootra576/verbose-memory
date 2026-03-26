require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const socketHandler = require('./sockets/socketHandler');
const logger = require('./utils/logger');

// Routes
const vitalsRoutes    = require('./routes/vitals');
const ambulancesRoutes = require('./routes/ambulances');
const patientsRoutes  = require('./routes/patients');
const authRoutes      = require('./routes/auth');

const app = express();
const server = http.createServer(app);

// ─── Socket.IO ───────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Attach io to app so controllers can emit events
app.set('io', io);
socketHandler(io);

// ─── Database ─────────────────────────────────────────────────────────────────
connectDB();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// Rate limiting — more lenient for device endpoint
const deviceLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 300,
  message: { success: false, message: 'Too many requests from this device.' },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/vitals',      deviceLimiter, vitalsRoutes);
app.use('/api/ambulances',  apiLimiter, ambulancesRoutes);
app.use('/api/patients',    apiLimiter, patientsRoutes);
app.use('/api/patient',     apiLimiter, patientsRoutes); // alias
app.use('/api/auth',        apiLimiter, authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Catch-all 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Global error handler
app.use(errorHandler);

// ─── Mock data simulation (if enabled) ───────────────────────────────────────
if (process.env.ENABLE_MOCK_DATA === 'true') {
  const { startMockSimulation } = require('./services/mockDataService');
  startMockSimulation(io);
}

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`🚀 Healthcare IoT Server running on http://localhost:${PORT}`);
  logger.info(`🔌 Socket.IO ready`);
  logger.info(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Closing server...');
  server.close(() => {
    logger.info('Server closed.');
    process.exit(0);
  });
});

module.exports = { app, server };
