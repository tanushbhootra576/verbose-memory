import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const disableSocket = process.env.REACT_APP_DISABLE_SOCKET === 'true';

export default function MobileTracker() {
    const [patientId, setPatientId] = useState('');
    const [location, setLocation] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, active, error
    const [errorMsg, setErrorMsg] = useState('');
    const [lastSync, setLastSync] = useState(null);

    useEffect(() => {
        if (!patientId || disableSocket) return;

        const socket = io(apiUrl);
        socket.on(`vitals-${patientId}`, (data) => {
            setLocation({ latitude: data.latitude, longitude: data.longitude });
            setLastSync(new Date());
            setStatus('active');
        });

        return () => socket.disconnect();
    }, [patientId]);

    const startTracking = () => {
        if (!patientId) {
            setErrorMsg('Please enter Patient ID');
            return;
        }
        if (disableSocket) {
            setErrorMsg('Realtime disabled on this host');
            return;
        }
        setStatus('active');
        setErrorMsg('');
    };

    const stopTracking = () => {
        setStatus('idle');
        setLocation(null);
        setLastSync(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <h1 className="text-2xl font-bold text-center mb-6 dark:text-white">ESP32 Location Tracker</h1>

                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Enter Patient ID"
                        value={patientId}
                        onChange={(e) => setPatientId(e.target.value)}
                        className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white"
                    />

                    <div className="flex gap-2">
                        <button
                            onClick={startTracking}
                            disabled={status === 'active'}
                            className="flex-1 bg-blue-600 text-white p-3 rounded-xl disabled:opacity-50"
                        >
                            Start Tracking
                        </button>
                        <button
                            onClick={stopTracking}
                            className="flex-1 bg-red-600 text-white p-3 rounded-xl"
                        >
                            Stop
                        </button>
                    </div>

                    {status === 'active' && (
                        <div className="text-center p-4 bg-green-50 dark:bg-green-900 rounded-xl">
                            <CheckCircle2 className="mx-auto text-green-600 mb-2" size={32} />
                            <p className="dark:text-white">Tracking ESP32 Location</p>
                            {location && (
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                                    Lat: {location.latitude.toFixed(4)}, Lng: {location.longitude.toFixed(4)}
                                </p>
                            )}
                            {lastSync && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Last Update: {lastSync.toLocaleTimeString()}
                                </p>
                            )}
                        </div>
                    )}

                    {errorMsg && (
                        <div className="text-center p-4 bg-red-50 dark:bg-red-900 rounded-xl">
                            <AlertCircle className="mx-auto text-red-600 mb-2" size={32} />
                            <p className="text-red-600 dark:text-red-400">{errorMsg}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

