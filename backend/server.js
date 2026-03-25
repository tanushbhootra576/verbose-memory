require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { Patient, Vitals, Ambulance } = require('./models');

const app = express();
const server = http.createServer(app);

// WebSocket Setup
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare', {})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB connection error:', err));

const verifyApiKey = (req, res, next) => {
    // If not using api-key initially for quick test, you can conditionally skip it
    if (process.env.ESP32_API_KEY && req.headers['x-api-key'] !== process.env.ESP32_API_KEY) {
        return res.status(401).json({ error: 'Unauthorized ESP32 Device' });
    }
    next();
};

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// POST /api/vitals -> Receive ESP32 data
app.post('/api/vitals', verifyApiKey, async (req, res) => {
    try {
        console.log("ESP32 Incoming Data:", req.body); // DEBUGGING: Log to verify what ESP32 is sending

        // Extreme Robustness for different ESP32 property names
        const patientId = req.body.patientId || req.body.patient_id || req.body.device_id || "unknown";
        const heartRate = req.body.heartRate || req.body.hr || 80;
        const spO2 = req.body.spO2 !== undefined ? req.body.spO2 : (req.body.spo2 || 98);

        const latRaw = req.body.lat !== undefined ? req.body.lat : req.body.latitude;
        const lngRaw = req.body.lng !== undefined ? req.body.lng : req.body.longitude;

        const temperature = req.body.temp || req.body.temperature || (36.5 + Math.random() * 1.5).toFixed(1);
        const respirationRate = req.body.resp || req.body.respirationRate || Math.floor(12 + Math.random() * 8);
        const bloodPressure = req.body.bp || req.body.bloodPressure || `${Math.floor(110 + Math.random() * 20)}/${Math.floor(70 + Math.random() * 15)}`;

        // Ensure lat/lng parse. Fallback if not provided by ESP
        const latitude = latRaw !== undefined ? Number(latRaw) : 34.0522;
        const longitude = lngRaw !== undefined ? Number(lngRaw) : -118.2437;

        let condition = 'Normal';
        if (spO2 < 90) condition = 'Critical';
        else if (heartRate > 100 || heartRate < 60) condition = 'Warning';

        const vital = new Vitals({
            patient_id: patientId,
            device_id: patientId,
            hr: heartRate,
            spo2: spO2,
            temperature: parseFloat(temperature),
            latitude,
            longitude,
            condition,
            timestamp: new Date()
        });
        await vital.save();

        console.log(`Saved Vital for ${patientId}: lat=${latitude}, lng=${longitude}`);

        // Broadcast via WebSocket to subscribers of this patient and globally
        io.emit('vitalsUpdate', vital);
        io.emit(`vitals-${patientId}`, vital);

        res.status(201).json(vital);
    } catch (error) {
        console.error("Vitals POST Error:", error);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/location -> Mobile Location Sender
app.post('/api/location', async (req, res) => {
    try {
        const { patientId, latitude, longitude } = req.body;
        const latestVital = await Vitals.findOne({ patient_id: patientId }).sort({ timestamp: -1 });

        const vital = new Vitals({
            patient_id: patientId,
            device_id: patientId,
            hr: latestVital ? latestVital.hr : 80,
            spo2: latestVital ? latestVital.spo2 : 98,
            temperature: latestVital ? latestVital.temperature : 36.5,
            latitude: latitude,
            longitude: longitude,
            condition: 'Normal',
            timestamp: new Date()
        });
        await vital.save();

        io.emit('vitalsUpdate', vital);
        io.emit(`location-${patientId}`, vital);
        io.emit(`vitals-${patientId}`, vital);

        res.status(200).json(vital);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/patients
app.get('/api/patients', async (req, res) => {
    try {
        const patients = await Patient.find();
        const patientsWithVitals = await Promise.all(patients.map(async p => {
            const vitals = await Vitals.findOne({ patientId: p._id }).sort({ timestamp: -1 });
            return { ...p._doc, vitals };
        }));
        res.json(patientsWithVitals);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/patient/:id', async (req, res) => {
    try {
        const vitals = await Vitals.find({ patient_id: req.params.id }).sort({ timestamp: -1 }).limit(30);
        res.json({ patient_id: req.params.id, history: vitals, latest: vitals[0] });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/vitals/:id', async (req, res) => {
    try {
        const vitals = await Vitals.find({ patient_id: req.params.id })
            .sort({ timestamp: -1 })
            .limit(50);
        res.json(vitals);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
module.exports = app;
