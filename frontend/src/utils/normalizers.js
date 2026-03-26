export const normalizeData = (data = {}) => {
    const patient_id = data.patient_id || data.patientId || data.device_id || data.deviceId;
    const device_id = data.device_id || data.deviceId || patient_id;
    const hr = data.hr ?? data.heartRate ?? 0;
    const spo2 = data.spo2 ?? data.spO2 ?? data.SpO2 ?? 0;
    const temperature = data.temperature ?? data.temp ?? 0;
    const latitude = data.latitude ?? data.lat;
    const longitude = data.longitude ?? data.lng;
    const speed = data.speed ?? 0;
    const status = data.status || 'Normal';
    const timestamp = data.timestamp || new Date().toISOString();
    return { patient_id, device_id, hr, spo2, temperature, latitude, longitude, speed, status, timestamp };
};

export const conditionLabel = (spo2, hr, temperature) => {
    if (spo2 < 90 || hr > 130 || hr < 50 || temperature > 39.5) return 'Critical';
    if (spo2 < 94 || hr > 100 || hr < 60 || temperature > 38) return 'Warning';
    return 'Normal';
};
