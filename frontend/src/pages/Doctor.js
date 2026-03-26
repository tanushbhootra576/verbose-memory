import React, { useEffect, useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { fetchPatientHistory } from '../services/api';
import { getSocket } from '../services/socket';
import { normalizeData, conditionLabel } from '../utils/normalizers';
import { HeartPulse, Activity, ThermometerSun, Wind, AlertTriangle, Stethoscope } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { useAuth } from '../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function Doctor() {
    const { user } = useAuth();
    const { patients } = useData();
    const [focusId, setFocusId] = useState(null);
    const [history, setHistory] = useState([]);
    const [live, setLive] = useState(null);

    useEffect(() => {
        if (patients.length && !focusId) setFocusId(patients[0].patient_id);
    }, [patients, focusId]);

    useEffect(() => {
        if (!focusId || !user) return;
        fetchPatientHistory(focusId).then(({ data }) => {
            setHistory(data.history || []);
            setLive(data.latest || null);
        }).catch(() => { });

        const socket = getSocket();
        socket.on(`vitals-${focusId}`, (payload) => {
            const normalized = normalizeData(payload);
            setLive(normalized);
            setHistory((prev) => [...prev.slice(-49), normalized]);
        });
        return () => socket.off(`vitals-${focusId}`);
    }, [focusId, user]);

    const status = useMemo(() => live ? conditionLabel(live.spo2, live.hr, live.temperature) : 'Waiting', [live]);
    const prediction = useMemo(() => {
        if (!live) return 'Insufficient data';
        const risk = (live.hr - 80) * 0.2 + (98 - live.spo2) * 1.2 + (live.temperature - 36.6) * 2;
        if (risk > 20) return 'Likely deterioration (monitor closely)';
        if (risk > 10) return 'Possible warning trend';
        return 'Stable trajectory';
    }, [live]);

    const chartData = useMemo(() => ({
        labels: history.map((h) => new Date(h.timestamp || Date.now()).toLocaleTimeString()),
        datasets: [
            {
                label: 'Heart Rate',
                data: history.map((h) => h.hr),
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                fill: true,
                tension: 0.3,
            },
            {
                label: 'SpO2',
                data: history.map((h) => h.spo2),
                borderColor: 'rgb(59, 130, 246)',
                tension: 0.3,
            }
        ]
    }), [history]);

    const mockPatients = patients.slice(0, 3);

    if (!user) return <div className="text-gray-600">Please login to view doctor dashboard.</div>;

    return (
        <div className="space-y-6">
            <header className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Stethoscope className="text-blue-600" /> Doctor Dashboard
                    </h1>
                    <p className="text-sm text-gray-500">Focus patient: {focusId || '—'}</p>
                </div>
                <StatusBadge status={status} />
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <VitalCard title="Heart Rate" value={live?.hr ?? '--'} unit="bpm" icon={HeartPulse} highlight={live && (live.hr > 120 || live.hr < 50)} />
                <VitalCard title="SpO2" value={live?.spo2 ?? '--'} unit="%" icon={Activity} highlight={live && live.spo2 < 90} />
                <VitalCard title="Temperature" value={live?.temperature ?? '--'} unit="°C" icon={ThermometerSun} highlight={live && live.temperature > 39} />
                <VitalCard title="Respiration" value={16} unit="rpm" icon={Wind} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold dark:text-white mb-3">Vitals History</h2>
                    <div className="h-[360px]">
                        <Line data={chartData} options={{
                            maintainAspectRatio: false,
                            plugins: { legend: { labels: { color: '#9ca3af' } } },
                            scales: { x: { ticks: { color: '#9ca3af' } }, y: { ticks: { color: '#9ca3af' } } },
                            animation: { duration: 0 }
                        }} />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold dark:text-white mb-3">Patients</h2>
                    <div className="space-y-3 max-h-[340px] overflow-auto">
                        {mockPatients.map((p) => (
                            <button key={p.patient_id} onClick={() => setFocusId(p.patient_id)} className={`w-full text-left p-3 rounded-xl border dark:border-gray-700 ${focusId === p.patient_id ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300' : 'bg-gray-50 dark:bg-gray-700/30'}`}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-bold dark:text-white">{p.name || p.patient_id}</p>
                                        <p className="text-xs text-gray-500">{p.patient_id}</p>
                                    </div>
                                    <StatusBadge status={conditionLabel(p.vitals?.spo2 || 0, p.vitals?.hr || 0, p.vitals?.temperature || 0)} size="sm" />
                                </div>
                            </button>
                        ))}
                        {mockPatients.length === 0 && <p className="text-sm text-gray-500">Waiting for data...</p>}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 lg:col-span-2">
                    <h2 className="text-lg font-bold dark:text-white mb-3">Medical Records Timeline</h2>
                    <div className="space-y-2 max-h-[300px] overflow-auto">
                        {history.slice().reverse().map((h, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold dark:text-white">{new Date(h.timestamp || Date.now()).toLocaleTimeString()}</p>
                                    <p className="text-xs text-gray-500">HR {h.hr} | SpO2 {h.spo2}% | Temp {h.temperature}°C</p>
                                </div>
                                <StatusBadge status={conditionLabel(h.spo2, h.hr, h.temperature)} size="sm" />
                            </div>
                        ))}
                        {history.length === 0 && <p className="text-sm text-gray-500">No records yet.</p>}
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold dark:text-white mb-3">AI Prediction</h2>
                    <p className="text-gray-700 dark:text-gray-200">{prediction}</p>
                    <p className="text-xs text-gray-500 mt-2">Rule-based risk score (hr, spo2, temp).</p>
                </div>
            </div>
        </div>
    );
}

const VitalCard = ({ title, value, unit, icon: Icon, highlight }) => (
    <div className={`relative overflow-hidden bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border ${highlight ? 'border-red-500 shadow-red-300/30' : 'border-gray-100 dark:border-gray-700'}`}>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{title}</p>
                <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">{value}</span>
                    <span className="text-gray-400">{unit}</span>
                </div>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30">
                <Icon className="text-blue-500" size={22} />
            </div>
        </div>
        {highlight && <AlertTriangle className="text-red-500 absolute top-4 right-4" size={18} />}
    </div>
);

const StatusBadge = ({ status = 'Waiting', size = 'md' }) => {
    const color = status === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : status === 'Warning' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
    const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';
    return <span className={`${padding} rounded-full font-bold uppercase tracking-wide ${color}`}>{status}</span>;
};
