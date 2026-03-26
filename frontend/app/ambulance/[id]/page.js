'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useVitals } from '../../../hooks/useVitals';
import { useSocket } from '../../../context/SocketContext';
import Navbar from '../../../components/Layout/Navbar';
import VitalsCard from '../../../components/Vitals/VitalsCard';
import VitalsChart from '../../../components/Vitals/VitalsChart';
import DynamicMap from '../../../components/Map/DynamicMap';
import api from '../../../services/api';
import { getStatusColor, getStatusIcon } from '../../../utils/alertUtils';

export default function AmbulancePage() {
  const { id }            = useParams();
  const { user, loading } = useAuth();
  const router            = useRouter();
  const [ambulance, setAmbulance] = useState(null);
  const [activeMetric, setActiveMetric] = useState('hr');
  const [fetchError, setFetchError]     = useState(false);

  // Device ID from ambulance data
  const deviceId = ambulance?.device_id;
  const { latest, history } = useVitals(deviceId, 60);

  // Subscribe to ambulance socket room
  const { subscribeAmbulance } = useSocket();
  useEffect(() => {
    if (id) subscribeAmbulance(id);
  }, [id, subscribeAmbulance]);

  // Auth guard
  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

  // Fetch ambulance data
  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        const res = await api.get(`/api/ambulances/${id}`);
        setAmbulance(res.data.data.ambulance);
      } catch {
        setFetchError(true);
        // Use mock
        const { generateMockAmbulances } = await import('../../../services/mockData');
        const mockmbs = generateMockAmbulances();
        const found   = mockmbs.find((a) => a.ambulance_id === id) || mockmbs[0];
        setAmbulance(found);
      }
    };
    fetch();
  }, [id]);

  // Merge live location into ambulance state
  const { latestLocation, latestVitals } = useSocket();
  useEffect(() => {
    if (!ambulance || !deviceId) return;
    const loc = latestLocation[deviceId];
    const vit = latestVitals[deviceId];
    if (loc || vit) {
      setAmbulance((prev) => ({
        ...prev,
        ...(loc && { latitude: loc.latitude, longitude: loc.longitude, speed: loc.speed }),
        ...(vit && {
          latestVitals: {
            hr: vit.hr, spo2: vit.spo2, temperature: vit.temperature,
            status: vit.status, updatedAt: vit.timestamp,
          },
        }),
      }));
    }
  }, [latestLocation, latestVitals, ambulance, deviceId]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-4xl animate-bounce">🏥</div></div>;
  }

  if (!ambulance) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-4 animate-bounce">🚑</div>
            <p className="text-[var(--muted)]">Loading ambulance data...</p>
          </div>
        </div>
      </div>
    );
  }

  const vitals  = latest || ambulance.latestVitals;
  const patient = ambulance.patient || {};
  const colors  = getStatusColor(vitals?.status || 'Normal');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-screen-2xl mx-auto w-full px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in flex-wrap gap-4">
          <div>
            <button
              onClick={() => router.back()}
              className="text-xs text-[var(--muted)] hover:text-blue-400 transition-colors mb-2 flex items-center gap-1"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-[var(--text)]">
              🚑 {ambulance.ambulance_id} — Live Tracking
            </h1>
            <p className="text-sm text-[var(--muted)]">
              {ambulance.vehicle_number} · Driver: {ambulance.driver_name} · {ambulance.driver_contact}
            </p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${colors.border} ${colors.bg}`}>
            <span className="text-lg">{getStatusIcon(vitals?.status)}</span>
            <span className={`font-semibold text-sm ${colors.text}`}>{vitals?.status || 'Normal'}</span>
          </div>
        </div>

        {/* Patient info bar */}
        <div className="card p-4 flex items-center gap-4 flex-wrap animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-lg">👤</div>
            <div>
              <p className="font-semibold text-sm text-[var(--text)]">{patient?.name || 'Unknown Patient'}</p>
              <p className="text-xs text-[var(--muted)]">{patient?.age}y · {patient?.bloodGroup} · {patient?.emergencyPriority} Priority</p>
            </div>
          </div>
          <div className="h-6 w-px bg-[var(--border)] hidden sm:block" />
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
            <span>🏥</span> {ambulance.hospital_destination}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
            <span>⏱️</span> Response: {ambulance.responseTime ? `${ambulance.responseTime} min` : 'N/A'}
          </div>
          {ambulance.speed != null && (
            <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
              <span>🚗</span> {Math.round(ambulance.speed)} km/h
            </div>
          )}
        </div>

        {/* Main: map + vitals */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Map */}
          <div className="xl:col-span-3 card p-2 overflow-hidden" style={{ height: '460px' }}>
            <DynamicMap
              ambulances={[ambulance]}
              zoom={14}
              center={ambulance.latitude ? [ambulance.latitude, ambulance.longitude] : undefined}
            />
          </div>

          {/* Vitals */}
          <div className="xl:col-span-2 space-y-4">
            <VitalsCard vitals={vitals} conditionScore={latest?.conditionScore} />
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['hr', 'spo2', 'temperature'].map((metric) => (
            <VitalsChart key={metric} history={history} activeMetric={metric} />
          ))}
        </div>

        {/* Timeline */}
        <div className="card p-5 animate-slide-up">
          <h3 className="font-semibold text-sm text-[var(--text)] mb-4">📜 Update Timeline</h3>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
            {history.length === 0 ? (
              <p className="text-xs text-[var(--muted)] text-center py-6">Waiting for updates...</p>
            ) : (
              [...history].reverse().map((entry, i) => {
                const ec = getStatusColor(entry.status);
                return (
                  <div key={i} className="flex items-start gap-3 text-xs">
                    <span className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                      entry.status === 'Critical' ? 'bg-red-400' : entry.status === 'Warning' ? 'bg-amber-400' : 'bg-emerald-400'
                    }`} />
                    <div className="flex-1 flex items-center gap-3 flex-wrap">
                      <span className="text-[var(--muted)]">
                        {new Date(entry.timestamp || entry.createdAt).toLocaleTimeString()}
                      </span>
                      <span className="font-mono text-[var(--text)]">
                        HR {Math.round(entry.hr)} · SpO₂ {Math.round(entry.spo2)}% · Temp {Number(entry.temperature).toFixed(1)}°C
                      </span>
                      <span className={`px-1.5 py-0.5 rounded font-medium ${ec.badge}`}>{entry.status}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
