'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const FEATURES = [
  { icon: '📡', title: 'ESP32 Integration', desc: 'Real-time vitals from hardware sensors streamed directly to dashboards.' },
  { icon: '🗺️', title: 'Live Ambulance Tracking', desc: 'Leaflet-powered GPS maps with smooth marker movement and route trails.' },
  { icon: '📊', title: 'AI Condition Scoring', desc: 'Intelligent alerting: Critical, Warning, Normal based on multi-parameter analysis.' },
  { icon: '🔔', title: 'Instant Alerts', desc: 'Sound + toast notifications for SpO₂ drops, cardiac events, fever alerts.' },
  { icon: '👨‍⚕️', title: 'Doctor Dashboard', desc: 'Per-patient live vitals with Chart.js graphs and medical history.' },
  { icon: '🏥', title: 'Management Panel', desc: 'Admin view: all ambulances on one map, stats, geo-fence, response times.' },
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const { connected } = useSocket();
  const router = useRouter();

  // Redirect logged-in users
  useEffect(() => {
    if (!loading && user) {
      router.push(user.role === 'admin' ? '/management' : '/doctor');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-4xl animate-bounce">🏥</div>
          <p className="text-[var(--muted)] text-sm">Starting dashboard…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex-1 relative overflow-hidden">
        {/* Background gradient blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -top-16 right-0 w-80 h-80 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl" />
        </div>

        <div className="relative max-w-screen-xl mx-auto px-4 py-16 flex flex-col lg:flex-row items-center gap-16">
          {/* Left — hero text */}
          <div className="flex-1 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 mb-6">
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`} />
              <span className="text-xs font-medium text-blue-400">
                {connected ? 'System Online — Real-time active' : 'Connecting...'}
              </span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-black leading-tight mb-6">
              <span className="text-[var(--text)]">Healthcare</span>{' '}
              <span className="text-gradient">IoT</span>
              <br />
              <span className="text-[var(--text)]">Monitoring</span>
            </h1>

            <p className="text-lg text-[var(--muted)] max-w-xl mb-8 leading-relaxed">
              Production-grade real-time patient monitoring platform. ESP32 sensors →
              live dashboards in milliseconds. Track vitals, ambulances, and emergencies
              from a single command center.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              {['ESP32 IoT', 'Socket.IO', 'MongoDB', 'Next.js 14', 'Leaflet', 'Chart.js'].map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-[var(--muted)]">
                  {tag}
                </span>
              ))}
            </div>

            {/* Feature grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FEATURES.map((f) => (
                <div key={f.title} className="flex gap-3 p-4 rounded-xl bg-white/3 hover:bg-white/6 border border-white/5 transition-colors">
                  <span className="text-2xl flex-shrink-0">{f.icon}</span>
                  <div>
                    <p className="font-semibold text-sm text-[var(--text)]">{f.title}</p>
                    <p className="text-xs text-[var(--muted)] mt-0.5 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — status card instead of login */}
          <div className="w-full lg:w-[420px] flex-shrink-0 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="card p-8 glass">
              <div className="text-center mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-2xl mx-auto mb-3 shadow-glow">
                  🛡️
                </div>
                <h3 className="text-xl font-semibold text-[var(--text)]">Auto access enabled</h3>
                <p className="text-[var(--muted)] text-sm mt-1">Frontend signs in with demo credentials.</p>
              </div>
              <div className="space-y-2 text-sm text-[var(--muted)]">
                <div className="flex items-center justify-between">
                  <span>Auth</span>
                  <span className="text-[var(--text)] font-medium">{user ? 'Signed in' : 'Not signed in'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Role</span>
                  <span className="text-[var(--text)] font-medium">{user?.role || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Socket</span>
                  <span className={`text-[var(--text)] font-medium ${connected ? 'text-emerald-400' : 'text-yellow-300'}`}>
                    {connected ? 'Connected' : 'Connecting…'}
                  </span>
                </div>
              </div>
              <p className="mt-4 text-xs text-[var(--muted)]">
                To re-enable manual login, restore the LoginModal on this page.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-6 text-center text-xs text-[var(--muted)]">
        HealthIoT · Built with Next.js 14 · Node.js · MongoDB · Socket.IO · Leaflet
      </footer>
    </main>
  );
}
