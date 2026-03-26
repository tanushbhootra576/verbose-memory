'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useTheme } from '../../hooks/useTheme';
import { HospitalIcon, ChartIcon, DoctorIcon, SunIcon, MoonIcon } from '../icons';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { connected }    = useSocket();
  const { isDark, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/10">
      <div className="max-w-screen-2xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <HospitalIcon className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-gradient hidden sm:block">HealthIoT</span>
        </Link>

        {/* Nav Links */}
        {user && (
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/management" label="Management" icon={<ChartIcon className="w-4 h-4" />} active={user.role === 'admin'} />
            <NavLink href="/doctor"     label="Doctor"     icon={<DoctorIcon className="w-4 h-4" />} active />
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Connection indicator */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            <span className="hidden sm:inline text-[var(--muted)]">{connected ? 'Live' : 'Offline'}</span>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors text-lg"
            aria-label="Toggle theme"
          >
            {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          </button>

          {/* User menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
                  {user.name?.[0] || 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-[var(--text)] leading-none">{user.name}</p>
                  <p className="text-[10px] text-[var(--muted)] capitalize">{user.role}</p>
                </div>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-12 w-44 card p-1 shadow-xl animate-fade-in">
                  <button
                    onClick={() => { logout(); setMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/" className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, label, icon, active }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
        ${active ? 'text-[var(--text)] hover:bg-white/10' : 'text-[var(--muted)] cursor-not-allowed'}`}
    >
      <span className="flex items-center text-[var(--muted)]">{icon}</span> {label}
    </Link>
  );
}
