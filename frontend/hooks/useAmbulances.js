'use client';
import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { generateMockAmbulances } from '../services/mockData';
import { useSocket } from '../context/SocketContext';

export function useAmbulances() {
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const { latestLocation, latestVitals } = useSocket();

  const fetchAmbulances = useCallback(async () => {
    try {
      const res = await api.get('/api/ambulances');
      setAmbulances(res.data.data.ambulances);
      setError(null);
    } catch (err) {
      console.warn('Backend unreachable — using mock ambulances');
      setAmbulances(generateMockAmbulances());
      setError('offline');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => { fetchAmbulances(); }, [fetchAmbulances]);

  // Apply real-time location + vitals updates from socket
  useEffect(() => {
    if (Object.keys(latestLocation).length === 0 && Object.keys(latestVitals).length === 0) return;

    setAmbulances((prev) =>
      prev.map((amb) => {
        const loc = latestLocation[amb.device_id];
        const vit = latestVitals[amb.device_id];
        if (!loc && !vit) return amb;
        return {
          ...amb,
          ...(loc && { latitude: loc.latitude, longitude: loc.longitude, speed: loc.speed }),
          ...(vit && {
            latestVitals: {
              hr:          vit.hr,
              spo2:        vit.spo2,
              temperature: vit.temperature,
              status:      vit.status,
              updatedAt:   vit.timestamp,
            },
          }),
        };
      })
    );
  }, [latestLocation, latestVitals]);

  const stats = {
    total:    ambulances.length,
    online:   ambulances.filter((a) => a.isOnline).length,
    critical: ambulances.filter((a) => a.latestVitals?.status === 'Critical').length,
    warning:  ambulances.filter((a) => a.latestVitals?.status === 'Warning').length,
  };

  return { ambulances, loading, error, stats, refresh: fetchAmbulances };
}
