import axios from 'axios';
import { Capacitor } from '@capacitor/core';

// Callback enregistré par AuthContext pour déclencher un vrai logout React
let _logoutHandler: (() => void) | null = null;

export function registerLogoutHandler(fn: () => void) {
    _logoutHandler = fn;
}

/**
 * Résolution dynamique de l'URL de base de l'API.
 * - Android émulateur : 10.0.2.2 = loopback de la machine hôte
 * - iOS simulateur    : localhost fonctionne directement via Capacitor
 * - Navigateur web    : utilise VITE_API_URL ou localhost par défaut
 */
function getApiBaseUrl(): string {
    if (Capacitor.isNativePlatform()) {
        if (Capacitor.getPlatform() === 'android') {
            return 'http://10.0.2.2:8080';
        }
        return 'http://localhost:8080';
    }
    return (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:8080';
}

// Instance Axios configurée avec l'URL de base de l'API (adaptée selon la plateforme)
const api = axios.create({
    baseURL: getApiBaseUrl(),
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