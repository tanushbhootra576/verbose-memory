const Ambulance = require('../models/Ambulance');
const VitalSign = require('../models/VitalSign');
const { computeStatus, computeConditionScore, generateAlertMessage } = require('./alertService');
const logger = require('../utils/logger');

const CITIES = [
  { name: 'New Delhi',  lat: 28.6139, lng: 77.2090 },
  { name: 'Mumbai',     lat: 19.0760, lng: 72.8777 },
  { name: 'Bangalore',  lat: 12.9716, lng: 77.5946 },
  { name: 'Chennai',    lat: 13.0827, lng: 80.2707 },
  { name: 'Hyderabad',  lat: 17.3850, lng: 78.4867 },
  { name: 'Kolkata',    lat: 22.5726, lng: 88.3639 },
];

// In-memory state for smooth movement simulation
const ambulanceState = {};

const randomBetween = (min, max) => min + Math.random() * (max - min);

const generateMockVitals = (patientId) => {
  const isCritical = patientId === 'P001';
  const isWarning  = patientId === 'P002' || patientId === 'P003';

  if (isCritical) {
    return {
      hr:          Math.round(randomBetween(120, 155)),
      spo2:        Math.round(randomBetween(83, 89)),
      temperature: parseFloat(randomBetween(39.5, 40.8).toFixed(1)),
    };
  }
  if (isWarning) {
    return {
      hr:          Math.round(randomBetween(105, 125)),
      spo2:        Math.round(randomBetween(91, 94)),
      temperature: parseFloat(randomBetween(38.0, 39.2).toFixed(1)),
    };
  }
  // Normal with slight random drift
  return {
    hr:          Math.round(randomBetween(68, 95)),
    spo2:        Math.round(randomBetween(96, 100)),
    temperature: parseFloat(randomBetween(36.4, 37.4).toFixed(1)),
  };
};

const simulateMovement = (state, cityBase) => {
  const drift = 0.0005;
  state.lat += randomBetween(-drift, drift);
  state.lng += randomBetween(-drift, drift);

  // Keep within geo-fence of city
  const maxDrift = 0.08;
  if (Math.abs(state.lat - cityBase.lat) > maxDrift) state.lat = cityBase.lat;
  if (Math.abs(state.lng - cityBase.lng) > maxDrift) state.lng = cityBase.lng;

  return { lat: state.lat, lng: state.lng };
};

const startMockSimulation = async (io) => {
  // Load ambulances from DB
  let ambulances;
  try {
    ambulances = await Ambulance.find({ isActive: true });
    if (ambulances.length === 0) {
      logger.warn('No ambulances found in DB for mock simulation. Run: npm run seed');
      return;
    }
  } catch (err) {
    logger.error(`Mock simulation failed to load ambulances: ${err.message}`);
    return;
  }

  // Initialize movement state
  ambulances.forEach((amb, i) => {
    const city = CITIES[i % CITIES.length];
    ambulanceState[amb.device_id] = {
      lat: amb.latitude || city.lat,
      lng: amb.longitude || city.lng,
      cityBase: city,
    };
  });

  logger.info(`🤖 Mock simulation started for ${ambulances.length} ambulances (5s interval)`);

  setInterval(async () => {
    for (const amb of ambulances) {
      try {
        const vitals = generateMockVitals(amb.patient_id);
        const status = computeStatus(vitals);
        const conditionScore = computeConditionScore(vitals);
        const alerts = generateAlertMessage(vitals);

        const state = ambulanceState[amb.device_id];
        const { lat, lng } = simulateMovement(state, state.cityBase);
        const speed = parseFloat(randomBetween(15, 75).toFixed(1));

        const payload = {
          device_id:    amb.device_id,
          patient_id:   amb.patient_id,
          ...vitals,
          latitude:     lat,
          longitude:    lng,
          speed,
          status,
          conditionScore,
          alerts,
          ambulance_id: amb.ambulance_id,
          timestamp:    new Date().toISOString(),
        };

        // Save to DB
        await VitalSign.create({ ...vitals, device_id: amb.device_id, patient_id: amb.patient_id, latitude: lat, longitude: lng, speed, status });

        // Update ambulance
        await Ambulance.findOneAndUpdate(
          { device_id: amb.device_id },
          {
            latitude: lat, longitude: lng, speed, isOnline: true,
            'latestVitals.hr': vitals.hr,
            'latestVitals.spo2': vitals.spo2,
            'latestVitals.temperature': vitals.temperature,
            'latestVitals.status': status,
            'latestVitals.updatedAt': new Date(),
          }
        );

        // Emit events
        io.emit('vitalsUpdate', payload);
        io.emit('locationUpdate', {
          device_id: amb.device_id, patient_id: amb.patient_id,
          latitude: lat, longitude: lng, speed, timestamp: payload.timestamp,
        });
        io.to(`ambulance:${amb.ambulance_id}`).emit('vitalsUpdate', payload);
        io.to(`patient:${amb.patient_id}`).emit('vitalsUpdate', payload);

      } catch (err) {
        logger.error(`Mock simulation error for ${amb.device_id}: ${err.message}`);
      }
    }
  }, 5000);
};

module.exports = { startMockSimulation };
