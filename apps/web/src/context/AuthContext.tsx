import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthResponse, UserDto } from '../types/auth';

// Définit ce que le contexte expose à toute l'application
// memoire globale de l'appli n'importe quel composant peut appeler useAuth() pour accéder à ces données et fonctions
interface AuthContextType {
    user: UserDto | null;
    token: string | null;
    login: (data: AuthResponse) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
}

// Crée le contexte (valeur par défaut null)
const AuthContext = createContext<AuthContextType | null>(null);

// Provider : enveloppe l'application et rend le contexte accessible partout
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserDto | null>(null);
    const [token, setToken] = useState<string | null>(null);

    // Au démarrage, récupère les données depuis localStorage
    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
    }, []);

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

    // Appelée lors de la déconnexion
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            login,
            logout,
            isAuthenticated: !!token,
            isAdmin: user?.role === 'ADMIN',
        }}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook personnalisé pour utiliser le contexte facilement dans les composants
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth doit être utilisé dans un AuthProvider');
    return context;
}