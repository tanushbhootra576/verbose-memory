'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useAmbulances } from '../../hooks/useAmbulances';
import { useVitals } from '../../hooks/useVitals';
import Navbar from '../../components/Layout/Navbar';
import VitalsCard from '../../components/Vitals/VitalsCard';
import VitalsChart from '../../components/Vitals/VitalsChart';
import PatientCard from '../../components/Dashboard/PatientCard';
import { getStatusColor } from '../../utils/alertUtils';

const METRICS = ['hr', 'spo2', 'temperature'];

export default function DoctorDashboard() {
  const { user, loading }        = useAuth();
  const { ambulances }           = useAmbulances();
  const [activeMetric, setActiveMetric] = useState('hr');
  const router = useRouter();

  // Primary patient is AMB001 / P001 (the real ESP32 patient)
  const primaryAmbulance = ambulances.find((a) => a.ambulance_id === 'AMB001') || ambulances[0];
  const primaryDeviceId  = primaryAmbulance?.device_id || 'ESP001';

  const { latest, history } = useVitals(primaryDeviceId, 40);

  // Auth guard
  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-4xl animate-bounce">🏥</div></div>;
  }

  const vitals = latest || primaryAmbulance?.latestVitals;
  const patient = primaryAmbulance?.patient || {};
  const colors  = getStatusColor(vitals?.status || 'Normal');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-screen-2xl mx-auto w-full px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text)]">Doctor Dashboard</h1>
            <p className="text-[var(--muted)] text-sm">Welcome, {user.name} · {user.specialization || 'Emergency Medicine'}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full bg-emerald-400 animate-pulse`} />
            <span className="text-xs text-emerald-400 font-medium">Live monitoring</span>
          </div>
        </div>

        {/* Primary patient header */}
        <div className={`card p-5 border ${colors.border} animate-slide-up`}>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl ${colors.bg} flex items-center justify-center text-2xl`}>
                👤
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-bold text-lg text-[var(--text)]">{patient?.name || 'Primary Patient'}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${colors.badge}`}>
                    {vitals?.status || 'Normal'}
                  </span>
                </div>
                <p className="text-sm text-[var(--muted)]">
                  {patient?.age ? `${patient.age}y ·` : ''} {patient?.gender || ''} · {patient?.bloodGroup || ''} · {primaryAmbulance?.ambulance_id}
                </p>
                <p className="text-xs text-[var(--muted)] mt-0.5">→ {primaryAmbulance?.hospital_destination || 'City Hospital'}</p>
              </div>
            </div>
            <button
              onClick={() => router.push(`/ambulance/${primaryAmbulance?.ambulance_id}`)}
              className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm hover:bg-blue-500/20 transition-colors"
            >
              🗺️ Track Ambulance →
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Left: Vitals + Charts */}
          <div className="xl:col-span-3 space-y-6">
            <VitalsCard vitals={vitals} conditionScore={latest?.conditionScore} />

            {/* Metric selector */}
            <div className="flex gap-2">
              {METRICS.map((m) => (
                <button
                  key={m}
                  onClick={() => setActiveMetric(m)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold uppercase tracking-wide transition-colors ${
                    activeMetric === m
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/5 text-[var(--muted)] hover:bg-white/10'
                  }`}
                >
                  {m === 'hr' ? 'Heart Rate' : m === 'spo2' ? 'SpO₂' : 'Temperature'}
                </button>
              ))}
            </div>

            <VitalsChart history={history} activeMetric={activeMetric} />

            {/* Medical history */}
            {patient?.medicalHistory?.length > 0 && (
              <div className="card p-5">
                <h3 className="font-semibold text-sm text-[var(--text)] mb-3">📋 Medical History</h3>
                <div className="space-y-2">
                  {patient.medicalHistory.map((h, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                      <span className="text-lg">🔍</span>
                      <div>
                        <p className="font-medium text-sm text-[var(--text)]">{h.condition}</p>
                        <p className="text-xs text-[var(--muted)]">{h.notes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: secondary patients */}
          <div className="xl:col-span-2">
            <div className="card p-4 h-full">
              <h3 className="font-semibold text-sm text-[var(--text)] mb-4">All Patients</h3>
              <div className="space-y-3 overflow-y-auto" style={{ maxHeight: '680px' }}>
                {ambulances.map((amb) => (
                  <PatientCard
                    key={amb.ambulance_id}
                    ambulance={amb}
                    onClick={() => router.push(`/ambulance/${amb.ambulance_id}`)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
