import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { Users, Activity, ArrowRight, ActivitySquare, AlertTriangle, HeartPulse, MapPin } from 'lucide-react';

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

function TimeAgo({ timestamp }) {
    const [ago, setAgo] = useState('Just now');
    useEffect(() => {
        if (!timestamp) return;
        const interval = setInterval(() => {
            const diff = Math.floor((new Date() - new Date(timestamp)) / 1000);
            if (diff < 2) setAgo(`Just now`);
            else if (diff < 60) setAgo(`${diff}s ago`);
            else setAgo(`${Math.floor(diff/60)}m ago`);
        }, 1000);
        return () => clearInterval(interval);
    }, [timestamp]);
    return <span>{ago}</span>;
}

export default function AdminDashboard() {
    const [patients, setPatients] = useState([]);

    useEffect(() => {
        // 1. Initial Load
        const fetchAll = () => {
            axios.get(`${apiUrl}/api/patients`)
                .then(res => setPatients(res.data))
                .catch(err => console.error("AdminDash API Error:", err));
        };
        fetchAll();

        // 2. WebSocket Real-Time Updates
        const socket = io(apiUrl);
        socket.on('connect', () => console.log('Admin Dashboard connected to Socket!'));
        socket.on('vitalsUpdate', (newVital) => {
            console.log("Admin Dashboard - Socket Received Data:", newVital);
            setPatients(prevPatients => prevPatients.map(p => 
                p._id === newVital.patientId ? { ...p, vitals: newVital } : p
            ));
        });

        return () => socket.disconnect();
    }, []);

    const criticalCount = patients.filter(p => p.vitals?.spO2 < 90 || p.vitals?.heartRate > 120 || p.vitals?.heartRate < 50 || p.vitals?.temperature > 39).length;

    const MetricCard = ({ title, value, subtitle, icon: Icon, colorClass, delay }) => (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay * 0.1, type: 'spring' }}
            className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-opacity-10 dark:bg-opacity-20 ${colorClass.replace('text-', 'bg-')}`}>
                    <Icon className={colorClass} size={24} />
                </div>
                {subtitle && <span className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full font-medium">{subtitle}</span>}
            </div>
            <div>
                <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm">{title}</h3>
                <p className={`text-4xl font-bold mt-2 text-gray-900 dark:text-white`}>{value}</p>
            </div>
        </motion.div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                        <ActivitySquare className="text-indigo-600" size={32}/> 
                        Central Command Station
                    </h1>
                    <p className="mt-2 text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <HeartPulse size={16}/> Fleet Monitoring System V2 (WebSocket Active)
                    </p>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard title="Monitored Patients" value={patients.length} icon={Users} colorClass="text-blue-500" delay={1} />
                <MetricCard title="Critical Alerts" value={criticalCount} subtitle="Requires Attention" icon={AlertTriangle} colorClass="text-red-500" delay={2} />
                <MetricCard title="System Status" value="Online" subtitle="WebSocket Active" icon={Activity} colorClass="text-emerald-500" delay={3} />
            </div>

            {/* Main Grid: Map & Table */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                
                {/* Fleet Tracking Map */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col h-[600px]"
                >
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-900 dark:text-white border-b dark:border-gray-700 pb-4">
                        <MapPin className="text-indigo-500" /> Live Fleet Tracking
                    </h2>
                    <div className="flex-1 rounded-xl overflow-hidden shadow-inner border dark:border-gray-700 relative z-0">
                        {patients.length > 0 ? (
                            <MapContainer 
                                center={[patients[0]?.vitals?.latitude || 34.0522, patients[0]?.vitals?.longitude || -118.2437]} 
                                zoom={10} style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                {patients.map(p => {
                                    if(p.vitals && p.vitals.latitude && p.vitals.longitude) {
                                        const v = p.vitals;
                                        const isCritical = v.spO2 < 90 || v.heartRate > 120 || v.heartRate < 50 || v.temperature > 39;
                                        return (
                                            <Marker key={p._id + v.timestamp} position={[v.latitude, v.longitude]} icon={isCritical ? CriticalIcon : StableIcon}>
                                                <Popup className="dark:bg-gray-800">
                                                    <div className="font-bold text-gray-900 border-b pb-1 mb-1">ID: {p._id.slice(-6)}</div>
                                                    <div className="text-sm">
                                                        <div>HR: <span className={isCritical && (v.heartRate>120||v.heartRate<50) ? 'text-red-600 font-bold' : ''}>{v.heartRate} bpm</span></div>
                                                        <div>SpO2: <span className={isCritical && v.spO2<90 ? 'text-blue-600 font-bold' : ''}>{v.spO2}%</span></div>
                                                        <div>Temp: <span className={isCritical && v.temperature>39 ? 'text-red-600 font-bold' : ''}>{v.temperature}°C</span></div>
                                                        <div className="text-xs text-gray-500 mt-2 flex justify-between">
                                                            Updated: <TimeAgo timestamp={v.timestamp} />
                                                        </div>
                                                    </div>
                                                    <Link to={`/patient/${p._id}`} className="mt-2 text-center text-blue-500 hover:text-white hover:bg-blue-600 border border-blue-500 text-xs px-2 py-1 rounded block transition-colors">
                                                        Open Dashboard
                                                    </Link>
                                                </Popup>
                                            </Marker>
                                        );
                                    }
                                    return null;
                                })}
                            </MapContainer>
                        ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-400 animate-pulse">
                                Locating signals... (Ensure Location Sender is active)
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Patient Roster */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden h-[600px]"
                >
                    <div className="p-6 border-b dark:border-gray-700">
                        <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                            <Users className="text-indigo-500" /> Patient Roster
                        </h2>
                    </div>
                    <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-800/50">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-gray-100 dark:bg-gray-700 shadow-sm z-10 text-xs uppercase text-gray-600 dark:text-gray-300 font-semibold">
                                <tr>
                                    <th className="p-4 rounded-tl-xl">Patient</th>
                                    <th className="p-4">Vitals Summary</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right rounded-tr-xl">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {patients.map((p, idx) => {
                                    const v = p.vitals || {};
                                    const isCritical = v.spO2 < 90 || v.heartRate > 120 || v.heartRate < 50 || v.temperature > 39;
                                    
                                    return (
                                        <motion.tr 
                                            key={p._id} 
                                            initial={{ opacity: 0, x: -10 }} 
                                            animate={{ opacity: 1, x: 0 }} 
                                            transition={{ delay: 0.1 * idx }}
                                            className="hover:bg-white dark:hover:bg-gray-800 transition-colors group"
                                        >
                                            <td className="p-4">
                                                <div className="font-medium text-gray-900 dark:text-white">{p.name || 'Unknown'}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">ID: ...{p._id.slice(-6)}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-wrap gap-2 text-sm">
                                                    <span className={`px-2 py-0.5 rounded flex items-center gap-1 ${v.heartRate > 100 ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                                                        <HeartPulse size={14}/> {v.heartRate || '--'}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded flex items-center gap-1 ${v.spO2 < 95 ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                                                        SpO2: {v.spO2 || '--'}%
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded flex items-center gap-1 bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400`}>
                                                        T: {v.temperature || '--'}°
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isCritical ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 animate-pulse' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                                                    {isCritical ? 'CRITICAL' : 'STABLE'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <Link to={`/patient/${p._id}`} className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 rounded-lg text-sm font-medium transition-colors">
                                                    View Dash <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                                                </Link>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                                {patients.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-gray-500 animate-pulse">
                                            Awaiting data stream...
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

