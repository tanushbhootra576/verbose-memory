import React, { createContext, useContext, useEffect, useState } from 'react';
import { login as loginApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('auth_token'));

    useEffect(() => {
        if (token) {
            setUser({ role: localStorage.getItem('auth_role'), email: localStorage.getItem('auth_email') });
        }
    }, [token]);

    const login = async (email, password) => {
        const { data } = await loginApi(email, password);
        setToken(data.token);
        setUser({ role: data.role, email: data.email });
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_role', data.role);
        localStorage.setItem('auth_email', data.email);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_role');
        localStorage.removeItem('auth_email');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
