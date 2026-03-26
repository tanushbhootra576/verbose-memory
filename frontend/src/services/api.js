import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${apiUrl}/api`,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const login = (email, password) => api.post('/auth/login', { email, password });
export const fetchPatients = () => api.get('/patients');
export const fetchPatientHistory = (id) => api.get(`/patient/${id}`);
export const fetchVitals = (id) => api.get(`/vitals/${id}`);
export const fetchAmbulances = () => api.get('/ambulances');
export const fetchAmbulance = (id) => api.get(`/ambulance/${id}`);
export const postVitals = (payload) => api.post('/vitals', payload);
export const postAmbulanceLocation = (id, payload) => api.post(`/ambulance/${id}/location`, payload);

export default api;
