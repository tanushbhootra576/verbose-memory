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
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare', {})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB connection error:', err));

// Middleware: API Key Validation for ESP32
const verifyApiKey = (req, res, next) => {
    if (req.headers['x-api-key'] !== process.env.ESP32_API_KEY) {
        return res.status(401).json({ error: 'Unauthorized ESP32 Device' });
    }
    next();
};

// Middleware: JWT for Dashboards
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(403).send('A token is required for authentication');

    const token = authHeader.split(' ')[1];
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    } catch (err) {
        return res.status(401).send('Invalid Token');
    }
    next();
};

// --- REST APIs ---
// GET /api/health -> Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// POST /api/vitals -> Receive ESP32 data (Internal / IoT)
app.post('/api/vitals', verifyApiKey, async (req, res) => {
    try {
        const { patientId, heartRate, spO2 } = req.body;
        const vital = new Vitals({ patientId, heartRate, spO2 });
        await vital.save();

        // Broadcast via WebSocket to subscribers of this patient
        io.emit(`vitals-${patientId}`, vital);
        res.status(201).json(vital);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/patient/:id -> Get patient details
app.get('/api/patient/:id', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        res.json(patient);
    } catch (error) {
        res.status(404).json({ error: 'Patient not found' });
    }
});

// GET /api/vitals/:id -> Get live + history
app.get('/api/vitals/:id', async (req, res) => {
    try {
        const vitals = await Vitals.find({ patientId: req.params.id })
            .sort({ timestamp: -1 })
            .limit(50);
        res.json(vitals);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/ambulance
app.get('/api/ambulance', async (req, res) => {
    try {
        const ambulances = await Ambulance.find().populate('assignedPatient');
        res.json(ambulances);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Basic Login Route for Dashboards
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    // In production, verify against DB using bcrypt
    if (username === 'admin' && password === 'password123') {
        const token = jwt.sign({ username, role: 'admin' }, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '2h' });
        res.json({ token });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Seed data route for testing
app.post('/api/seed', async (req, res) => {
    try {
        const p1 = await Patient.create({ name: 'John Doe', age: 45, condition: 'Stable', history: ['Hypertension'] });
        const a1 = await Ambulance.create({ ambulanceId: 'AMB-001', location: { lat: 34.0522, lng: -118.2437 }, status: 'Available' });
        res.json({ message: 'Seeded successfully', patientId: p1._id });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// WebSocket Connection
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;

// Only listen locally, allow Vercel to handle execution in Serverless mode
if (!process.env.VERCEL) {
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export the express app to be consumed as a Serverless Function
module.exports = app;
