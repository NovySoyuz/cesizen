import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../api/authService';
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import type { LoginRequest } from '../types/auth';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState<LoginRequest>({ email: '', motDePasse: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await authService.login(form);
            login(data);
            navigate('/');
        } catch {
            setError('Email ou mot de passe incorrect.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main role="main" id="content">
            <div className="fr-container fr-container--fluid fr-my-6w">
                <div className="fr-grid-row fr-grid-row--center">
                    <div className="fr-col-12 fr-col-md-6 fr-col-lg-4">
                        <div className="fr-card fr-card--shadow fr-p-4w">
                            <h1 className="fr-h2 fr-mb-4w">Connexions</h1>

                            {error && (
                                <Alert
                                    severity="error"
                                    title="Erreur de connexion"
                                    description={error}
                                    className="fr-mb-3w"
                                    small
                                />
                            )}

                            <form onSubmit={handleSubmit}>
                                <Input
                                    label="Adresse e-mail"
                                    nativeInputProps={{
                                        type: 'email',
                                        name: 'email',
                                        value: form.email,
                                        autoComplete: 'email',
                                        required: true,
                                        onChange: (e) => setForm({ ...form, email: e.target.value }),
                                    }}
                                    className="fr-mb-2w"
                                />
                                <Input
                                    label="Mot de passe"
                                    nativeInputProps={{
                                        type: 'password',
                                        name: 'motDePasse',
                                        value: form.motDePasse,
                                        autoComplete: 'current-password',
                                        required: true,
                                        onChange: (e) => setForm({ ...form, motDePasse: e.target.value }),
                                    }}
                                    className="fr-mb-3w"
                                />
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="fr-mb-3w"
                                    style={{ width: '100%', justifyContent: 'center' }}
                                >
                                    {loading ? 'Connexion en cours...' : 'Se connecter'}
                                </Button>
                            </form>

                            <p className="fr-text--sm">
                                Pas encore de comptes ?{' '}
                                <Link to="/inscription" className="fr-link">S'inscrire</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
