import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { fetchAmbulance } from '../services/api';
import { getSocket } from '../services/socket';
import { normalizeData } from '../utils/normalizers';
import { Timer, MapPin, ActivitySquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const getIcon = (status) => {
    let color = 'green';
    if (status === 'Critical') color = 'red';
    if (status === 'Warning' || status === 'Busy') color = 'orange';
    return new L.Icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
    });
};

function MapUpdater({ coords }) {
    const map = useMap();
    useEffect(() => {
        if (coords && coords[0] && coords[1]) map.flyTo(coords, 15, { animate: true, duration: 1 });
    }, [coords, map]);
    return null;
}

export default function Ambulance() {
    const { user } = useAuth();
    const { id } = useParams();
    const [data, setData] = useState(null);

    useEffect(() => {
        if (!user) return undefined;
        fetchAmbulance(id).then(({ data }) => setData(data)).catch(() => { });
        const socket = getSocket();
        socket.on(`ambulance-${id}`, (payload) => setData((prev) => ({ ...prev, ...normalizeData(payload) })));
        return () => socket.off(`ambulance-${id}`);
    }, [id, user]);

    if (!user) return <div className="text-gray-600">Please login to view ambulance tracking.</div>;

    if (!data) return <div className="text-gray-500">Loading...</div>;

    const coords = [data.latitude || 34.05, data.longitude || -118.24];

    return (
        <div className="h-[85vh] flex flex-col bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm border dark:border-gray-700">
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center gap-4">
                    <Link to="/management" className="text-blue-500 hover:underline">← Back</Link>
                    <h1 className="text-xl font-bold dark:text-white">Transit Hub: {id}</h1>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${data.status === 'Critical' ? 'bg-red-100 text-red-600' : data.status === 'Warning' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                        {data.status || 'Normal'}
                    </span>
                </div>
                <div className="text-sm dark:text-gray-300 flex gap-6">
                    <div>HR: <strong className={data.hr > 100 || data.hr < 60 ? 'text-red-500' : ''}>{data.hr || '--'}</strong></div>
                    <div>SpO2: <strong className={data.spo2 < 90 ? 'text-red-500' : 'text-blue-500'}>{data.spo2 || '--'}%</strong></div>
                    <div>Temp: <strong>{data.temperature || '--'}°C</strong></div>
                </div>
            </div>

            <div className="flex-1 relative z-0">
                <MapContainer center={coords} zoom={15} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapUpdater coords={coords} />
                    {Number.isFinite(data.latitude) && Number.isFinite(data.longitude) && (
                        <Marker position={coords} icon={getIcon(data.status)}>
                            <Popup>
                                <strong>Ambulance {id}</strong>
                                <div className="text-xs text-gray-500">{new Date(data.timestamp || Date.now()).toLocaleTimeString()}</div>
                            </Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>

            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
                <InfoCard icon={<MapPin />} label="Speed" value={`${data.speed || 0} km/h`} />
                <InfoCard icon={<Timer />} label="Last Update" value={new Date(data.timestamp || Date.now()).toLocaleTimeString()} />
                <InfoCard icon={<ActivitySquare />} label="Status" value={data.status || 'Normal'} />
                <InfoCard icon={<Timer />} label="Response Time" value={`${Math.max(0, Math.round((Date.now() - new Date(data.timestamp || Date.now())) / 1000))}s`} />
            </div>
        </div>
    );
}

const InfoCard = ({ icon, label, value }) => (
    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-300 text-sm">{icon} {label}</div>
        <div className="text-lg font-bold dark:text-white">{value}</div>
    </div>
);
