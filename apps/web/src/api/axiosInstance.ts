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
 * - Android physique  : utilise VITE_API_URL (voir options ci-dessous)
 * - iOS simulateur    : localhost fonctionne directement via Capacitor
 * - Navigateur web    : utilise VITE_API_URL ou localhost par défaut
 *
 * ──────────────────────────────────────────────────────────────────────
 * OPTION 1 — Appareil physique connecté en USB (RECOMMANDÉ en école)
 *    Contourne les pare-feu WiFi via le câble USB :
 *      1. adb reverse tcp:8080 tcp:8080
 *      2. Dans .env.local → VITE_API_URL=http://localhost:8080
 *      3. npm run mobile:build
 * ──────────────────────────────────────────────────────────────────────
 */
function getApiBaseUrl(): string {
    // Si une URL est explicitement définie (utile pour appareil physique), on la prioritise toujours
    const envUrl = import.meta.env.VITE_API_URL as string | undefined;
    if (envUrl) {
        return envUrl;
    }

    if (Capacitor.isNativePlatform()) {
        if (Capacitor.getPlatform() === 'android') {
            // 10.0.2.2 = loopback de la machine hôte uniquement dans l'émulateur Android
            return 'http://10.0.2.2:8080';
        }
        return 'http://localhost:8080';
    }
    // Fonctionne quelle que soit l'IP (localhost, réseau école, etc.)
    return '';
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