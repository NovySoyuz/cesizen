import { useEffect, useState } from 'react';
import { userService } from '../../api/userService';
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Table } from "@codegouvfr/react-dsfr/Table";
import type { UserDto } from '../../types/auth';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const fetchUsers = () => {
        setLoading(true);
        userService.getAllUsers()
            .then(setUsers)
            .catch(() => setError('Impossible de charger la liste des utilisateurs.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleDisable = async (user: UserDto) => {
        if (!confirm(`Désactiver le compte de ${user.prenom} ${user.nom} ?`)) return;
        try {
            await userService.disableUser(user.id);
            setSuccessMsg(`Compte de ${user.prenom} ${user.nom} désactivé.`);
            fetchUsers();
        } catch {
            setError('Erreur lors de la désactivation.');
        }
    };

    const handleActivate = async (user: UserDto) => {
        try {
            await userService.activateUser(user.id);
            setSuccessMsg(`Compte de ${user.prenom} ${user.nom} réactivé.`);
            fetchUsers();
        } catch {
            setError('Erreur lors de la réactivation.');
        }
    };

    const handleDelete = async (user: UserDto) => {
        if (!confirm(`SUPPRIMER DÉFINITIVEMENT le compte de ${user.prenom} ${user.nom} ? Cette action est irréversible.`)) return;
        try {
            await userService.hardDeleteUser(user.id);
            setSuccessMsg(`Compte de ${user.prenom} ${user.nom} supprimé.`);
            fetchUsers();
        } catch {
            setError('Erreur lors de la suppression.');
        }
    };

    const handleRoleChange = async (user: UserDto, newRole: string) => {
        if (!confirm(`Changer le rôle de ${user.prenom} ${user.nom} en "${newRole}" ?`)) return;
        try {
            await userService.changeRole(user.id, newRole);
            setSuccessMsg(`Rôle de ${user.prenom} ${user.nom} mis à jour en ${newRole}.`);
            fetchUsers();
        } catch {
            setError('Erreur lors du changement de rôle.');
        }
    };

    const tableData = users.map(user => [
        `${user.nom} ${user.prenom}`,
        user.email,
        <div key={user.id + '-role'} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Badge severity={user.role === 'ADMIN' ? 'warning' : user.role === 'MODERATEUR' ? 'new' : 'info'} small>
                {user.role === 'ADMIN' ? 'Admin' : user.role === 'MODERATEUR' ? 'Modérateur' : 'Utilisateur'}
            </Badge>
            <select
                className="fr-select"
                value={user.role}
                style={{ width: 'auto', padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}
                onChange={e => handleRoleChange(user, e.target.value)}
            >
                <option value="USER">Utilisateur</option>
                <option value="MODERATEUR">Modérateur</option>
                <option value="ADMIN">Admin</option>
            </select>
        </div>,
        <Badge key={user.id + '-status'} severity={user.estActif ? 'success' : 'error'} small>
            {user.estActif ? 'Actif' : 'Inactif'}
        </Badge>,
        <div key={user.id + '-actions'} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {user.estActif ? (
                <Button
                    size="small"
                    priority="secondary"
                    iconId="ri-user-forbid-line"
                    onClick={() => handleDisable(user)}
                >
                    Désactiver
                </Button>
            ) : (
                <Button
                    size="small"
                    priority="secondary"
                    iconId="fr-icon-user-heart-line"
                    onClick={() => handleActivate(user)}
                >
                    Réactiver
                </Button>
            )}
            <Button
                size="small"
                priority="tertiary"
                iconId="fr-icon-delete-line"
                onClick={() => handleDelete(user)}
                style={{ color: 'var(--error-425-625)' }}
            >
                Supprimer
            </Button>
        </div>,
    ]);

    return (
        <main role="main" id="content">
            <div className="fr-container fr-my-4w">
                <Breadcrumb
                    currentPageLabel="Utilisateurs"
                    homeLinkProps={{ href: "/" }}
                    segments={[{ label: "Administration", linkProps: { href: "/admin" } }]}
                />

                <h1 className="fr-h2">Gestion des utilisateurs</h1>
                <p className="fr-text--lead fr-mb-4w">
                    {users.length} utilisateur{users.length > 1 ? 's' : ''} enregistré{users.length > 1 ? 's' : ''}.
                </p>

                {successMsg && (
                    <Alert severity="success" title="Succès" description={successMsg} className="fr-mb-3w" small
                        closable onClose={() => setSuccessMsg('')} />
                )}
                {error && (
                    <Alert severity="error" title="Erreur" description={error} className="fr-mb-3w" small
                        closable onClose={() => setError('')} />
                )}

                {loading ? (
                    <div className="fr-my-4w" style={{ textAlign: 'center' }}>
                        <span>Chargement...</span>
                    </div>
                ) : (
                    <div className="fr-table fr-table--bordered" style={{ overflowX: 'auto' }}>
                        <Table
                            caption="Liste des utilisateurs"
                            headers={['Nom Prénom', 'Email', 'Rôle', 'Statut', 'Actions']}
                            data={tableData}
                        />
                    </div>
                )}
            </div>
        </main>
    );
}





