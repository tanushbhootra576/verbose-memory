'use client';

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const [connected, setConnected]         = useState(false);
  const [latestVitals, setLatestVitals]   = useState({});   // keyed by device_id
  const [latestLocation, setLatestLocation] = useState({}); // keyed by device_id
  const listenersRef = useRef({});

  useEffect(() => {
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

    const socket = io(SOCKET_URL, {
      transports:         ['websocket', 'polling'],
      reconnection:       true,
      reconnectionDelay:  1000,
      reconnectionAttempts: Infinity,
      timeout:            20000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      console.log('[Socket] Connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      setConnected(false);
      console.warn('[Socket] Disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
    });

    socket.on('vitalsUpdate', (data) => {
      setLatestVitals((prev) => ({ ...prev, [data.device_id]: data }));
      // Notify registered listeners
      Object.values(listenersRef.current).forEach((cb) => cb('vitalsUpdate', data));
    });

    socket.on('locationUpdate', (data) => {
      setLatestLocation((prev) => ({ ...prev, [data.device_id]: data }));
      Object.values(listenersRef.current).forEach((cb) => cb('locationUpdate', data));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Subscribe to a specific ambulance room
  const subscribeAmbulance = useCallback((ambulanceId) => {
    socketRef.current?.emit('subscribe:ambulance', ambulanceId);
  }, []);

  const subscribePatient = useCallback((patientId) => {
    socketRef.current?.emit('subscribe:patient', patientId);
  }, []);

  // Register an event listener (returns unsubscribe function)
  const addEventListener = useCallback((id, callback) => {
    listenersRef.current[id] = callback;
    return () => { delete listenersRef.current[id]; };
  }, []);

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      connected,
      latestVitals,
      latestLocation,
      subscribeAmbulance,
      subscribePatient,
      addEventListener,
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};
