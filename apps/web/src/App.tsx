import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/protectedRoute';
import AdminRoute from './components/AdminRoute';
import Header from './components/Header';
import Footer from './components/Footer';

// Pages publiques
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import InformationsPage from './pages/InformationsPage';
import InformationDetailPage from './pages/InformationDetailPage';
import DiagnosticPage from './pages/DiagnosticPage';

// Pages authentifiées
import ProfilePage from './pages/ProfilePage';
import DiagnosticHistoryPage from './pages/DiagnosticHistoryPage';

// Pages admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminPagesPage from './pages/admin/AdminPagesPage';

// Redirige vers / si déjà connecté (pour login/register)
function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>;
}

function AppRoutes() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            {/* flex:1 pousse naturellement le footer vers le bas */}
            <div style={{ flex: 1 }}>
                <Routes>
                    {/* Accueil */}
                    <Route path="/" element={<HomePage />} />

                    {/* Auth */}
                    <Route path="/connexion" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
                    <Route path="/inscription" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

                    {/* Informations (public) */}
                    <Route path="/informations" element={<InformationsPage />} />
                    <Route path="/informations/:slug" element={<InformationDetailPage />} />

                    {/* Diagnostic (public) */}
                    <Route path="/diagnostic" element={<DiagnosticPage />} />

                    {/* Routes authentifiées */}
                    <Route path="/profil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                    <Route path="/diagnostic/historique" element={<ProtectedRoute><DiagnosticHistoryPage /></ProtectedRoute>} />

                    {/* Routes admin */}
                    <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                    <Route path="/admin/utilisateurs" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
                    <Route path="/admin/pages" element={<AdminRoute><AdminPagesPage /></AdminRoute>} />

                    {/* Redirections legacy */}
                    <Route path="/login" element={<Navigate to="/connexion" replace />} />
                    <Route path="/register" element={<Navigate to="/inscription" replace />} />
                    <Route path="/profile" element={<Navigate to="/profil" replace />} />

                    {/* 404 */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
            <Footer />
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}

