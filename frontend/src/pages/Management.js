import React, { useEffect, useMemo, useState } from 'react';
import { fetchAmbulances } from '../services/api';
import FleetMap from '../components/FleetMap';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Bell, ActivitySquare, AlertTriangle, MapPin, ShieldPlus } from 'lucide-react';

export default function Management() {
    const { user } = useAuth();
    const { ambulances, setAmbulances } = useData();
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        if (!user) return;
        fetchAmbulances().then(({ data }) => setAmbulances(data)).catch(() => { });
    }, [setAmbulances, user]);

    useEffect(() => {
        if (!user) return;
        const criticals = ambulances.filter((a) => a.status === 'Critical' || a.spo2 < 90);
        const geoAlerts = ambulances.filter((a) => Math.abs((a.latitude || 34.05) - 34.05) > 0.5 || Math.abs((a.longitude || -118.24) + 118.24) > 0.5);
        const combined = [
            ...criticals.map((c) => ({ id: c.ambulance_id, message: `${c.ambulance_id} critical`, ts: c.timestamp })),
            ...geoAlerts.map((c) => ({ id: `${c.ambulance_id}-geo`, message: `${c.ambulance_id} outside geofence`, ts: c.timestamp }))
        ];
        setAlerts(combined);
    }, [ambulances, user]);

    const stats = useMemo(() => ({
        total: ambulances.length,
        critical: ambulances.filter((a) => a.status === 'Critical').length,
        warning: ambulances.filter((a) => a.status === 'Warning' || a.status === 'Busy').length,
    }), [ambulances]);

    if (!user) return <div className="text-gray-600">Please login to view management dashboard.</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow h-[620px] flex flex-col">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-bold dark:text-white flex items-center gap-2"><MapPin /> Live Fleet Tracking</h2>
                    <span className="text-xs text-gray-500">Auto-updating via sockets</span>
                </div>
                <div className="flex-1 rounded-xl overflow-hidden z-0">
                    <FleetMap ambulances={ambulances} height={560} />
                </div>
            </div>

            <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow grid grid-cols-2 gap-3">
                    <Stat label="Total" value={stats.total} icon={<ShieldPlus className="text-blue-500" />} />
                    <Stat label="Critical" value={stats.critical} icon={<AlertTriangle className="text-red-500" />} />
                    <Stat label="Warning" value={stats.warning} icon={<ActivitySquare className="text-orange-500" />} />
                    <Stat label="Stable" value={stats.total - stats.critical - stats.warning} icon={<Bell className="text-emerald-500" />} />
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow h-[300px] overflow-auto">
                    <h3 className="text-lg font-semibold dark:text-white mb-3">Alerts</h3>
                    {alerts.length === 0 && <p className="text-sm text-gray-500">No active alerts</p>}
                    {alerts.map((a) => (
                        <div key={a.id} className="p-3 mb-2 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                            <div className="font-bold">{a.message}</div>
                            <div className="text-xs text-red-500">{new Date(a.ts || Date.now()).toLocaleTimeString()}</div>
                        </div>
                    ))}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow h-[280px] overflow-auto">
                    <h3 className="text-lg font-semibold dark:text-white mb-3">Ambulance Roster</h3>
                    {ambulances.map((a) => (
                        <div key={a.ambulance_id} className="p-3 border dark:border-gray-700 rounded-xl flex justify-between items-center mb-2">
                            <div>
                                <p className="font-bold dark:text-white">{a.ambulance_id}</p>
                                <p className="text-xs text-gray-500">P-ID: {a.patient_id || '—'}</p>
                            </div>
                            <div className="text-right">
                                <p className={`text-xs font-bold ${a.status === 'Critical' ? 'text-red-500' : a.status === 'Warning' ? 'text-orange-500' : 'text-green-500'}`}>
                                    {a.status || 'Normal'}
                                </p>
                                <p className="text-xs text-gray-500">{a.speed || 0} km/h</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const Stat = ({ label, value, icon }) => (
    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/40 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm">{icon}</div>
        <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-2xl font-bold dark:text-white">{value}</p>
        </div>
    </div>
);
