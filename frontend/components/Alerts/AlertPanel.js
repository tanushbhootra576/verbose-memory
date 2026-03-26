'use client';
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useSocket } from '../../context/SocketContext';
import { getStatusIcon } from '../../utils/alertUtils';

const MAX_ALERTS = 50;

export default function AlertPanel() {
  const { addEventListener } = useSocket();
  const [alerts, setAlerts] = useState([]);

  const addAlert = useCallback((data) => {
    if (!data.alerts?.length && data.status !== 'Critical') return;

    const entry = {
      id:         Date.now() + Math.random(),
      timestamp:  new Date().toLocaleTimeString(),
      device_id:  data.device_id,
      patient_id: data.patient_id,
      status:     data.status,
      messages:   data.alerts || ['Status changed to ' + data.status],
    };

    setAlerts((prev) => [entry, ...prev].slice(0, MAX_ALERTS));

    // Toast notification
    if (data.status === 'Critical') {
      toast.error(`🚨 CRITICAL — ${data.patient_id}: ${entry.messages[0]}`, { duration: 6000 });
      // Sound alert
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
      } catch { /* silent fail for browsers that block AudioContext */ }
    } else if (data.status === 'Warning') {
      toast(`⚠️ WARNING — ${data.patient_id}: ${entry.messages[0]}`, {
        style: { background: '#78350f', color: '#fef3c7', borderColor: '#d97706' },
        duration: 4000,
      });
    }
  }, []);

  useEffect(() => {
    const unsub = addEventListener('alert-panel', (event, data) => {
      if (event === 'vitalsUpdate') addAlert(data);
    });
    return unsub;
  }, [addEventListener, addAlert]);

  const statusColors = {
    Critical: 'border-red-500/40 bg-red-500/5',
    Warning:  'border-amber-500/40 bg-amber-500/5',
    Normal:   'border-emerald-500/40 bg-emerald-500/5',
  };

  return (
    <div className="card p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔔</span>
          <h3 className="font-semibold text-sm text-[var(--text)]">Alert Feed</h3>
        </div>
        {alerts.length > 0 && (
          <button
            onClick={() => setAlerts([])}
            className="text-xs text-[var(--muted)] hover:text-red-400 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {alerts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-[var(--muted)] gap-2 py-12">
            <span className="text-3xl">✅</span>
            <p className="text-xs">No alerts — all systems normal</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-xl border text-xs animate-slide-in-right ${statusColors[alert.status] || statusColors.Normal}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-[var(--text)]">
                  {getStatusIcon(alert.status)} {alert.patient_id} · {alert.device_id}
                </span>
                <span className="text-[var(--muted)]">{alert.timestamp}</span>
              </div>
              {alert.messages.map((msg, i) => (
                <p key={i} className="text-[var(--muted)]">{msg}</p>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
