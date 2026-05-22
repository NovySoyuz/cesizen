import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';

interface Props {
    children: ReactNode;
    adminOnly?: boolean;
}

// Composant gardien : redirige si non connecté ou pas admin
export default function ProtectedRoute({ children, adminOnly = false }: Props) {
    const { isAuthenticated, isAdmin } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}