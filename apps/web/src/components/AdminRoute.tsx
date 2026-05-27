import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isAdmin, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="fr-container fr-my-6w" style={{ textAlign: 'center' }}>
                <p className="fr-text--lg">Chargement...</p>
            </div>
        );
    }

    if (!isAuthenticated) return <Navigate to="/connexion" replace />;
    if (!isAdmin) return <Navigate to="/" replace />;
    return <>{children}</>;
}
