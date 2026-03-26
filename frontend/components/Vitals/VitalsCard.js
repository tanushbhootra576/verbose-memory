'use client';
import { getStatusColor, formatVital, isAnomalous, getConditionScoreColor } from '../../utils/alertUtils';
import { HeartIcon, DropletIcon, ThermometerIcon, ChartIcon, SpeedIcon } from '../icons';

const VITAL_META = [
  { key: 'hr',          label: 'Heart Rate',  unit: 'BPM',  icon: <HeartIcon className="w-6 h-6" />,       normal: '60–100' },
  { key: 'spo2',        label: 'Blood Oxygen', unit: '%',   icon: <DropletIcon className="w-6 h-6" />,     normal: '95–100' },
  { key: 'temperature', label: 'Temperature',  unit: '°C',  icon: <ThermometerIcon className="w-6 h-6" />, normal: '36–37.5' },
];

export default function VitalsCard({ vitals, conditionScore, showScore = true }) {
  const status = vitals?.status || 'Normal';
  const colors = getStatusColor(status);

  return (
    <div className={`card p-6 border ${colors.border} ${colors.bg} animate-slide-up`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ChartIcon className="w-5 h-5" />
          <h3 className="font-semibold text-[var(--text)]">Live Vitals</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${colors.badge}`}>{status}</span>
          <span className="flex items-center gap-1 text-xs text-[var(--muted)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
        </div>
      </div>

      {/* Vitals grid */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {VITAL_META.map(({ key, label, unit, icon, normal }) => {
          const val = vitals?.[key];
          const anomalous = val != null && isAnomalous(key, val);
          return (
            <div key={key} className={`p-4 rounded-2xl text-center transition-all ${anomalous ? colors.bg + ' ' + colors.border + ' border' : 'bg-white/5 dark:bg-black/10'}`}>
              <div className="text-2xl mb-1 text-[var(--text)]">{icon}</div>
              <div className={`vital-value ${anomalous ? colors.text : 'text-[var(--text)]'}`}>
                {val != null ? (key === 'temperature' ? Number(val).toFixed(1) : Math.round(val)) : '--'}
              </div>
              <div className="text-[10px] text-[var(--muted)] font-medium mt-0.5">{unit}</div>
              <div className="text-[10px] text-[var(--muted)] mt-1">{label}</div>
              <div className="text-[9px] text-[var(--muted)]/60 mt-1">normal: {normal}</div>
            </div>
          );
        })}
      </div>

      {/* Condition score */}
      {showScore && conditionScore != null && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
          <span className="text-sm text-[var(--muted)]">Condition Score</span>
          <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                conditionScore >= 60 ? 'bg-red-500' : conditionScore >= 30 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${conditionScore}%` }}
            />
          </div>
          <span className={`font-mono font-bold text-sm ${getConditionScoreColor(conditionScore)}`}>
            {conditionScore}/100
          </span>
        </div>
      )}

      {/* Speed */}
      {vitals?.speed != null && (
        <div className="mt-3 flex items-center justify-between text-xs text-[var(--muted)]">
          <span className="flex items-center gap-1"><SpeedIcon className="w-4 h-4" /> Speed</span>
          <span className="font-mono font-medium text-[var(--text)]">{Math.round(vitals.speed)} km/h</span>
        </div>
      )}

      {/* Last updated */}
      {vitals?.timestamp && (
        <p className="text-[10px] text-[var(--muted)] text-right mt-2">
          Updated: {new Date(vitals.timestamp).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
