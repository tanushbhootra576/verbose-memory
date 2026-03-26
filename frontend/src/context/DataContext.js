import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchPatients, fetchAmbulances } from '../services/api';
import { getSocket } from '../services/socket';
import { normalizeData, conditionLabel } from '../utils/normalizers';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const { token } = useAuth();
    const [patients, setPatients] = useState([]);
    const [ambulances, setAmbulances] = useState([]);
    const [alerts, setAlerts] = useState([]);

    const alertTone = useMemo(() => new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA='), []);

    // One-time socket subscription (even if not logged in) to keep live updates flowing
    useEffect(() => {
        const socket = getSocket();
        const handleVitals = (payload) => {
            const normalized = normalizeData(payload);
            setPatients((prev) => {
                const next = prev.map((p) => p.patient_id === normalized.patient_id ? { ...p, vitals: normalized } : p);
                const exists = next.find((p) => p.patient_id === normalized.patient_id);
                return exists ? next : [...next, { patient_id: normalized.patient_id, vitals: normalized }];
            });
            const status = conditionLabel(normalized.spo2, normalized.hr, normalized.temperature);
            if (status === 'Critical') {
                setAlerts((prev) => [...prev.slice(-4), { id: normalized.patient_id, message: 'Critical vitals detected', ts: normalized.timestamp }]);
                alertTone.play().catch(() => { });
            }
        };

        const handleLocation = (payload) => {
            const normalized = normalizeData(payload);
            setAmbulances((prev) => {
                const next = prev.map((a) => a.ambulance_id === (payload.ambulance_id || normalized.patient_id)
                    ? { ...a, ...normalized, ambulance_id: payload.ambulance_id || normalized.patient_id }
                    : a);
                const exists = next.find((a) => a.ambulance_id === (payload.ambulance_id || normalized.patient_id));
                if (exists) return next;
                return [...next, { ...normalized, ambulance_id: payload.ambulance_id || normalized.patient_id }];
            });
        };

        socket.on('vitalsUpdate', handleVitals);
        socket.on('locationUpdate', handleLocation);
        return () => {
            socket.off('vitalsUpdate', handleVitals);
            socket.off('locationUpdate', handleLocation);
        };
    }, [alertTone]);

    // Authenticated bootstrap fetch for initial data
    useEffect(() => {
        if (!token) return undefined;
        fetchPatients().then(({ data }) => setPatients(data)).catch(() => { });
        fetchAmbulances().then(({ data }) => setAmbulances(data)).catch(() => { });
        return undefined;
    }, [token]);

    return (
        <DataContext.Provider value={{ patients, ambulances, alerts, setPatients, setAmbulances }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);
