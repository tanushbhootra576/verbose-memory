const mongoose = require('mongoose');

const AmbulanceSchema = new mongoose.Schema(
  {
    ambulance_id:  { type: String, required: true, unique: true },
    vehicle_number: { type: String, required: true },
    device_id:     { type: String, required: true },
    patient_id:    { type: String, default: null },
    driver_name:   { type: String, default: 'Unknown' },
    driver_contact: { type: String, default: '' },
    hospital_destination: { type: String, default: 'City General Hospital' },

    // Current location
    latitude:  { type: Number, default: 28.6139 },
    longitude: { type: Number, default: 77.209 },
    speed:     { type: Number, default: 0 },

    // Current vitals (cached from latest reading)
    latestVitals: {
      hr:          { type: Number, default: null },
      spo2:        { type: Number, default: null },
      temperature: { type: Number, default: null },
      status:      { type: String, default: 'Normal' },
      updatedAt:   { type: Date, default: null },
    },

    isActive:   { type: Boolean, default: true },
    isOnline:   { type: Boolean, default: false },
    responseTime: { type: Number, default: null }, // minutes from dispatch
    dispatchedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('Ambulance', AmbulanceSchema);
