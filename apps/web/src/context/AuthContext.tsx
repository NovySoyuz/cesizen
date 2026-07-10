import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { AuthResponse, UserDto } from '../types/auth';
import { registerLogoutHandler } from '../api/axiosInstance';
import api from '../api/axiosInstance';

// ── Décode le JWT et vérifie s'il est expiré ─────────────────────
function isTokenExpired(token: string): boolean {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 < Date.now();
    } catch {
        return true; // token malformé → considéré expiré
    }
}

// Définit ce que le contexte expose à toute l'application
// memoire globale de l'appli n'importe quel composant peut appeler useAuth() pour accéder à ces données et fonctions
interface AuthContextType {
    user: UserDto | null;
    token: string | null;
    login: (data: AuthResponse) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isModerator: boolean;
    isLoading: boolean;
}

// Crée le contexte (valeur par défaut null)
const AuthContext = createContext<AuthContextType | null>(null);

// Provider : enveloppe l'application et rend le contexte accessible partout
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserDto | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true); // ← true au démarrage

    // ── Fonction logout partagée (utilisée aussi par l'intercepteur) ─
    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    }, []);

    // ── Au démarrage : vérifier le token puis recharger le profil réel ─
    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (savedToken && savedUser) {
            if (isTokenExpired(savedToken)) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setIsLoading(false);
            } else {
                // Initialise d'abord avec le cache local (affichage immédiat)
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
                // Puis rafraîchit le profil depuis l'API pour avoir le rôle à jour
                api.get<UserDto>('/api/users/me', {
                    headers: { Authorization: `Bearer ${savedToken}` }
                }).then(res => {
                    const freshUser = res.data;
                    localStorage.setItem('user', JSON.stringify(freshUser));
                    setUser(freshUser);
                }).catch(() => {
                    // Si l'API échoue, on garde le cache local
                }).finally(() => {
                    setIsLoading(false);
                });
            }
        } else {
            setIsLoading(false);
        }
    }, []);

    // ── Enregistrer logout dans l'intercepteur Axios ─────────────────
    useEffect(() => {
        registerLogoutHandler(logout);
    }, [logout]);

    // ── Vérification périodique de l'expiration du token (toutes les minutes) ─
    useEffect(() => {
        if (!token) return;

        const interval = setInterval(() => {
            if (isTokenExpired(token)) {
                logout();
                window.location.href = '/connexion';
            }
        }, 60_000); // vérification toutes les 60 secondes

        return () => clearInterval(interval);
    }, [token, logout]);

    // Appelée après login/register réussi
    const login = (data: AuthResponse) => {
        const userDto: UserDto = {
            id: data.id,
            nom: data.nom,
            prenom: data.prenom,
            email: data.email,
            role: data.role,
            estActif: true,
        };
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userDto));
        setToken(data.token);
        setUser(userDto);
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            login,
            logout,
            isAuthenticated: !!token,
            isAdmin: user?.role === 'ADMIN',
            isModerator: user?.role === 'MODERATEUR' || user?.role === 'ADMIN',
            isLoading,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook personnalisé pour utiliser le contexte facilement dans les composants
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth doit être utilisé dans un AuthProvider');
    return context;
}