const mongoose = require('mongoose');

const MedicalHistorySchema = new mongoose.Schema({
  condition: String,
  diagnosedAt: Date,
  notes: String,
});

const PatientSchema = new mongoose.Schema(
  {
    patient_id: { type: String, required: true, unique: true },
    name:        { type: String, required: true },
    age:         { type: Number, required: true },
    gender:      { type: String, enum: ['Male', 'Female', 'Other'] },
    bloodGroup:  { type: String },
    contact:     { type: String },
    address:     { type: String },
    medicalHistory: [MedicalHistorySchema],
    assignedAmbulance: { type: String, default: null },
    assignedDoctor:    { type: String, default: null },
    emergencyPriority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('Patient', PatientSchema);
