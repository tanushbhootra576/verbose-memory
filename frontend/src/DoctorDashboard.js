import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function DoctorDashboard() {
    const { patientId } = useParams();
    const [patient, setPatient] = useState(null);
    const [vitals, setVitals] = useState({ hr: '--', spO2: '--' });
    const [history, setHistory] = useState([]);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        // Fetch patient info
        axios.get(`${apiUrl}/api/patient/${patientId}`)
            .then(res => setPatient(res.data))
            .catch(err => console.error(err));

        // Fetch vital history
        axios.get(`${apiUrl}/api/vitals/${patientId}`)
            .then(res => {
                const sorted = res.data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                setHistory(sorted);
                if (sorted.length > 0) {
                    const latest = sorted[sorted.length - 1];
                    setVitals({ hr: latest.heartRate, spO2: latest.spO2 });
                }
            });

        // Real-time listener
        const eventName = `vitals-${patientId}`;
        socket.on(eventName, (data) => {
            setVitals({ hr: data.heartRate, spO2: data.spO2 });
            setHistory(prev => {
                const next = [...prev, data];
                if (next.length > 50) next.shift(); // keep last 50
                return next;
            });

            if (data.spO2 < 90 || data.heartRate > 120 || data.heartRate < 50) {
                setAlert('CRITICAL: Abnormal Vitals Detected!');
            } else {
                setAlert(null);
            }
        });

        return () => socket.off(eventName);
    }, [patientId]);

    const chartData = {
        labels: history.map(h => new Date(h.timestamp).toLocaleTimeString()),
        datasets: [
            {
                label: 'Heart Rate (bpm)',
                data: history.map(h => h.heartRate),
                borderColor: 'rgb(220, 38, 38)',
                backgroundColor: 'rgba(220, 38, 38, 0.5)',
                tension: 0.3
            },
            {
                label: 'SpO2 (%)',
                data: history.map(h => h.spO2),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                tension: 0.3
            }
        ]
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 pt-4">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Doctor Dashboard</h1>
                {patient && <span className="text-xl text-gray-600">Patient: {patient.name}</span>}
            </div>

            {alert && <div className="bg-red-500 text-white p-4 rounded-lg shadow-lg font-bold animate-pulse text-lg">{alert}</div>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Patient Details Panel */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Patient Details</h2>
                    {patient ? (
                        <div className="space-y-2">
                            <p><strong>Name:</strong> {patient.name}</p>
                            <p><strong>Age:</strong> {patient.age}</p>
                            <p><strong>Condition:</strong> {patient.condition}</p>
                            <div className="mt-4">
                                <strong>Medical History:</strong>
                                <ul className="list-disc pl-5 mt-1 text-gray-600 border-t pt-2">
                                    {patient.history.map((hist, idx) => <li key={idx}>{hist}</li>)}
                                </ul>
                            </div>
                        </div>
                    ) : <p>Loading...</p>}
                </div>

                {/* Live Vitals */}
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    <div className={`p-6 rounded-xl shadow-sm border flex flex-col justify-center items-center ${vitals.hr > 120 || vitals.hr < 50 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
                        <h2 className="text-gray-500 font-medium">Heart Rate</h2>
                        <p className="text-5xl font-bold text-red-600 mt-2">{vitals.hr} <span className="text-xl font-normal text-gray-400">bpm</span></p>
                    </div>
                    <div className={`p-6 rounded-xl shadow-sm border flex flex-col justify-center items-center ${vitals.spO2 !== '--' && vitals.spO2 < 90 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
                        <h2 className="text-gray-500 font-medium">SpO2 Level</h2>
                        <p className="text-5xl font-bold text-blue-600 mt-2">{vitals.spO2} <span className="text-xl font-normal text-gray-400">%</span></p>
                    </div>
                </div>
            </div>

            {/* Vitals Graph */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Vitals History (Last 30 Min)</h2>
                <div className="h-80">
                    <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
            </div>
        </div>
    );
}

