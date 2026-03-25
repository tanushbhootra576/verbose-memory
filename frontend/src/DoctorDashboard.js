import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartPulse, Activity, ThermometerSun, Wind, AlertTriangle, MapPin, Clock, Stethoscope } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);
const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const CriticalIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const StableIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

function MapUpdater({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center && center[0] != null && center[1] != null) {
            map.flyTo(center, map.getZoom(), { animate: true, duration: 1 });
        }
    }, [center, map]);
    return null;
}

export default function DoctorDashboard() {
    const { patientId } = useParams();
    const [patient, setPatient] = useState(null);
    const [vitals, setVitals] = useState({ hr: '--', spO2: '--', temp: '--', resp: '--', bp: '--', lat: null, lng: null });
    const [history, setHistory] = useState([]);
    const [alert, setAlert] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [timeAgo, setTimeAgo] = useState('Waiting for data...');

    useEffect(() => {
        // 1. Initial Fetch
        axios.get(`${apiUrl}/api/patient/${patientId}`)
            .then(res => setPatient(res.data))
            .catch(err => console.error("Patient details error:", err));

        const fetchVitals = () => {
            axios.get(`${apiUrl}/api/vitals/${patientId}`)
                .then(res => {
                    const sorted = res.data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                    setHistory(sorted);
                    if (sorted.length > 0) {
                        const latest = sorted[sorted.length - 1];
                        updateVitalsState(latest);
                    }
                })
                .catch(err => console.error("Vitals API error:", err));
        };
        fetchVitals();

        // 2. WebSocket Real-Time Updates
        const socket = io(apiUrl);
        socket.on('connect', () => console.log('Socket connected to backend!'));
        socket.on(`vitals-${patientId}`, (data) => {
            console.log("Doctor Dashboard - Socket Received Data:", data);
            
            // Append to history
            setHistory(prev => {
                const newHist = [...prev, data];
                if (newHist.length > 50) newHist.shift(); // Keep limit to 50
                return newHist;
            });
            updateVitalsState(data);
        });

        // Cleanup
        return () => socket.disconnect();
    }, [patientId]);

    const updateVitalsState = (data) => {
        setVitals({ 
            hr: data.heartRate, 
            spO2: data.spO2,
            temp: data.temperature || 36.5,
            resp: data.respirationRate || 16,
            bp: data.bloodPressure || '120/80',
            lat: data.latitude, 
            lng: data.longitude
        });
        setLastUpdated(new Date(data.timestamp || Date.now()));
        
        if (data.spO2 < 90 || data.heartRate > 120 || data.heartRate < 50 || data.temperature > 39) {
            setAlert('CRITICAL: Abnormal Vitals Detected!');
        } else {
            setAlert(null);
        }
    };

    // Timer for "Last Updated X seconds ago"
    useEffect(() => {
        const interval = setInterval(() => {
            if (lastUpdated) {
                const diff = Math.floor((new Date() - lastUpdated) / 1000);
                if (diff < 2) setTimeAgo(`Just now`);
                else if (diff < 60) setTimeAgo(`${diff} seconds ago`);
                else setTimeAgo(`${Math.floor(diff/60)} mins ago`);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [lastUpdated]);

    const chartData = {
        labels: history.map(h => new Date(h.timestamp || Date.now()).toLocaleTimeString()),
        datasets: [
            {
                label: 'Heart Rate (bpm)',
                data: history.map(h => h.heartRate),
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true,
                tension: 0.4
            },
            {
                label: 'SpO2 (%)',
                data: history.map(h => h.spO2),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'transparent',
                tension: 0.4
            }
        ]
    };

    const StatusBadge = () => {
        const status = alert ? 'CRITICAL' : 'STABLE';
        const color = alert ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${color}`}>
                {status}
            </span>
        );
    };

    const VitalCard = ({ title, value, unit, icon: Icon, colorClass, isAlert }) => (
        <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`relative overflow-hidden bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border 
                ${isAlert ? 'border-red-500 shadow-red-500/20' : 'border-gray-100 dark:border-gray-700'} 
                transition-all duration-300`}
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">{title}</p>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className={`text-4xl font-bold ${colorClass}`}>{value}</span>
                        <span className="text-gray-400 font-medium">{unit}</span>
                    </div>
                </div>
                <div className={`p-3 rounded-xl bg-opacity-10 dark:bg-opacity-20 ${colorClass.replace('text-', 'bg-')}`}>
                    <Icon className={colorClass} size={24} />
                </div>
            </div>
            {isAlert && (
                <div className="absolute top-0 right-0 w-full h-full border-2 border-red-500 rounded-2xl animate-ping opacity-20 pointer-events-none" />
            )}
        </motion.div>
    );

    const isCritical = alert !== null;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                        <Stethoscope className="text-blue-600" size={32}/> 
                        Patient Monitor
                    </h1>
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        {patient && <span className="font-medium text-gray-700 dark:text-gray-300">Name: {patient.name || 'Unknown'} (ID: {patientId.slice(-6)})</span>}
                        <span className="flex items-center gap-1"><Clock size={14}/> {timeAgo}</span>
                    </div>
                </div>
                <StatusBadge />
            </div>

            <AnimatePresence>
                {alert && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-red-500 text-white p-4 rounded-xl shadow-lg font-bold flex items-center gap-3"
                    >
                        <AlertTriangle className="animate-pulse" />
                        {alert}
                    </motion.div>
                )}
            </AnimatePresence>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <VitalCard 
                    title="Heart Rate" value={vitals.hr} unit="bpm" icon={HeartPulse} 
                    colorClass="text-red-500" isAlert={vitals.hr !== '--' && (vitals.hr > 120 || vitals.hr < 50)} 
                />
                <VitalCard 
                    title="SpO2 Level" value={vitals.spO2} unit="%" icon={Activity} 
                    colorClass="text-blue-500" isAlert={vitals.spO2 !== '--' && vitals.spO2 < 90} 
                />
                <VitalCard 
                    title="Body Temp" value={vitals.temp} unit="°C" icon={ThermometerSun} 
                    colorClass="text-orange-500" isAlert={vitals.temp !== '--' && vitals.temp > 39} 
                />
                <VitalCard 
                    title="Respiration" value={vitals.resp} unit="bpm" icon={Wind} 
                    colorClass="text-teal-500" isAlert={vitals.resp !== '--' && (vitals.resp < 12 || vitals.resp > 25)} 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Graph */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Live Vitals History</h2>
                    <div className="h-[400px]">
                        <Line data={chartData} options={{ 
                            responsive: true, maintainAspectRatio: false,
                            plugins: { legend: { position: 'top', labels: { color: 'gray' } } },
                            scales: { 
                                x: { ticks: { color: 'gray' } }, 
                                y: { ticks: { color: 'gray' } } 
                            },
                            animation: { duration: 0 } 
                        }} />
                    </div>
                </motion.div>

                {/* Patient Context & Location Stack */}
                <div className="space-y-6 lg:col-span-1">
                    {/* Patient Context */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Medical Context</h2>
                        {patient ? (
                            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
                                <div className="flex justify-between border-b dark:border-gray-700 pb-2">
                                    <span className="font-medium">Blood Pressure:</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{vitals.bp} mmHg</span>
                                </div>
                                <div className="flex justify-between border-b dark:border-gray-700 pb-2">
                                    <span className="font-medium">Device / ID:</span>
                                    <span className="font-mono">{patientId.slice(-8)}</span>
                                </div>
                                {patient.history && patient.history.length > 0 && (
                                    <div>
                                        <span className="font-medium mb-1 block">History:</span>
                                        <ul className="list-disc pl-5 mt-1 opacity-80">
                                            {patient.history.map((hist, idx) => <li key={idx}>{hist}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) : <p className="text-gray-500 animate-pulse">Loading context...</p>}
                    </div>

                    {/* Mini Map */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                            <MapPin size={20} className="text-rose-500"/>
                            Live Location
                        </h2>
                        <div className="h-64 w-full bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden relative z-0">
                            {vitals.lat && vitals.lng ? (
                                <MapContainer center={[vitals.lat, vitals.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <MapUpdater center={[vitals.lat, vitals.lng]} />
                                    <Marker position={[vitals.lat, vitals.lng]} icon={isCritical ? CriticalIcon : StableIcon}>
                                        <Popup className="dark:bg-gray-800">
                                            <strong className="block border-b pb-1 mb-1">Patient: {patientId.slice(-6)}</strong>
                                            <div className="text-sm">
                                                <span>HR: {vitals.hr}</span><br/>
                                                <span>SpO2: {vitals.spO2}%</span><br/>
                                                <span className="text-xs text-gray-500 italic mt-1 block">Updated: {timeAgo}</span>
                                            </div>
                                        </Popup>
                                    </Marker>
                                </MapContainer>
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-gray-500 text-sm">
                                    Awaiting GPS coordinates...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
