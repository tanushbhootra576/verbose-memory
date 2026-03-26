'use client';
import { getStatusColor } from '../../utils/alertUtils';

export default function PatientCard({ ambulance, onClick }) {
  const vitals  = ambulance?.latestVitals || {};
  const patient = ambulance?.patient || {};
  const status  = vitals.status || 'Normal';
  const colors  = getStatusColor(status);

  return (
    <div
      onClick={onClick}
      className={`card p-4 cursor-pointer hover:scale-[1.01] transition-all duration-200 border ${colors.border} animate-fade-in`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-sm text-[var(--text)]">{patient.name || 'Unknown Patient'}</p>
          <p className="text-xs text-[var(--muted)]">
            {ambulance.ambulance_id} · {patient.age ? `${patient.age}y` : '—'} · {patient.bloodGroup || '—'}
          </p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors.badge}`}>{status}</span>
      </div>

      {/* Vitals row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <VitalMini label="HR" value={vitals.hr ? `${Math.round(vitals.hr)}` : '--'} unit="bpm" color={colors.text} />
        <VitalMini label="SpO₂" value={vitals.spo2 ? `${Math.round(vitals.spo2)}` : '--'} unit="%" color={colors.text} />
        <VitalMini label="Temp" value={vitals.temperature ? Number(vitals.temperature).toFixed(1) : '--'} unit="°C" color={colors.text} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px] text-[var(--muted)]">
        <span>📍 {ambulance.hospital_destination}</span>
        <span className="flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${ambulance.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`} />
          {ambulance.isOnline ? 'Online' : 'Offline'}
        </span>
      </div>
    </div>
  );
}

function VitalMini({ label, value, unit, color }) {
  return (
    <div className="text-center">
      <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider">{label}</p>
      <p className={`font-mono font-bold text-sm ${color}`}>{value}<span className="text-[10px] font-normal text-[var(--muted)] ml-0.5">{unit}</span></p>
    </div>
  );
}
