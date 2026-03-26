import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
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
        popupAnchor: [1, -34],
    });
};

const clusterize = (ambulances) => {
    if (ambulances.length <= 15) return { clusters: [], singles: ambulances };
    const buckets = {};
    ambulances.forEach((amb) => {
        const latKey = amb.latitude.toFixed(2);
        const lngKey = amb.longitude.toFixed(2);
        const key = `${latKey}-${lngKey}`;
        buckets[key] = buckets[key] || { count: 0, lat: amb.latitude, lng: amb.longitude };
        buckets[key].count += 1;
    });
    const clusters = Object.values(buckets).filter((b) => b.count > 3);
    const singles = ambulances.filter((amb) => {
        const key = `${amb.latitude.toFixed(2)}-${amb.longitude.toFixed(2)}`;
        return !(buckets[key] && buckets[key].count > 3);
    });
    return { clusters, singles };
};

export default function FleetMap({ ambulances = [], height = 600 }) {
    const center = ambulances[0] ? [ambulances[0].latitude || 34.05, ambulances[0].longitude || -118.24] : [34.05, -118.24];
    const { clusters, singles } = useMemo(() => clusterize(ambulances), [ambulances]);

    return (
        <MapContainer center={center} zoom={11} style={{ height, width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {clusters.map((c, idx) => (
                <Marker key={`cluster-${idx}`} position={[c.lat, c.lng]} icon={getIcon('Warning')}>
                    <Popup>
                        <div className="font-bold">{c.count} ambulances nearby</div>
                        <div className="text-xs text-gray-500">Clustered view</div>
                    </Popup>
                </Marker>
            ))}
            {singles.filter((a) => Number.isFinite(a.latitude) && Number.isFinite(a.longitude)).map((amb) => (
                <Marker key={amb.ambulance_id} position={[amb.latitude, amb.longitude]} icon={getIcon(amb.status)}>
                    <Popup>
                        <strong>{amb.ambulance_id}</strong><br />
                        HR: {amb.hr || '--'} | SpO2: {amb.spo2 || '--'}%<br />
                        Status: {amb.status}
                        <Link to={`/ambulance/${amb.ambulance_id}`} className="block mt-2 text-blue-500">Track</Link>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
