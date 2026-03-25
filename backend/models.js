const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
    name: String,
    age: Number,
    condition: String,
    history: [String],
});

const VitalsSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
    heartRate: Number,
    spO2: Number,
    timestamp: { type: Date, default: Date.now },
});

const AmbulanceSchema = new mongoose.Schema({
    ambulanceId: String,
    location: { lat: Number, lng: Number },
    status: { type: String, enum: ['Available', 'Dispatched', 'Busy'], default: 'Available' },
    assignedPatient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', default: null },
});

module.exports = {
    Patient: mongoose.model('Patient', PatientSchema),
    Vitals: mongoose.model('Vitals', VitalsSchema),
    Ambulance: mongoose.model('Ambulance', AmbulanceSchema)
};
