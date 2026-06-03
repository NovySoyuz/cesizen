import { useAuth } from '../../context/AuthContext';
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Tile } from "@codegouvfr/react-dsfr/Tile";

export default function AdminDashboard() {
    const { user } = useAuth();

    return (
        <main role="main" id="content">
            <div className="fr-container fr-my-4w">
                <Breadcrumb
                    currentPageLabel="Administration"
                    homeLinkProps={{ href: "/" }}
                    segments={[]}
                />

                <div className="fr-grid-row fr-grid-row--middle fr-mb-4w">
                    <div className="fr-col">
                        <h1 className="fr-h2">Administration</h1>
                        <p className="fr-text--lead">
                            Bienvenue, <strong>{user?.prenom} {user?.nom}</strong>. Gérez les utilisateurs et les contenus de CESIZen.
                        </p>
                    </div>
                </div>

                <div className="fr-grid-row fr-grid-row--gutters">
                    <div className="fr-col-12 fr-col-md-4">
                        <Tile
                            title="Questionnaire de stress"
                            desc="Configurez les événements et les points associés du diagnostic."
                            linkProps={{ href: '/moderateur/questionnaire' }}
                        />
                    </div>
                    <div className="fr-col-12 fr-col-md-4">
                        <Tile
                            title="Gestion des utilisateurs"
                            desc="Consultez, désactivez ou supprimez les comptes utilisateurs."
                            linkProps={{ href: '/admin/utilisateurs' }}
                        />
                    </div>
                    <div className="fr-col-12 fr-col-md-4">
                        <Tile
                            title="Pages d'information"
                            desc="Créez, modifiez et gérez les pages de contenu informatif."
                            linkProps={{ href: '/admin/pages' }}
                        />
                    </div>
                </div>

                <div className="fr-mt-4w">
                    <div className="fr-notice fr-notice--info">
                        <div className="fr-container">
                            <div className="fr-notice__body">
                                <p className="fr-notice__title">Espace administrateur</p>
                                <p>
                                    Les actions effectuées ici ont un impact direct sur l'application.
                                    Agissez avec précaution, notamment pour la suppression définitive de données.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}




