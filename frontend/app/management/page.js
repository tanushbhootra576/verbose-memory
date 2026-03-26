'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useAmbulances } from '../../hooks/useAmbulances';
import Navbar from '../../components/Layout/Navbar';
import StatsPanel from '../../components/Dashboard/StatsPanel';
import PatientCard from '../../components/Dashboard/PatientCard';
import AlertPanel from '../../components/Alerts/AlertPanel';
import DynamicMap from '../../components/Map/DynamicMap';

export default function ManagementDashboard() {
  const { user, loading }              = useAuth();
  const { ambulances, stats, refresh } = useAmbulances();
  const [selected, setSelected]        = useState(null);
  const router = useRouter();

  // Auth guard
  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-4xl animate-bounce">🏥</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-screen-2xl mx-auto w-full px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text)]">Management Dashboard</h1>
            <p className="text-[var(--muted)] text-sm">Real-time fleet overview · {new Date().toLocaleString()}</p>
          </div>
          <button
            onClick={refresh}
            className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm hover:bg-blue-500/20 transition-colors"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Stats */}
        <StatsPanel stats={stats} />

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Map — 2/3 */}
          <div className="xl:col-span-2 card p-2 overflow-hidden" style={{ height: '520px' }}>
            <DynamicMap
              ambulances={ambulances}
              onMarkerClick={(amb) => setSelected(amb)}
            />
          </div>

          {/* Alert panel — 1/3 */}
          <div style={{ height: '520px' }}>
            <AlertPanel />
          </div>
        </div>

        {/* Selected ambulance detail */}
        {selected && (
          <div className="card p-5 animate-slide-up border border-blue-500/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--text)]">
                🚑 {selected.ambulance_id} — {selected.patient?.name || 'Unknown Patient'}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/ambulance/${selected.ambulance_id}`)}
                  className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs hover:bg-blue-500/20 transition-colors"
                >
                  View Full Track →
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 text-[var(--muted)] text-xs hover:bg-white/10 transition-colors"
                >
                  ✕ Close
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Heart Rate', value: selected.latestVitals?.hr ? `${Math.round(selected.latestVitals.hr)} bpm` : '--' },
                { label: 'SpO₂', value: selected.latestVitals?.spo2 ? `${Math.round(selected.latestVitals.spo2)}%` : '--' },
                { label: 'Temperature', value: selected.latestVitals?.temperature ? `${Number(selected.latestVitals.temperature).toFixed(1)}°C` : '--' },
                { label: 'Speed', value: selected.speed ? `${Math.round(selected.speed)} km/h` : '--' },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-xl bg-white/5 text-center">
                  <p className="text-xs text-[var(--muted)]">{item.label}</p>
                  <p className="font-mono font-bold text-lg text-[var(--text)]">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ambulance list */}
        <div>
          <h2 className="text-lg font-semibold text-[var(--text)] mb-4">All Ambulances</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ambulances.map((amb) => (
              <PatientCard
                key={amb.ambulance_id}
                ambulance={amb}
                onClick={() => setSelected(amb)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
