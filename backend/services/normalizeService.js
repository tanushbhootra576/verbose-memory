/**
 * Normalize raw ESP32 payload to our standard schema.
 * Handles different field names sent by different firmware versions.
 */
const normalizeVitalPayload = (data) => {
  // Fallback coordinates (New Delhi city centre)
  const DEFAULT_LAT = 28.6139;
  const DEFAULT_LNG = 77.2090;

  const hr = data.hr ?? data.heartRate ?? data.heart_rate ?? 75;
  const spo2 = data.spo2 ?? data.SpO2 ?? data.oxygen ?? 97;
  const temperature =
    data.temperature ?? data.temp ?? data.bodyTemp ?? 37.0;

  const latitude =
    data.latitude ?? data.lat ?? data.gps_lat ?? DEFAULT_LAT;
  const longitude =
    data.longitude ?? data.lng ?? data.lon ?? data.gps_lng ?? DEFAULT_LNG;

  // Mock speed if not provided (0–80 km/h range)
  const speed =
    data.speed != null
      ? data.speed
      : parseFloat((Math.random() * 80).toFixed(1));

  return {
    device_id:   String(data.device_id || data.deviceId || 'UNKNOWN'),
    patient_id:  String(data.patient_id || data.patientId || 'P000'),
    hr:          Number(hr),
    spo2:        Number(spo2),
    temperature: Number(temperature),
    latitude:    Number(latitude),
    longitude:   Number(longitude),
    speed:       Number(speed),
    raw:         data,
  };
};

module.exports = { normalizeVitalPayload };
