const { Ambulance } = require('../models');
const { computeStatus } = require('../utils/payload');
const { emitLocation } = require('../sockets/socketManager');
const logger = require('../utils/logger');

// In-memory fallback fleet used for demos and when DB empty
let fleetMemory = [
    {
        ambulance_id: 'AMB-001',
        patient_id: null,
        latitude: 34.0522,
        longitude: -118.2437,
        speed: 0,
        status: 'Available',
        timestamp: new Date()
    },
    {
        ambulance_id: 'AMB-002',
        patient_id: 'patient-001',
        latitude: 34.0622,
        longitude: -118.2537,
        speed: 32,
        status: 'Dispatched',
        timestamp: new Date()
    },
];

const listAmbulances = async () => {
    const dbAmbs = await Ambulance.find();
    if (dbAmbs.length === 0) return fleetMemory;
    return dbAmbs;
};

const getAmbulance = async (id) => {
    const amb = await Ambulance.findOne({ ambulance_id: id });
    if (amb) return amb;
    return fleetMemory.find((a) => a.ambulance_id === id) || {
        ambulance_id: id,
        patient_id: null,
        latitude: 34.0522,
        longitude: -118.2437,
        speed: 0,
        status: 'Available',
        timestamp: new Date()
    };
};

const upsertAmbulance = async (payload) => {
    const status = payload.status || computeStatus(payload);
    const doc = await Ambulance.findOneAndUpdate(
        { ambulance_id: payload.ambulance_id },
        { ...payload, status, timestamp: payload.timestamp || new Date() },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    emitLocation(doc);
    return doc;
};

// Light jitter for mock movement; does not persist to DB
const tickMockMovement = () => {
    fleetMemory = fleetMemory.map((amb) => {
        const jitter = () => (Math.random() - 0.5) * 0.002;
        return {
            ...amb,
            latitude: Number((amb.latitude + jitter()).toFixed(5)),
            longitude: Number((amb.longitude + jitter()).toFixed(5)),
            speed: Math.max(0, Math.floor(20 + Math.random() * 50)),
            timestamp: new Date()
        };
    });
    fleetMemory.forEach((amb) => emitLocation(amb));
};

const startMockLoop = () => {
    setInterval(tickMockMovement, 5000);
};

module.exports = {
    listAmbulances,
    getAmbulance,
    upsertAmbulance,
    startMockLoop,
};
