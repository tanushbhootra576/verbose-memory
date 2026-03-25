import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for leaflet markers in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default function AdminDashboard() {
    const [ambulances, setAmbulances] = useState([]);
    const [stats] = useState({ totalPatients: 120, criticalCases: 5 }); // Mocked overall stats for UI

    useEffect(() => {
        fetchAmbulances();
        // Poll every 10 seconds for ambulance location updates
        const interval = setInterval(fetchAmbulances, 10000);
        return () => clearInterval(interval);
    }, []);

const fetchAmbulances = async () => {
    try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${apiUrl}/api/ambulance`);
        setAmbulances(res.data);
    } catch (err) {
        console.error(err);
    }
};

return (
    <div className="max-w-6xl mx-auto space-y-6 pt-4">
        <h1 className="text-3xl font-bold text-gray-800">Hospital Admin Dashboard</h1>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-gray-500 font-medium">Total Registered Patients</h2>
                <p className="text-4xl font-bold text-indigo-600 mt-2">{stats.totalPatients}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100 bg-red-50">
                <h2 className="text-red-500 font-medium">Critical Cases Currently</h2>
                <p className="text-4xl font-bold text-red-600 mt-2">{stats.criticalCases}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-gray-500 font-medium">Active Ambulances</h2>
                <p className="text-4xl font-bold text-green-600 mt-2">{ambulances.length}</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ambulance List */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-1">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Ambulance Fleet</h2>
                <div className="space-y-4">
                    {ambulances.length === 0 ? <p className="text-gray-500 text-sm">No ambulances found. Seed DB first.</p> : null}
                    {ambulances.map((amb) => (
                        <div key={amb._id} className="p-4 border rounded-lg bg-gray-50">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-lg">{amb.ambulanceId}</h3>
                                <span className={`px-2 py-1 text-xs rounded-full font-semibold ${amb.status === 'Available' ? 'bg-green-100 text-green-700' :
                                    amb.status === 'Dispatched' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {amb.status}
                                </span>
                            </div>
                            {amb.assignedPatient && (
                                <p className="text-sm text-gray-600">Assigned ID: {amb.assignedPatient._id || amb.assignedPatient}</p>
                            )}
                            <div className="mt-3">
                                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded text-sm transition">
                                    Assign Patient
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Live GPS Map */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Live Fleet Tracking</h2>
                <div className="h-[500px] w-full bg-gray-200 rounded-lg overflow-hidden relative z-0">
                    {ambulances.length > 0 ? (
                        <MapContainer
                            center={[ambulances[0]?.location.lat || 34.0522, ambulances[0]?.location.lng || -118.2437]}
                            zoom={11}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; OpenStreetMap contributors'
                            />
                            {ambulances.map((amb) => (
                                <Marker key={amb._id} position={[amb.location.lat, amb.location.lng]}>
                                    <Popup>
                                        <strong>{amb.ambulanceId}</strong><br />
                                        Status: {amb.status}
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">Map Loading (No Data)</div>
                    )}
                </div>
            </div>
        </div>
    </div>
);
}
