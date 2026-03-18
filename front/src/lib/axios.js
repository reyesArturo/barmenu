import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost/reyes/RestauranteBar/back/public/api';

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

api.interceptors.request.use((config) => {
    try {
        const raw = localStorage.getItem('rb_auth');
        if (!raw) return config;

        const auth = JSON.parse(raw);
        if (auth?.token) {
            config.headers.Authorization = `Bearer ${auth.token}`;
        }
    } catch {
        // No bloqueamos la solicitud si el storage está corrupto.
    }

    return config;
});

export default api;
