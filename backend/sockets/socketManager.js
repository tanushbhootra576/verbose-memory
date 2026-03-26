const { Server } = require('socket.io');
const config = require('../config');
const logger = require('../utils/logger');

let io = null;

const initSocket = (server) => {
    if (config.disableSocket) {
        logger.warn('Socket.io disabled for this environment');
        return null;
    }
    io = new Server(server, {
        cors: {
            origin: config.corsOrigin,
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        logger.info(`Socket connected: ${socket.id}`);
        socket.on('disconnect', (reason) => logger.info(`Socket disconnected: ${socket.id} - ${reason}`));
    });
    return io;
};

const emitVitals = (payload) => {
    if (!io) return;
    io.emit('vitalsUpdate', payload);
    if (payload.patient_id) io.emit(`vitals-${payload.patient_id}`, payload);
};

const emitLocation = (payload) => {
    if (!io) return;
    io.emit('locationUpdate', payload);
    if (payload.ambulance_id) io.emit(`ambulance-${payload.ambulance_id}`, payload);
    if (payload.patient_id) io.emit(`location-${payload.patient_id}`, payload);
};

const getIO = () => io;

module.exports = {
    initSocket,
    emitVitals,
    emitLocation,
    getIO,
};
