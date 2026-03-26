import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Map } from 'lucide-react';

export default function Landing() {
    return (
        <div className="max-w-5xl mx-auto text-center py-20 space-y-12 h-[80vh] flex flex-col justify-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
                    Next-Gen Healthcare <span className="text-blue-600">Monitoring System</span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Real-time IoT dashboards designed for rapid emergency response, live fleet tracking, and deep patient insights.
                </p>
            </motion.div>

            <div className="flex justify-center gap-6">
                <Link to="/management" className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition flex items-center gap-2">
                    <Map size={20} /> Management Dashboard
                </Link>
                <Link to="/doctor" className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2">
                    <Activity size={20} /> Doctor Dashboard
                </Link>
            </div>
        </div>
    );
}
