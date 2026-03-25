import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DoctorDashboard from './DoctorDashboard';
import AdminDashboard from './AdminDashboard';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-100 p-4">
                <Routes>
                    <Route path="/" element={<div className="text-center mt-20"><h1 className="text-4xl font-bold">Healthcare IoT System</h1><div className="mt-8 flex justify-center gap-4"><a href="/admin" className="px-4 py-2 bg-blue-600 text-white rounded">Admin Dashboard</a><a href="/doctor/69c416e228d04484d8d4d577" className="px-4 py-2 bg-green-600 text-white rounded">Doctor Dashboard (Test Patient)</a></div></div>} />
                    <Route path="/doctor/:patientId" element={<DoctorDashboard />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
