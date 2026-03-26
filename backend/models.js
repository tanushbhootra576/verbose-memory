const mongoose = require('mongoose');

// Patient metadata for dashboards and lookup
const PatientSchema = new mongoose.Schema({
    patient_id: { type: String, unique: true, index: true },
    device_id: { type: String, index: true },
    name: String,
    age: Number,
    condition: String,
    history: [{ type: String }],
}, { timestamps: true });

// Canonical vitals + location payload used everywhere
const VitalsSchema = new mongoose.Schema({
    device_id: { type: String, index: true },
    patient_id: { type: String, index: true },
    hr: Number,
    spo2: Number,
    temperature: Number,
    latitude: Number,
    longitude: Number,
    speed: Number,
    status: { type: String, enum: ['Normal', 'Warning', 'Critical'], default: 'Normal' },
    timestamp: { type: Date, default: Date.now, index: true },
}, { timestamps: true });

// Ambulance state for fleet tracking
const AmbulanceSchema = new mongoose.Schema({
    ambulance_id: { type: String, unique: true, index: true },
    patient_id: { type: String, index: true },
    latitude: Number,
    longitude: Number,
    speed: Number,
    status: { type: String, enum: ['Available', 'Dispatched', 'Busy', 'Critical'], default: 'Available' },
    timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
    email: { type: String, unique: true, index: true },
    password: String,
    role: { type: String, enum: ['admin', 'doctor'], default: 'doctor' }
}, { timestamps: true });

module.exports = {
    Patient: mongoose.model('Patient', PatientSchema),
    Vitals: mongoose.model('Vitals', VitalsSchema),
    Ambulance: mongoose.model('Ambulance', AmbulanceSchema),
    User: mongoose.model('User', UserSchema)
};
