import axios from 'axios';

// Callback enregistré par AuthContext pour déclencher un vrai logout React
let _logoutHandler: (() => void) | null = null;

export function registerLogoutHandler(fn: () => void) {
    _logoutHandler = fn;
}

// Instance Axios configurée avec l'URL de base de l'API
const api = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteur : ajoute automatiquement le token JWT à chaque requête
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Intercepteur : si le serveur répond 401 (token expiré/invalide) → déconnexion forcée
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // 1. Nettoyer le stockage local
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // 2. Mettre à jour l'état React via le callback enregistré
            if (_logoutHandler) {
                _logoutHandler();
            }
            // 3. Rediriger vers la page de connexion
            if (window.location.pathname !== '/connexion') {
                window.location.href = '/connexion';
            }
        }
        return Promise.reject(error);
    }
);

export default api;