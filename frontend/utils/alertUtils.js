import React from 'react';
import { StatusDot } from '../components/icons';

/**
 * Client-side alert utilities — mirrors backend alertService logic
 */

export const getStatus = ({ hr, spo2, temperature }) => {
  if (spo2 < 90 || hr < 40 || hr > 150 || temperature > 40.5 || temperature < 35) return 'Critical';
  if (spo2 < 95 || hr < 55 || hr > 110 || temperature > 38.5 || temperature < 36.0) return 'Warning';
  return 'Normal';
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'Critical': return { text: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30', badge: 'status-critical' };
    case 'Warning': return { text: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30', badge: 'status-warning' };
    default: return { text: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', badge: 'status-normal' };
  }
};

export const getStatusIcon = (status) => {
  if (status === 'Critical') return <StatusDot color="#ef4444" />;
  if (status === 'Warning') return <StatusDot color="#f59e0b" />;
  return <StatusDot color="#10b981" />;
};

export const formatVital = (key, value) => {
  if (value == null) return '--';
  switch (key) {
    case 'hr': return `${Math.round(value)} bpm`;
    case 'spo2': return `${Math.round(value)}%`;
    case 'temperature': return `${Number(value).toFixed(1)}°C`;
    case 'speed': return `${Math.round(value)} km/h`;
    default: return String(value);
  }
};

export const getConditionScoreColor = (score) => {
  if (score >= 60) return 'text-red-500';
  if (score >= 30) return 'text-amber-500';
  return 'text-emerald-500';
};

export const isAnomalous = (key, value) => {
  if (key === 'hr') return value < 55 || value > 110;
  if (key === 'spo2') return value < 95;
  if (key === 'temperature') return value < 36.0 || value > 38.5;
  return false;
};
