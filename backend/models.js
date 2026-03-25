const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
    patient_id: { type: String, unique: true },
    device_id: String,
    name: String,
    age: Number,
    condition: String,
});

const VitalsSchema = new mongoose.Schema({
    patient_id: String,
    device_id: String,
    hr: Number,
    spo2: Number,
    temperature: Number,
    latitude: Number,
    longitude: Number,
    condition: String,
    timestamp: { type: Date, default: Date.now },
});

const AmbulanceSchema = new mongoose.Schema({
    ambulance_id: String,
    patient_id: String,
    latitude: Number,
    longitude: Number,
    status: { type: String, enum: ['Available', 'Dispatched', 'Busy'], default: 'Available' },
    timestamp: { type: Date, default: Date.now },
});

module.exports = {
    Patient: mongoose.model('Patient', PatientSchema),
    Vitals: mongoose.model('Vitals', VitalsSchema),
    Ambulance: mongoose.model('Ambulance', AmbulanceSchema)
};
