// Client-side mock data (used when backend is unreachable)

const NAMES = ['Rajesh Kumar', 'Priya Sharma', 'Amit Singh', 'Sunita Patel', 'Vikram Reddy', 'Anjali Mehta'];
const CITIES = [
  { name: 'New Delhi',  lat: 28.6139, lng: 77.2090 },
  { name: 'Mumbai',     lat: 19.0760, lng: 72.8777 },
  { name: 'Bangalore',  lat: 12.9716, lng: 77.5946 },
  { name: 'Chennai',    lat: 13.0827, lng: 80.2707 },
  { name: 'Hyderabad',  lat: 17.3850, lng: 78.4867 },
  { name: 'Kolkata',    lat: 22.5726, lng: 88.3639 },
];

const r = (min, max) => min + Math.random() * (max - min);
const ri = (min, max) => Math.floor(r(min, max + 1));

export const generateMockAmbulances = (count = 6) => {
  return Array.from({ length: count }, (_, i) => {
    const city = CITIES[i % CITIES.length];
    const isCritical = i === 0;
    const isWarning  = i === 1 || i === 2;

    const hr   = isCritical ? ri(130,155) : isWarning ? ri(105,120) : ri(68,95);
    const spo2 = isCritical ? ri(83,89)   : isWarning ? ri(91,94)   : ri(96,100);
    const temp = isCritical ? r(39.5,40.5).toFixed(1) : isWarning ? r(38.0,39.0).toFixed(1) : r(36.4,37.4).toFixed(1);

    return {
      ambulance_id:   `AMB00${i + 1}`,
      device_id:      `ESP${String(i + 1).padStart(3, '0')}`,
      patient_id:     `P00${i + 1}`,
      vehicle_number: `DL-${ri(1000, 9999)}-AMB`,
      driver_name:    ['Suresh', 'Ramesh', 'Mahesh', 'Dinesh', 'Brijesh', 'Harish'][i],
      hospital_destination: ['AIIMS Delhi', 'Apollo Hospital', 'Fortis Hospital','Max Healthcare','Medanta','Lilavati Hospital'][i],
      latitude:       city.lat + r(-0.03, 0.03),
      longitude:      city.lng + r(-0.03, 0.03),
      speed:          r(15, 70).toFixed(1),
      isOnline:       true,
      isActive:       true,
      dispatchedAt:   new Date(Date.now() - ri(5, 30) * 60000).toISOString(),
      responseTime:   ri(8, 25),
      latestVitals: {
        hr: Number(hr), spo2: Number(spo2), temperature: Number(temp),
        status: isCritical ? 'Critical' : isWarning ? 'Warning' : 'Normal',
        updatedAt: new Date().toISOString(),
      },
      patient: {
        patient_id: `P00${i + 1}`,
        name: NAMES[i],
        age: ri(30, 75),
        gender: i % 2 === 0 ? 'Male' : 'Female',
        bloodGroup: ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-'][i],
        emergencyPriority: isCritical ? 'Critical' : isWarning ? 'High' : 'Medium',
      },
    };
  });
};

export const generateMockVitalsHistory = (deviceId, count = 30) => {
  const base = { hr: 78, spo2: 97, temperature: 37.0 };
  return Array.from({ length: count }, (_, i) => ({
    device_id: deviceId,
    hr:          Math.round(base.hr + r(-10, 10)),
    spo2:        Math.round(base.spo2 + r(-4, 1)),
    temperature: parseFloat((base.temperature + r(-0.5, 0.5)).toFixed(1)),
    speed:       r(10, 70).toFixed(1),
    status:      'Normal',
    timestamp:   new Date(Date.now() - (count - i) * 5000).toISOString(),
    createdAt:   new Date(Date.now() - (count - i) * 5000).toISOString(),
  }));
};
