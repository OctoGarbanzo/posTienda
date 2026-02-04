import axios from 'axios';

const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

const api = axios.create({
    baseURL: apiBase
        ? (apiBase.endsWith('/api') ? apiBase : `${apiBase}/api`)
        : '/api'
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
