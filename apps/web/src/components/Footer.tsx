import { Footer as DsfrFooter } from "@codegouvfr/react-dsfr/Footer";
export default function Footer() {
    return (
        // position:relative + zIndex:0 du DSFR footer → on le neutralise avec un wrapper
        <div style={{ position: 'relative', zIndex: 0, flexShrink: 0 }}>
            <DsfrFooter
                brandTop={<>CESI<br />Zen</>}
                homeLinkProps={{ href: "/", title: "Accueil - CESIZen" }}
                accessibility="non compliant"
                contentDescription="CESIZen est une plateforme dediee a la sante mentale, proposant des outils de gestion du stress, des informations et des diagnostics."
                bottomItems={[
                    { text: "Mentions legales", linkProps: { href: "/mentions-legales" } },
                    { text: "Accessibilite : non conforme", linkProps: { href: "/accessibilite" } },
                ]}
            />
        </div>
    );
}
