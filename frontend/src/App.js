import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Landing from './pages/Landing';
import Management from './pages/Management';
import Doctor from './pages/Doctor';
import Ambulance from './pages/Ambulance';
import { Sun, Moon, ShieldPlus } from 'lucide-react';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  return (
    <Router>
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 ${darkMode ? 'dark' : ''}`}>
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ShieldPlus className="text-blue-600 dark:text-blue-400" size={32} />
              <Link to="/" className="font-bold text-xl text-gray-900 dark:text-white">HealthFlow IoT</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/management" className="text-gray-600 dark:text-gray-300 hover:text-blue-600">Admin</Link>
              <Link to="/doctor" className="text-gray-600 dark:text-gray-300 hover:text-blue-600">Doctor</Link>
              <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </nav>
        <main className="p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/management" element={<Management />} />
            <Route path="/doctor" element={<Doctor />} />
            <Route path="/ambulance/:id" element={<Ambulance />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
