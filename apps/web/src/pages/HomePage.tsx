import { CallOut } from "@codegouvfr/react-dsfr/CallOut";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Tile } from "@codegouvfr/react-dsfr/Tile";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    return (
        <main role="main" id="content">
            {/* Hero */}
            <div className="fr-container fr-my-6w">
                <div className="fr-grid-row fr-grid-row--gutters fr-grid-row--middle">
                    <div className="fr-col-12 fr-col-md-7">
                        <h1 className="fr-display--sm">
                            Bienvenue sur <span style={{ color: "var(--blue-france-sun-113-625)" }}>CESIZen</span>
                        </h1>
                        <p className="fr-text--lead fr-mb-4w">
                            Votre compagnon numérique pour mieux comprendre et gérer votre santé mentale.
                            Accédez à des informations fiables, des diagnostics de stress et des outils adaptés à votre quotidien.
                        </p>
                        <div className="fr-btns-group fr-btns-group--inline">
                            <Button onClick={() => navigate("/diagnostic")} iconId="fr-icon-heart-pulse-fill">
                                Faire mon diagnostic
                            </Button>
                            <Button
                                onClick={() => navigate("/informations")}
                                priority="secondary"
                                iconId="fr-icon-book-2-line"
                            >
                                Lire les informations
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Appel à l'action */}
            {!isAuthenticated && (
                <div className="fr-container fr-mb-6w">
                    <CallOut
                        title="Créez votre espace personnel"
                        iconId="fr-icon-account-circle-fill"
                        buttonProps={{
                            children: "S'inscrire gratuitement",
                            onClick: () => navigate("/inscription"),
                        }}
                    >
                        Inscrivez-vous pour sauvegarder vos diagnostics, suivre votre évolution dans le temps et accèder à toutes les fonctionnalités de CESIZen.
                    </CallOut>
                </div>
            )}

            {/* Tuiles des fonctionnalités */}
            <div className="fr-container fr-mb-6w">
                <h2 className="fr-h2">Nos services</h2>
                <div className="fr-grid-row fr-grid-row--gutters">
                    <div className="fr-col-12 fr-col-md-4">
                        <Tile
                            title="Informations santé mentale"
                            desc="Accédez à des articles et ressources sur la santé mentale, le stress et les stratégies de prévention."
                            linkProps={{ href: "/informations" }}
                        />
                    </div>
                    <div className="fr-col-12 fr-col-md-4">
                        <Tile
                            title="Diagnostic de stress"
                            desc="Évaluez votre niveau de stress à travers un questionnaire validé et obtenez une analyse personnalisée."
                            linkProps={{ href: "/diagnostic" }}
                        />
                    </div>
                    <div className="fr-col-12 fr-col-md-4">
                        <Tile
                            title="Mon espace personnel"
                            desc={
                                isAuthenticated
                                    ? "Consultez vos diagnostics passés et gérez votre profil."
                                    : "Inscrivez-vous pour accéder à votre historique de diagnostics."
                            }
                            linkProps={{ href: isAuthenticated ? "/profil" : "/inscription" }}
                        />
                    </div>
                </div>
            </div>

            {/* Notice informative */}
            <div className="fr-container fr-mb-6w">
                <div className="fr-notice fr-notice--info">
                    <div className="fr-container">
                        <div className="fr-notice__body">
                            <p className="fr-notice__title">
                                CESIZen ne remplace pas un avis médical professionnel.
                            </p>
                            <p>
                                En cas de détresse psychologique sévère, contactez le{" "}
                                <strong>3114</strong> (numéro national de prévention du suicide, disponible 24h/24).
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}


