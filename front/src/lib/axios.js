import axios from 'axios';

const api = axios.create({
    baseURL: `http://${window.location.hostname}:8080/api`, // Servidor de Laravel local
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

export default api;
