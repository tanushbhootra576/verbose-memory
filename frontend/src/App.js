import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Landing from './pages/Landing';
import Management from './pages/Management';
import Doctor from './pages/Doctor';
import Ambulance from './pages/Ambulance';
import Login from './pages/Login';
import { Sun, Moon, ShieldPlus, LogOut } from 'lucide-react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

const Shell = ({ children }) => {
  const { darkMode, toggle } = useTheme();
  const { user, logout } = useAuth();

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 ${darkMode ? 'dark' : ''}`}>
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldPlus className="text-blue-600 dark:text-blue-400" size={32} />
            <Link to="/" className="font-bold text-xl text-gray-900 dark:text-white">HealthFlow IoT</Link>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link to="/management" className="text-gray-600 dark:text-gray-300 hover:text-blue-600">Management</Link>
            <Link to="/doctor" className="text-gray-600 dark:text-gray-300 hover:text-blue-600">Doctor</Link>
            {user ? (
              <button onClick={logout} className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                <LogOut size={16} /> Logout
              </button>
            ) : (
              <Link to="/login" className="px-3 py-1 rounded-lg bg-blue-600 text-white">Login</Link>
            )}
            <button onClick={toggle} className="p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </nav>
      <main className="p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <Router>
            <Shell>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/management" element={<Management />} />
                <Route path="/doctor" element={<Doctor />} />
                <Route path="/ambulance/:id" element={<Ambulance />} />
              </Routes>
            </Shell>
          </Router>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
