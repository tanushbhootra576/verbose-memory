import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { HeartPulse, Activity, ThermometerSun } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Doctor() {
    const [mainVitals, setMainVitals] = useState({ hr: '--', spo2: '--', temperature: '--', condition: 'Waiting' });
    const [history, setHistory] = useState([]);

    // Mock patients
    const [mockPatients, setMockPatients] = useState([
        { id: 'PAT-10', name: 'John Doe', hr: 78, spo2: 98, temp: 36.5 },
        { id: 'PAT-11', name: 'Sarah Lee', hr: 85, spo2: 96, temp: 37.1 },
        { id: 'PAT-12', name: 'Mike Ross', hr: 110, spo2: 89, temp: 38.2 }
    ]);

    useEffect(() => {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const socket = io(apiUrl);

        socket.on('vitalsUpdate', (data) => {
            console.log('[Doctor] vitalsUpdate', data);
            // Assume the first incoming data is our ESP32 target
            setMainVitals({
                hr: data.hr ?? data.heartRate ?? '--',
                spo2: data.spo2 ?? data.spO2 ?? '--',
                temperature: data.temperature ?? '--',
                condition: data.condition || 'Normal',
                timestamp: data.timestamp
            });
            setHistory(prev => {
                const normalized = {
                    hr: data.hr ?? data.heartRate ?? 0,
                    spo2: data.spo2 ?? data.spO2 ?? 0,
                    temperature: data.temperature ?? 0,
                    timestamp: data.timestamp || Date.now()
                };
                const newHist = [...prev, normalized].slice(-20);
                return newHist;
            });
        });

        // Simulate mock updates
        const int = setInterval(() => {
            setMockPatients(prev => prev.map(p => ({
                ...p,
                hr: Math.floor(p.hr + (Math.random() - 0.5) * 5),
                spo2: Math.min(100, Math.max(70, Math.floor(p.spo2 + (Math.random() - 0.5) * 2)))
            })));
        }, 3000);

        return () => { socket.disconnect(); clearInterval(int); };
    }, []);

    const chartData = {
        labels: history.map(h => new Date(h.timestamp || Date.now()).toLocaleTimeString()),
        datasets: [
            { label: 'HR', data: history.map(h => h.hr), borderColor: 'rgb(239, 68, 68)', tension: 0.3 },
            { label: 'SpO2', data: history.map(h => h.spo2), borderColor: 'rgb(59, 130, 246)', tension: 0.3 }
        ]
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold dark:text-white">Primary Patient Monitor (Real-Time)</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-6 rounded-2xl border ${mainVitals.condition === 'Critical' ? 'bg-red-50 border-red-500' : 'bg-white dark:bg-gray-800 dark:border-gray-700'}`}>
                    <div className="flex gap-2 items-center text-gray-500 dark:text-gray-400 mb-2"><HeartPulse /> Heart Rate</div>
                    <div className={`text-5xl font-bold ${mainVitals.hr > 100 || mainVitals.hr < 60 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>{mainVitals.hr} bpm</div>
                </div>
                <div className={`p-6 rounded-2xl border ${mainVitals.condition === 'Critical' ? 'bg-red-50 border-red-500' : 'bg-white dark:bg-gray-800 dark:border-gray-700'}`}>
                    <div className="flex gap-2 items-center text-gray-500 dark:text-gray-400 mb-2"><Activity /> SpO2 Level</div>
                    <div className={`text-5xl font-bold ${mainVitals.spo2 < 90 ? 'text-red-500' : 'text-blue-500'}`}>{mainVitals.spo2} %</div>
                </div>
                <div className="p-6 bg-white dark:bg-gray-800 dark:border-gray-700 border rounded-2xl">
                    <div className="flex gap-2 items-center text-gray-500 dark:text-gray-400 mb-2"><ThermometerSun /> Temp</div>
                    <div className="text-5xl font-bold text-orange-500">{mainVitals.temperature} °C</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow">
                    <h2 className="text-lg font-bold dark:text-white mb-4">Vitals History</h2>
                    <div className="h-64"><Line data={chartData} options={{ maintainAspectRatio: false, animation: { duration: 0 } }} /></div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow flex flex-col">
                    <h2 className="text-lg font-bold dark:text-white mb-4">Ward Overview</h2>
                    <div className="flex-1 space-y-4">
                        {mockPatients.map(p => (
                            <div key={p.id} className="p-4 border dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                                <div className="flex justify-between items-center mb-2">
                                    <strong className="dark:text-white">{p.name}</strong>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${p.spo2 < 90 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                        {p.spo2 < 90 ? 'CRITICAL' : 'STABLE'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                                    <span>HR: {p.hr}</span>
                                    <span>SpO2: {p.spo2}%</span>
                                    <span>Temp: {p.temp}°C</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}