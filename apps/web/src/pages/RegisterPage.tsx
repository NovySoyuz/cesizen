import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import type { AuthResponse, RegisterRequest } from '../types/auth';

export default function RegisterPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState<RegisterRequest>({
        nom: '',
        prenom: '',
        email: '',
        motDePasse: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    // Met à jour le champ modifié dans le formulaire
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const response = await api.post<AuthResponse>('/api/auth/register', form);
            login(response.data);       // Stocke le token + user dans le contexte
            navigate('/profile');        // Redirige vers le profil
        } catch (err: unknown) {
            // Gère les erreurs de validation (400)
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosErr = err as { response?: { data?: Record<string, string> | { message?: string } } };
                const data = axiosErr.response?.data;
                if (data && typeof data === 'object' && 'message' in data) {
                    setErrors({ general: data.message ?? 'Erreur inconnue' });
                } else if (data) {
                    setErrors(data as Record<string, string>);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>Créer un compte</h1>

                {errors.general && <p style={styles.error}>{errors.general}</p>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.row}>
                        <div style={styles.field}>
                            <label>Nom</label>
                            <input name="nom" value={form.nom} onChange={handleChange} style={styles.input} />
                            {errors.nom && <span style={styles.fieldError}>{errors.nom}</span>}
                        </div>
                        <div style={styles.field}>
                            <label>Prénom</label>
                            <input name="prenom" value={form.prenom} onChange={handleChange} style={styles.input} />
                            {errors.prenom && <span style={styles.fieldError}>{errors.prenom}</span>}
                        </div>
                    </div>

                    <div style={styles.field}>
                        <label>Email</label>
                        <input name="email" type="email" value={form.email} onChange={handleChange} style={styles.input} />
                        {errors.email && <span style={styles.fieldError}>{errors.email}</span>}
                    </div>

                    <div style={styles.field}>
                        <label>Mot de passe</label>
                        <input name="motDePasse" type="password" value={form.motDePasse} onChange={handleChange} style={styles.input} />
                        {errors.motDePasse && <span style={styles.fieldError}>{errors.motDePasse}</span>}
                    </div>

                    <button type="submit" disabled={loading} style={styles.button}>
                        {loading ? 'Inscription...' : "S'inscrire"}
                    </button>
                </form>

                <p style={styles.link}>
                    Déjà un compte ? <Link to="/login">Se connecter</Link>
                </p>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' },
    card: { background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', width: '100%', maxWidth: '480px' },
    title: { marginBottom: '1.5rem', textAlign: 'center', color: '#333' },
    form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    row: { display: 'flex', gap: '1rem' },
    field: { display: 'flex', flexDirection: 'column', flex: 1, gap: '0.25rem' },
    input: { padding: '0.6rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem' },
    button: { padding: '0.75rem', background: '#4a90e2', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer' },
    error: { color: 'red', background: '#fff0f0', padding: '0.5rem', borderRadius: '4px' },
    fieldError: { color: 'red', fontSize: '0.8rem' },
    link: { textAlign: 'center', marginTop: '1rem' },
};