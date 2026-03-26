'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';

/**
 * Track real-time vitals for a given device_id.
 * Maintains a rolling history of `maxHistory` readings.
 */
export function useVitals(deviceId, maxHistory = 30) {
  const { latestVitals, addEventListener } = useSocket();
  const [history, setHistory] = useState([]);
  const [latest, setLatest]   = useState(null);
  const idRef = useRef(`vitals-hook-${deviceId}-${Date.now()}`);

  // Initialize from context snapshot
  useEffect(() => {
    if (deviceId && latestVitals[deviceId]) {
      setLatest(latestVitals[deviceId]);
    }
  }, [deviceId]); // eslint-disable-line

  // Subscribe to new events
  useEffect(() => {
    if (!deviceId) return;

    const unsub = addEventListener(idRef.current, (event, data) => {
      if (event !== 'vitalsUpdate') return;
      if (data.device_id !== deviceId) return;

      setLatest(data);
      setHistory((prev) => {
        const next = [...prev, { ...data, ts: Date.now() }];
        return next.slice(-maxHistory);
      });
    });

    return unsub;
  }, [deviceId, maxHistory, addEventListener]);

  return { latest, history };
}
