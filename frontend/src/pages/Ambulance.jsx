import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

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
    });
};

function TrackerMap({ lat, lng }) {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) map.flyTo([lat, lng], 15, { animate: true, duration: 1 });
    }, [lat, lng, map]);
    return null;
}

export default function Ambulance() {
    const { id } = useParams();
    const [data, setData] = useState({
        hr: '--', spo2: '--', temperature: '--',
        latitude: 34.05, longitude: -118.24,
        condition: 'Unknown', timestamp: null
    });

    useEffect(() => {
        const socket = io('http://localhost:5000');
        socket.on(`ambulance-${id}`, (update) => {
            setData(update);
        });
        return () => socket.disconnect();
    }, [id]);

    return (
        <div className="h-[85vh] flex flex-col bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm border dark:border-gray-700">
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center gap-4">
                    <Link to="/management" className="text-blue-500 hover:underline">← Back</Link>
                    <h1 className="text-xl font-bold dark:text-white">Transit Hub: {id}</h1>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${data.condition === 'Critical' ? 'bg-red-100 text-red-600' : data.condition === 'Warning' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                        {data.condition}
                    </span>
                </div>
                <div className="text-sm dark:text-gray-300 flex gap-6">
                    <div>HR: <strong className={data.hr > 100 || data.hr < 60 ? 'text-red-500' : ''}>{data.hr}</strong></div>
                    <div>SpO2: <strong className={data.spo2 < 90 ? 'text-red-500' : 'text-blue-500'}>{data.spo2}%</strong></div>
                    <div>Temp: <strong>{data.temperature}°C</strong></div>
                </div>
            </div>

            <div className="flex-1 relative z-0">
                <MapContainer center={[data.latitude, data.longitude]} zoom={15} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <TrackerMap lat={data.latitude} lng={data.longitude} />
                    <Marker position={[data.latitude, data.longitude]} icon={getIcon(data.condition)}>
                        <Popup>Ambulance {id}</Popup>
                    </Marker>
                </MapContainer>
            </div>
        </div>
    );
}