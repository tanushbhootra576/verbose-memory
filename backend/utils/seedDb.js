require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Patient = require('../models/Patient');
const Ambulance = require('../models/Ambulance');
const User = require('../models/User');
const VitalSign = require('../models/VitalSign');
const logger = require('./logger');

const CITIES = [
  { name: 'New Delhi', lat: 28.6139, lng: 77.2090 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
];

const NAMES = ['Rajesh Kumar', 'Priya Sharma', 'Amit Singh', 'Sunita Patel', 'Vikram Reddy', 'Anjali Mehta', 'Rahul Gupta'];
const CONDITIONS = ['Hypertension', 'Diabetes Type 2', 'Asthma', 'Cardiac Arrhythmia', 'COPD'];

const randomBetween = (min, max) => Math.random() * (max - min) + min;
const randomInt = (min, max) => Math.floor(randomBetween(min, max + 1));
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateVitals = (isCritical = false) => {
  if (isCritical) {
    return {
      hr: randomInt(130, 160),
      spo2: randomInt(82, 89),
      temperature: parseFloat(randomBetween(39.5, 41.0).toFixed(1)),
    };
  }
  return {
    hr: randomInt(65, 100),
    spo2: randomInt(96, 100),
    temperature: parseFloat(randomBetween(36.4, 37.5).toFixed(1)),
  };
};

const seed = async () => {
  await connectDB();
  logger.info('Seeding database...');

  // Clean existing data
  await Promise.all([
    Patient.deleteMany({}),
    Ambulance.deleteMany({}),
    VitalSign.deleteMany({}),
    User.deleteMany({}),
  ]);
  logger.info('Cleared existing data');

  // Create admin and doctor users
  const users = await User.create([
    {
      name: 'Admin User',
      email: 'admin@healthiot.com',
      password: 'Admin@123',
      role: 'admin',
      department: 'Management',
    },
    {
      name: 'Dr. Rajan Mehta',
      email: 'doctor@healthiot.com',
      password: 'Doctor@123',
      role: 'doctor',
      department: 'Emergency Medicine',
      specialization: 'Cardiology',
    },
  ]);
  logger.info(`Created ${users.length} users`);

  // Create patients
  const patients = [];
  for (let i = 1; i <= 6; i++) {
    const city = CITIES[i - 1];
    const p = await Patient.create({
      patient_id: `P00${i}`,
      name: NAMES[i - 1],
      age: randomInt(30, 75),
      gender: i % 2 === 0 ? 'Female' : 'Male',
      bloodGroup: randomItem(['A+', 'B+', 'O+', 'AB+', 'A-']),
      contact: `+91 9${randomInt(100000000, 999999999)}`,
      address: `${randomInt(1, 200)}, ${city.name}`,
      medicalHistory: [
        {
          condition: randomItem(CONDITIONS),
          diagnosedAt: new Date(Date.now() - randomInt(365, 3650) * 86400000),
          notes: 'Under regular medication',
        },
      ],
      assignedAmbulance: `AMB00${i}`,
      assignedDoctor: 'Dr. Rajan Mehta',
      emergencyPriority: i === 1 ? 'Critical' : i <= 3 ? 'High' : 'Medium',
    });
    patients.push(p);
  }
  logger.info(`Created ${patients.length} patients`);

  // Create ambulances with initial vitals
  const ambulances = [];
  for (let i = 1; i <= 6; i++) {
    const city = CITIES[i - 1];
    const isCritical = i === 1;
    const vitals = generateVitals(isCritical);
    const { computeStatus } = require('../services/alertService');
    const status = computeStatus(vitals);

    const amb = await Ambulance.create({
      ambulance_id:  `AMB00${i}`,
      vehicle_number: `DL-${randomInt(1000, 9999)}-AMB`,
      device_id:     `ESP${String(i).padStart(3, '0')}`,
      patient_id:    `P00${i}`,
      driver_name:   randomItem(['Suresh', 'Ramesh', 'Mahesh', 'Dinesh', 'Brijesh', 'Harish']),
      driver_contact: `+91 8${randomInt(100000000, 999999999)}`,
      hospital_destination: randomItem(['AIIMS Delhi', 'Apollo Hospital', 'Fortis Hospital', 'Max Healthcare', 'Medanta']),
      latitude:  city.lat + randomBetween(-0.05, 0.05),
      longitude: city.lng + randomBetween(-0.05, 0.05),
      speed:     parseFloat(randomBetween(20, 70).toFixed(1)),
      latestVitals: {
        ...vitals,
        status,
        updatedAt: new Date(),
      },
      isActive:    true,
      isOnline:    true,
      dispatchedAt: new Date(Date.now() - randomInt(5, 30) * 60000),
      responseTime: randomInt(8, 25),
    });
    ambulances.push(amb);

    // Seed some initial vital sign readings
    const vitalDocs = [];
    for (let j = 0; j < 20; j++) {
      const v = generateVitals(isCritical && j > 15);
      vitalDocs.push({
        device_id:    `ESP${String(i).padStart(3, '0')}`,
        patient_id:   `P00${i}`,
        ...v,
        latitude:  city.lat + randomBetween(-0.02, 0.02),
        longitude: city.lng + randomBetween(-0.02, 0.02),
        speed:     parseFloat(randomBetween(10, 80).toFixed(1)),
        status:   computeStatus(v),
        createdAt: new Date(Date.now() - (20 - j) * 30000),
      });
    }
    await VitalSign.insertMany(vitalDocs);
  }
  logger.info(`Created ${ambulances.length} ambulances with historical vitals`);

  logger.info('\n✅ Database seeded successfully!');
  logger.info('Login credentials:');
  logger.info('  Admin  → admin@healthiot.com  / Admin@123');
  logger.info('  Doctor → doctor@healthiot.com / Doctor@123');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  logger.error(`Seeding failed: ${err.message}`);
  process.exit(1);
});
