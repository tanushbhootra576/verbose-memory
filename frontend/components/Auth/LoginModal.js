'use client';
import { useState } from 'react';

export default function LoginModal({ onLogin, loading }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [role,     setRole]     = useState('admin');
  const [error,    setError]    = useState('');

  const DEMO_CREDENTIALS = {
    admin:  { email: 'admin@healthiot.com',  password: 'Admin@123' },
    doctor: { email: 'doctor@healthiot.com', password: 'Doctor@123' },
  };

  const fillDemo = () => {
    const creds = DEMO_CREDENTIALS[role];
    setEmail(creds.email);
    setPassword(creds.password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="card p-8 glass animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-3xl mx-auto mb-4 shadow-glow">
            🏥
          </div>
          <h2 className="text-2xl font-bold text-[var(--text)]">Welcome Back</h2>
          <p className="text-[var(--muted)] text-sm mt-1">Sign in to HealthIoT Dashboard</p>
        </div>

        {/* Role selector */}
        <div className="flex rounded-xl overflow-hidden border border-[var(--border)] mb-6">
          {['admin', 'doctor'].map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors capitalize ${
                role === r
                  ? 'bg-blue-500 text-white'
                  : 'bg-transparent text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              {r === 'admin' ? '📊 Admin' : '👨‍⚕️ Doctor'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="mt-1 w-full px-4 py-3 rounded-xl bg-white/5 border border-[var(--border)] text-[var(--text)] text-sm placeholder:text-[var(--muted)] focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="mt-1 w-full px-4 py-3 rounded-xl bg-white/5 border border-[var(--border)] text-[var(--text)] text-sm placeholder:text-[var(--muted)] focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 text-white font-semibold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-glow"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo fill */}
        <button
          onClick={fillDemo}
          className="mt-4 w-full text-xs text-[var(--muted)] hover:text-blue-400 transition-colors"
        >
          Fill demo credentials ({role})
        </button>
      </div>
    </div>
  );
}
