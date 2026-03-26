'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auto-bootstrap session on mount: restore local session, otherwise auto-login with demo creds
  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const storedToken = localStorage.getItem('iot_token');
      const storedUser = localStorage.getItem('iot_user');
      if (storedToken && storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          if (!cancelled) {
            setToken(storedToken);
            setUser(parsed);
            setLoading(false);
          }
          return;
        } catch {
          localStorage.removeItem('iot_token');
          localStorage.removeItem('iot_user');
        }
      }

      // No session: attempt silent demo login
      const demoEmail = process.env.NEXT_PUBLIC_DEMO_EMAIL || 'admin@healthiot.com';
      const demoPassword = process.env.NEXT_PUBLIC_DEMO_PASSWORD || 'Admin@123';
      try {
        const res = await api.post('/api/auth/login', { email: demoEmail, password: demoPassword });
        const { token: t, data } = res.data;
        localStorage.setItem('iot_token', t);
        localStorage.setItem('iot_user', JSON.stringify(data.user));
        api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
        if (!cancelled) {
          setToken(t);
          setUser(data.user);
        }
      } catch (err) {
        console.warn('Auto-login failed:', err?.response?.data || err?.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    bootstrap();
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    const { token: t, data } = res.data;
    localStorage.setItem('iot_token', t);
    localStorage.setItem('iot_user', JSON.stringify(data.user));
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    setToken(t);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('iot_token');
    localStorage.removeItem('iot_user');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  }, []);

  const isAdmin = user?.role === 'admin';
  const isDoctor = user?.role === 'doctor';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin, isDoctor }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
