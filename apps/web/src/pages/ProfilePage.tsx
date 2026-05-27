import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../api/userService';
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";

export default function ProfilePage() {
    const { user, logout, login, token } = useAuth();

    const [form, setForm] = useState({
        nom: user?.nom ?? '',
        prenom: user?.prenom ?? '',
        email: user?.email ?? '',
        motDePasse: '',
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [field]: e.target.value });
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');
        try {
            const updated = await userService.updateMe(form);
            // Mettre à jour le contexte auth avec les nouvelles données
            login({ ...updated, token: token!, type: 'Bearer' });
            setMessage('Profil mis à jour avec succès !');
            setForm({ ...form, motDePasse: '' });
        } catch {
            setError('Erreur lors de la mise à jour du profil.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    return (
        <main role="main" id="content">
            <div className="fr-container fr-my-4w">
                <Breadcrumb
                    currentPageLabel="Mon profil"
                    homeLinkProps={{ href: "/" }}
                    segments={[]}
                />

                <h1 className="fr-h2">Mon profil</h1>

                <div className="fr-grid-row fr-grid-row--gutters">
                    {/* Informations du compte */}
                    <div className="fr-col-12 fr-col-md-4">
                        <div className="fr-card fr-p-3w">
                            <h2 className="fr-h5">Informations du compte</h2>
                            <p className="fr-text--sm fr-mb-1w">
                                <strong>Email :</strong> {user?.email}
                            </p>
                            <p className="fr-text--sm fr-mb-2w">
                                <strong>Rôle :</strong>{' '}
                                <Badge
                                    severity={user?.role === 'ADMIN' ? 'warning' : 'info'}
                                    small
                                >
                                    {user?.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}
                                </Badge>
                            </p>
                            <p className="fr-text--sm fr-mb-3w">
                                <strong>Statut :</strong>{' '}
                                <Badge severity="success" small>Actif</Badge>
                            </p>
                            <Button
                                priority="tertiary no outline"
                                iconId="fr-icon-logout-box-r-line"
                                onClick={handleLogout}
                                className="fr-btn--sm"
                            >
                                Se déconnecter
                            </Button>
                        </div>
                    </div>

                    {/* Formulaire de modification */}
                    <div className="fr-col-12 fr-col-md-8">
                        <div className="fr-card fr-p-3w">
                            <h2 className="fr-h5">Modifier mes informations</h2>

                            {message && (
                                <Alert severity="success" title="Succès" description={message} className="fr-mb-3w" small />
                            )}
                            {error && (
                                <Alert severity="error" title="Erreur" description={error} className="fr-mb-3w" small />
                            )}

                            <form onSubmit={handleUpdate}>
                                <div className="fr-grid-row fr-grid-row--gutters">
                                    <div className="fr-col-12 fr-col-md-6">
                                        <Input
                                            label="Nom"
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
                                    className="fr-mt-2w"
                                    nativeInputProps={{
                                        type: 'email', name: 'email', value: form.email, required: true,
                                        autoComplete: 'email',
                                        onChange: handleChange('email'),
                                    }}
                                />
                                <Input
                                    label="Nouveau mot de passe"
                                    hintText="Laisser vide pour ne pas modifier. Au moins 8 caractères."
                                    className="fr-mt-2w"
                                    nativeInputProps={{
                                        type: 'password', name: 'motDePasse', value: form.motDePasse,
                                        autoComplete: 'new-password', minLength: 8,
                                        onChange: handleChange('motDePasse'),
                                    }}
                                />
                                <div className="fr-mt-3w">
                                    <Button type="submit" disabled={loading} iconId="fr-icon-save-line">
                                        {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

