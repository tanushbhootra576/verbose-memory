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

    useEffect(() => {
        if (!token) return undefined;
        fetchPatients().then(({ data }) => setPatients(data)).catch(() => { });
        fetchAmbulances().then(({ data }) => setAmbulances(data)).catch(() => { });

        const socket = getSocket();
        socket.on('vitalsUpdate', (payload) => {
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
        });
        socket.on('locationUpdate', (payload) => {
            const normalized = normalizeData(payload);
            setAmbulances((prev) => {
                const next = prev.map((a) => a.ambulance_id === (payload.ambulance_id || normalized.patient_id)
                    ? { ...a, ...normalized, ambulance_id: payload.ambulance_id || normalized.patient_id }
                    : a);
                const exists = next.find((a) => a.ambulance_id === (payload.ambulance_id || normalized.patient_id));
                if (exists) return next;
                return [...next, { ...normalized, ambulance_id: payload.ambulance_id || normalized.patient_id }];
            });
        });
        return () => socket.disconnect();
    }, [token, alertTone]);

    return (
        <DataContext.Provider value={{ patients, ambulances, alerts, setPatients, setAmbulances }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);
