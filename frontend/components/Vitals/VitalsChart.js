'use client';
import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const DATASETS = [
  { key: 'hr',          label: 'Heart Rate (bpm)',  color: '#ef4444' },
  { key: 'spo2',        label: 'SpO₂ (%)',           color: '#3b82f6' },
  { key: 'temperature', label: 'Temperature (°C)',   color: '#f59e0b' },
];

export default function VitalsChart({ history = [], activeMetric = 'hr' }) {
  const meta = DATASETS.find((d) => d.key === activeMetric) || DATASETS[0];

  const labels = history.map((v) => {
    const d = new Date(v.timestamp || v.createdAt);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });

  const values = history.map((v) => {
    const raw = v[activeMetric];
    return raw != null ? Number(Number(raw).toFixed(1)) : null;
  });

  const data = {
    labels,
    datasets: [
      {
        label: meta.label,
        data: values,
        borderColor: meta.color,
        backgroundColor: meta.color + '22',
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 5,
        borderWidth: 2,
        spanGaps: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 200 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15,23,42,0.9)',
        borderColor: meta.color + '66',
        borderWidth: 1,
        titleColor: '#94a3b8',
        bodyColor: '#f1f5f9',
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.y} ${meta.label.split(' ').pop().replace(/[()]/g, '')}`,
        },
      },
    },
    scales: {
      x: {
        grid:  { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#475569', maxTicksLimit: 8, font: { size: 10 } },
      },
      y: {
        grid:  { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#475569', font: { size: 10 } },
      },
    },
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm text-[var(--text)]">{meta.label}</h3>
        <span className="text-xs text-[var(--muted)]">Last {history.length} readings</span>
      </div>
      <div style={{ height: '200px' }}>
        {history.length > 0 ? (
          <Line data={data} options={options} />
        ) : (
          <div className="h-full flex items-center justify-center text-[var(--muted)] text-sm">
            Waiting for data...
          </div>
        )}
      </div>
    </div>
  );
}
