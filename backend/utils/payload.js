const DEFAULT_LAT = 34.0522;
const DEFAULT_LNG = -118.2437;

const computeStatus = ({ hr, spo2, temperature }) => {
    if (spo2 < 90 || hr < 50 || hr > 130 || temperature > 39.5) return 'Critical';
    if (hr < 60 || hr > 100 || spo2 < 94 || temperature > 38) return 'Warning';
    return 'Normal';
};

const toNumber = (val, fallback) => {
    const num = Number(val);
    return Number.isFinite(num) ? num : fallback;
};

const normalizePayload = (data = {}) => {
    const patientId = data.patient_id || data.patientId || data.device_id || data.deviceId || 'unknown';
    const deviceId = data.device_id || data.deviceId || patientId;
    const hr = toNumber(data.hr ?? data.heartRate, 80);
    const spo2 = toNumber(data.spo2 ?? data.SpO2 ?? data.spO2, 98);
    const temperature = toNumber(data.temperature ?? data.temp, 36.6);
    const latitude = toNumber(data.latitude ?? data.lat, DEFAULT_LAT);
    const longitude = toNumber(data.longitude ?? data.lng, DEFAULT_LNG);
    const speed = toNumber(data.speed, Math.floor(20 + Math.random() * 60));
    const status = data.status || computeStatus({ hr, spo2, temperature });
    const timestamp = data.timestamp ? new Date(data.timestamp) : new Date();

    return {
        device_id: deviceId,
        patient_id: patientId,
        hr,
        spo2,
        temperature,
        latitude,
        longitude,
        speed,
        status,
        timestamp
    };
};

module.exports = {
    normalizePayload,
    computeStatus,
};
