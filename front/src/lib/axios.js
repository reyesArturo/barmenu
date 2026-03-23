import axios from 'axios';

const envApiUrl = import.meta.env.VITE_API_URL?.trim();
const isDev = import.meta.env.DEV;
const productionFallbackApiUrl = 'https://barmenu.onrender.com/api';

// In dev we rely on Vite proxy (/api). In production, missing VITE_API_URL falls back to Render backend.
const baseURL = envApiUrl || (isDev ? '/api' : productionFallbackApiUrl);

if (!envApiUrl && !isDev) {
    console.warn('VITE_API_URL is not defined. Using production fallback:', baseURL);
}

const api = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'bypass-tunnel-reminder': 'true',
    }
});

api.interceptors.request.use((config) => {
    if (config.data instanceof FormData) {
        if (config.headers) {
            delete config.headers['Content-Type'];
        }
    }

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

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const requestUrl = String(error?.config?.url || '');
        const isLoginRequest = requestUrl.includes('/login');
        const isAdminRequest = requestUrl.includes('/admin/');

        // Si el token expiro o no es valido en una llamada administrativa,
        // limpiamos sesion local y forzamos regreso al login.
        if (status === 401 && isAdminRequest && !isLoginRequest) {
            localStorage.removeItem('rb_auth');

            if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
                window.location.assign('/login');
            }
        }

        return Promise.reject(error);
    }
);

export default api;
