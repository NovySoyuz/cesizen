import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../api/authService';
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import type { RegisterRequest } from '../types/auth';

export default function RegisterPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState<RegisterRequest>({ nom: '', prenom: '', email: '', motDePasse: '' });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const handleChange = (field: keyof RegisterRequest) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [field]: e.target.value });
        setErrors({ ...errors, [field]: '' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        try {
            const data = await authService.register(form);
            login(data);
            navigate('/');
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: Record<string, string> | { message?: string } } };
            const data = axiosErr?.response?.data;
            if (data && 'message' in data) {
                setErrors({ general: data.message ?? 'Erreur inconnue' });
            } else if (data) {
                setErrors(data as Record<string, string>);
            } else {
                setErrors({ general: 'Une erreur est survenue. Veuillez réessayer.' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main role="main" id="content">
            <div className="fr-container fr-my-6w">
                <div className="fr-grid-row fr-grid-row--center">
                    <div className="fr-col-12 fr-col-md-8 fr-col-lg-6">
                        <div className="fr-card fr-card--shadow fr-p-4w">
                            <h1 className="fr-h2 fr-mb-4w">Créer un compte</h1>

                            {errors.general && (
                                <Alert
                                    severity="error"
                                    title="Erreur d'inscription"
                                    description={errors.general}
                                    className="fr-mb-3w"
                                    small
                                />
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="fr-grid-row fr-grid-row--gutters">
                                    <div className="fr-col-12 fr-col-md-6">
                                        <Input
                                            label="Nom"
                                            state={errors.nom ? 'error' : 'default'}
                                            stateRelatedMessage={errors.nom}
                                            nativeInputProps={{
                                                name: 'nom', value: form.nom, required: true,
                                                autoComplete: 'family-name',
                                                onChange: handleChange('nom'),
                                            }}
                                        />
                                    </div>
                                    <div className="fr-col-12 fr-col-md-6">
                                        <Input
                                            label="Prénom"
                                            state={errors.prenom ? 'error' : 'default'}
                                            stateRelatedMessage={errors.prenom}
                                            nativeInputProps={{
                                                name: 'prenom', value: form.prenom, required: true,
                                                autoComplete: 'given-name',
                                                onChange: handleChange('prenom'),
                                            }}
                                        />
                                    </div>
                                </div>
                                <Input
                                    label="Adresse e-mail"
                                    state={errors.email ? 'error' : 'default'}
                                    stateRelatedMessage={errors.email}
                                    className="fr-mt-2w"
                                    nativeInputProps={{
                                        type: 'email', name: 'email', value: form.email, required: true,
                                        autoComplete: 'email',
                                        onChange: handleChange('email'),
                                    }}
                                />
                                <Input
                                    label="Mot de passe"
                                    hintText="Au moins 8 caractères"
                                    state={errors.motDePasse ? 'error' : 'default'}
                                    stateRelatedMessage={errors.motDePasse}
                                    className="fr-mt-2w"
                                    nativeInputProps={{
                                        type: 'password', name: 'motDePasse', value: form.motDePasse, required: true,
                                        autoComplete: 'new-password', minLength: 8,
                                        onChange: handleChange('motDePasse'),
                                    }}
                                />
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="fr-mt-3w fr-mb-2w"
                                    style={{ width: '100%', justifyContent: 'center' }}
                                >
                                    {loading ? 'Inscription en cours...' : "S'inscrire"}
                                </Button>
                            </form>

                            <p className="fr-text--sm">
                                Déjà un compte ?{' '}
                                <Link to="/connexion" className="fr-link">Se connecter</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
