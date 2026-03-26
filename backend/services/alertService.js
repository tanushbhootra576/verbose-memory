/**
 * Determine alert status from vital signs.
 * Returns 'Critical', 'Warning', or 'Normal'
 */
const computeStatus = ({ hr, spo2, temperature }) => {
  // Critical conditions
  if (
    spo2 < 90 ||
    hr < 40 ||
    hr > 150 ||
    temperature > 40.5 ||
    temperature < 35
  ) {
    return 'Critical';
  }

  // Warning conditions
  if (
    spo2 < 95 ||
    hr < 55 ||
    hr > 110 ||
    temperature > 38.5 ||
    temperature < 36.0
  ) {
    return 'Warning';
  }

  return 'Normal';
};

/**
 * AI-inspired condition score (0–100, higher = more critical)
 */
const computeConditionScore = ({ hr, spo2, temperature }) => {
  let score = 0;

  // SpO2 scoring (most critical)
  if (spo2 < 90)      score += 50;
  else if (spo2 < 93) score += 30;
  else if (spo2 < 95) score += 15;
  else if (spo2 < 97) score += 5;

  // HR scoring
  const hrDeviation = Math.abs(hr - 75);
  score += Math.min(30, hrDeviation * 0.5);

  // Temperature scoring
  const tempDeviation = Math.abs(temperature - 37.0);
  score += Math.min(20, tempDeviation * 5);

  return Math.round(Math.min(100, score));
};

/**
 * Generate a human-readable alert message
 */
const generateAlertMessage = ({ hr, spo2, temperature }) => {
  const alerts = [];
  if (spo2 < 90)        alerts.push(`Critical SpO2: ${spo2}%`);
  else if (spo2 < 95)   alerts.push(`Low SpO2: ${spo2}%`);
  if (hr > 150)         alerts.push(`Dangerously high HR: ${hr} bpm`);
  else if (hr > 110)    alerts.push(`Elevated HR: ${hr} bpm`);
  else if (hr < 40)     alerts.push(`Dangerously low HR: ${hr} bpm`);
  else if (hr < 55)     alerts.push(`Low HR: ${hr} bpm`);
  if (temperature > 40.5) alerts.push(`Hyperthermia: ${temperature}°C`);
  else if (temperature > 38.5) alerts.push(`Fever: ${temperature}°C`);
  else if (temperature < 35)   alerts.push(`Hypothermia: ${temperature}°C`);
  return alerts;
};

module.exports = { computeStatus, computeConditionScore, generateAlertMessage };
