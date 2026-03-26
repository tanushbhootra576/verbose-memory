const logger = require('../utils/logger');

const socketHandler = (io) => {
  // Track connected clients
  let connectedClients = 0;

  io.on('connection', (socket) => {
    connectedClients++;
    logger.info(`Socket client connected: ${socket.id} (total: ${connectedClients})`);

    // Send current timestamp on connect
    socket.emit('connected', {
      message: 'Real-time connection established',
      timestamp: new Date().toISOString(),
    });

    // Client subscribes to a specific ambulance room
    socket.on('subscribe:ambulance', (ambulanceId) => {
      socket.join(`ambulance:${ambulanceId}`);
      logger.debug(`Socket ${socket.id} subscribed to ambulance:${ambulanceId}`);
    });

    socket.on('unsubscribe:ambulance', (ambulanceId) => {
      socket.leave(`ambulance:${ambulanceId}`);
    });

    // Client subscribes to a patient
    socket.on('subscribe:patient', (patientId) => {
      socket.join(`patient:${patientId}`);
      logger.debug(`Socket ${socket.id} subscribed to patient:${patientId}`);
    });

    socket.on('disconnect', (reason) => {
      connectedClients = Math.max(0, connectedClients - 1);
      logger.info(`Socket client disconnected: ${socket.id} — reason: ${reason} (remaining: ${connectedClients})`);
    });

    socket.on('error', (err) => {
      logger.error(`Socket error [${socket.id}]: ${err.message}`);
    });
  });

  // Helper method to emit vitals to both global and patient/ambulance rooms
  io.emitVitalsUpdate = (payload) => {
    io.emit('vitalsUpdate', payload);
    if (payload.patient_id) {
      io.to(`patient:${payload.patient_id}`).emit('vitalsUpdate', payload);
    }
    if (payload.device_id) {
      io.to(`ambulance:${payload.device_id}`).emit('vitalsUpdate', payload);
    }
  };
};

module.exports = socketHandler;
