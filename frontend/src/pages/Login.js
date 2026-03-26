import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('admin@healthflow.local');
    const [password, setPassword] = useState('Admin@123');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/management');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded-2xl shadow">
            <h1 className="text-2xl font-bold mb-4 dark:text-white">Login</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-300">Email</label>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 rounded-lg border dark:border-gray-700 dark:bg-gray-700 dark:text-white" />
                </div>
                <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-300">Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 rounded-lg border dark:border-gray-700 dark:bg-gray-700 dark:text-white" />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg">Login</button>
            </form>
        </div>
    );
}
