import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const getIcon = (condition) => {
    let color = 'green';
    if (condition === 'Critical') color = 'red';
    if (condition === 'Warning') color = 'orange';

    return new L.Icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });
};

export default function Management() {
    const [ambulances, setAmbulances] = useState([]);
    const disableSocket = process.env.REACT_APP_DISABLE_SOCKET === 'true';

    useEffect(() => {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

        const fetchAmbulances = () => {
            axios.get(`${apiUrl}/api/ambulances`).then(res => {
                const data = res.data.map(a => ({
                    ...a,
                    hr: a.hr ?? '--',
                    spo2: a.spo2 ?? '--',
                    temp: a.temperature ?? '--',
                    condition: a.condition || 'Normal'
                }));
                setAmbulances(data);
                console.log('[Management] initial/poll ambulances', data);
            }).catch(err => console.error('Ambulance fetch error', err));
        };

        fetchAmbulances();
        const poll = setInterval(fetchAmbulances, 10000);

        let socket;
        if (!disableSocket) {
            socket = io(apiUrl);
            socket.on('locationUpdate', (update) => {
                console.log('[Management] locationUpdate', update);
                setAmbulances(prev => {
                    const next = prev.map(a => a.ambulance_id === update.ambulance_id ? { ...a, ...update } : a);
                    const exists = next.find(a => a.ambulance_id === update.ambulance_id);
                    return exists ? next : [...next, update];
                });
            });
        } else {
            console.log('[Management] Socket disabled, using polling only');
        }

        return () => {
            if (socket) socket.disconnect();
            clearInterval(poll);
        };
    }, [disableSocket]);

    const critCount = ambulances.filter(a => a.condition === 'Critical').length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow h-[600px] flex flex-col">
                <h2 className="text-xl font-bold dark:text-white mb-4">Live Fleet Tracking</h2>
                <div className="flex-1 rounded-xl overflow-hidden z-0">
                    {ambulances.filter(a => a.latitude && a.longitude).length > 0 && (
                        <MapContainer center={[ambulances[0].latitude || 34.05, ambulances[0].longitude || -118.24]} zoom={11} style={{ height: '100%', width: '100%' }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            {ambulances.filter(a => Number.isFinite(a.latitude) && Number.isFinite(a.longitude)).map(amb => (
                                <Marker key={amb.ambulance_id} position={[amb.latitude, amb.longitude]} icon={getIcon(amb.condition)}>
                                    <Popup>
                                        <strong>{amb.ambulance_id}</strong><br />
                                        HR: {amb.hr} | SpO2: {amb.spo2}%<br />
                                        Status: {amb.condition}
                                        <Link to={`/ambulance/${amb.ambulance_id}`} className="block mt-2 text-blue-500">Track Full View</Link>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    )}
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">Total Active</p>
                        <p className="text-3xl font-bold dark:text-white">{ambulances.length}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">Critical</p>
                        <p className="text-3xl font-bold text-red-500">{critCount}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow h-[470px] overflow-auto">
                    <h2 className="text-xl font-bold dark:text-white mb-4">Ambulance Roster</h2>
                    <div className="space-y-3">
                        {ambulances.map(a => (
                            <div key={a.ambulance_id} className="p-3 border dark:border-gray-700 rounded-xl flex justify-between items-center bg-gray-50 dark:bg-gray-700/30">
                                <div>
                                    <p className="font-bold dark:text-white">{a.ambulance_id}</p>
                                    <p className="text-xs text-gray-500">P-ID: {a.patient_id}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-xs font-bold ${a.condition === 'Critical' ? 'text-red-500' : a.condition === 'Warning' ? 'text-orange-500' : 'text-green-500'}`}>
                                        {a.condition.toUpperCase()}
                                    </p>
                                    <p className="text-xs text-gray-500">{a.hr}bpm / {a.spo2}%</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}