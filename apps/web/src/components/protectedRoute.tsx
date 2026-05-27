import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
    const { isAuthenticated, isLoading } = useAuth();

    // Pendant la lecture du localStorage, on ne redirige pas encore
    if (isLoading) {
        return (
            <div className="fr-container fr-my-6w" style={{ textAlign: 'center' }}>
                <p className="fr-text--lg">Chargement...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/connexion" replace />;
    }

    return <>{children}</>;
}