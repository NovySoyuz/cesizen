import { Header as DsfrHeader } from "@codegouvfr/react-dsfr/Header";
import type { HeaderProps } from "@codegouvfr/react-dsfr/Header";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../api/authService";

export default function Header() {
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            // L'appel API peut échouer si le token est déjà expiré
            await authService.logout();
        } catch {
            // On ignore l'erreur : le logout côté client se fait quoi qu'il arrive
        } finally {
            logout();
            navigate("/");
        }
    };

    // Construction des liens rapides selon le statut de connexion
    const quickAccessItems: HeaderProps["quickAccessItems"] = isAuthenticated
        ? [
            ...(isAdmin
                ? [{ iconId: "fr-icon-settings-5-line" as const, linkProps: { href: "/admin" }, text: "Administration" }]
                : []
            ),
            { iconId: "fr-icon-account-circle-line" as const, linkProps: { href: "/profil" }, text: user ? `${user.prenom} ${user.nom}` : "Mon profil" },
            { iconId: "fr-icon-logout-box-r-line" as const, buttonProps: { onClick: handleLogout }, text: "Se déconnecter" },
        ]
        : [
            { iconId: "fr-icon-account-circle-line" as const, linkProps: { href: "/connexion" }, text: "Se connecter" },
            { iconId: "fr-icon-user-add-line" as const, linkProps: { href: "/inscription" }, text: "S'inscrire" },
        ];

    const navigation: HeaderProps["navigation"] = [
        { text: "Accueil", linkProps: { href: "/" } },
        { text: "Informations", linkProps: { href: "/informations" } },
        { text: "Diagnostic de stress", linkProps: { href: "/diagnostic" } },
        ...(isAuthenticated
            ? [{ text: "Mes diagnostics", linkProps: { href: "/diagnostic/historique" } }]
            : []
        ),
    ];

    return (
        <DsfrHeader
            brandTop={<>CESI<br />Zen</>}
            homeLinkProps={{ href: "/", title: "Accueil – CESIZen" }}
            serviceTitle="CESIZen"
            serviceTagline="Votre compagnon de santé mentale"
            quickAccessItems={quickAccessItems}
            navigation={navigation}
        />
    );
}

