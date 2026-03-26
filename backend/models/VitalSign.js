const mongoose = require('mongoose');

const VitalSignSchema = new mongoose.Schema(
  {
    device_id: { type: String, required: true, index: true },
    patient_id: { type: String, required: true, index: true },
    hr: { type: Number, required: true },           // Heart Rate (bpm)
    spo2: { type: Number, required: true },          // Blood Oxygen (%)
    temperature: { type: Number, required: true },   // Body Temp (°C)
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    speed: { type: Number, default: 0 },             // km/h
    status: {
      type: String,
      enum: ['Normal', 'Warning', 'Critical'],
      default: 'Normal',
    },
    raw: { type: mongoose.Schema.Types.Mixed },      // Original ESP32 payload
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// TTL — auto-delete readings older than 7 days
VitalSignSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

module.exports = mongoose.model('VitalSign', VitalSignSchema);
