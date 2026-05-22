import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        nom: user?.nom ?? '',
        prenom: user?.prenom ?? '',
        motDePasse: '',
    });

    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.put('/api/users/me', form);
            setMessage('Profil mis à jour avec succès !');
        } catch {
            setMessage('Erreur lors de la mise à jour.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await api.post('/api/auth/logout');
        logout();
        navigate('/login');
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>Mon profil</h1>

                <div style={styles.info}>
                    <p><strong>Email :</strong> {user?.email}</p>
                    <p><strong>Rôle :</strong> {user?.role}</p>
                </div>

                {message && <p style={styles.success}>{message}</p>}

                <form onSubmit={handleUpdate} style={styles.form}>
                    <div style={styles.row}>
                        <div style={styles.field}>
                            <label>Nom</label>
                            <input name="nom" value={form.nom} onChange={handleChange} style={styles.input} />
                        </div>
                        <div style={styles.field}>
                            <label>Prénom</label>
                            <input name="prenom" value={form.prenom} onChange={handleChange} style={styles.input} />
                        </div>
                    </div>

                    <div style={styles.field}>
                        <label>Nouveau mot de passe <span style={{ color: '#999' }}>(optionnel)</span></label>
                        <input name="motDePasse" type="password" value={form.motDePasse} onChange={handleChange} style={styles.input} placeholder="Laisser vide pour ne pas changer" />
                    </div>

                    <button type="submit" disabled={loading} style={styles.button}>
                        {loading ? 'Mise à jour...' : 'Mettre à jour'}
                    </button>
                </form>

                <button onClick={handleLogout} style={styles.logoutButton}>
                    Se déconnecter
                </button>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' },
    card: { background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', width: '100%', maxWidth: '480px' },
    title: { marginBottom: '1rem', textAlign: 'center', color: '#333' },
    info: { background: '#f9f9f9', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem' },
    form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    row: { display: 'flex', gap: '1rem' },
    field: { display: 'flex', flexDirection: 'column', flex: 1, gap: '0.25rem' },
    input: { padding: '0.6rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem' },
    button: { padding: '0.75rem', background: '#4a90e2', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer' },
    logoutButton: { width: '100%', marginTop: '1rem', padding: '0.75rem', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer' },
    success: { color: 'green', background: '#f0fff0', padding: '0.5rem', borderRadius: '4px' },
};