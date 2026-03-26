'use client';
import { getStatusColor } from '../../utils/alertUtils';
import { AmbulanceIcon, ChartIcon, AlertIcon, WarningIcon, SignalIcon } from '../icons';

export default function StatsPanel({ stats }) {
  const { total = 0, online = 0, critical = 0, warning = 0 } = stats || {};
  const normal = Math.max(0, online - critical - warning);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Units"
        value={total}
        icon={<AmbulanceIcon className="w-7 h-7" />}
        colorClass="from-blue-500/20 to-blue-600/5"
        textClass="text-blue-400"
      />
      <StatCard
        label="Active / Online"
        value={online}
        icon={<SignalIcon className="w-7 h-7" />}
        colorClass="from-emerald-500/20 to-emerald-600/5"
        textClass="text-emerald-400"
        pulse
      />
      <StatCard
        label="Critical Cases"
        value={critical}
        icon={<AlertIcon className="w-7 h-7" />}
        colorClass="from-red-500/20 to-red-600/5"
        textClass="text-red-400"
        pulse={critical > 0}
      />
      <StatCard
        label="Warnings"
        value={warning}
        icon={<WarningIcon className="w-7 h-7" />}
        colorClass="from-amber-500/20 to-amber-600/5"
        textClass="text-amber-400"
      />
    </div>
  );
}

function StatCard({ label, value, icon, colorClass, textClass, pulse }) {
  return (
    <div className={`card p-5 bg-gradient-to-br ${colorClass} animate-slide-up`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl text-current">{icon}</span>
        {pulse && (
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </span>
        )}
      </div>
      <div className={`font-mono font-bold text-4xl ${textClass} tabular-nums`}>{value}</div>
      <p className="text-xs text-[var(--muted)] mt-1 font-medium uppercase tracking-wide">{label}</p>
    </div>
  );
}
