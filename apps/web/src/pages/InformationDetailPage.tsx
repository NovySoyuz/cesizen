import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pageService } from '../api/pageService';
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import type { PageDto } from '../types/page';

export default function InformationDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [page, setPage] = useState<PageDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!slug) return;
        pageService.getPageBySlug(slug)
            .then(setPage)
            .catch(() => setError('Page introuvable ou inaccessible.'))
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) {
        return (
            <div className="fr-container fr-my-6w" style={{ textAlign: 'center' }}>
                <span className="fr-text--lg">Chargement...</span>
            </div>
        );
    }

    if (error || !page) {
        return (
            <div className="fr-container fr-my-4w">
                <Alert severity="error" title="Page introuvable" description={error} className="fr-mb-3w" />
                <Button onClick={() => navigate('/informations')} priority="secondary" iconId="fr-icon-arrow-left-line">
                    Retour aux informations
                </Button>
            </div>
        );
    }

    return (
        <main role="main" id="content">
            <div className="fr-container fr-my-4w">
                <Breadcrumb
                    currentPageLabel={page.titre}
                    homeLinkProps={{ href: "/" }}
                    segments={[{ label: "Informations", linkProps: { href: "/informations" } }]}
                />

                <div className="fr-grid-row fr-grid-row--gutters">
                    <div className="fr-col-12 fr-col-md-9">
                        <article>
                            <h1 className="fr-h1">{page.titre}</h1>
                            <div
                                className="fr-mt-3w"
                                style={{ lineHeight: '1.8', fontSize: '1rem' }}
                                dangerouslySetInnerHTML={{ __html: page.contenu ?? '' }}
                            />
                        </article>

                        <div className="fr-mt-4w">
                            <Button
                                onClick={() => navigate('/informations')}
                                priority="secondary"
                                iconId="fr-icon-arrow-left-line"
                            >
                                Retour aux informations
                            </Button>
                        </div>
                    </div>

                    <div className="fr-col-12 fr-col-md-3">
                        <div className="fr-card fr-p-3w">
                            <h2 className="fr-h6">Besoin d'aide ?</h2>
                            <p className="fr-text--sm">
                                En cas de détresse psychologique, contactez le{' '}
                                <strong>3114</strong> (numéro national, disponible 24h/24).
                            </p>
                            <Button
                                onClick={() => navigate('/diagnostic')}
                                size="small"
                                iconId="fr-icon-heart-pulse-fill"
                                className="fr-mt-2w"
                            >
                                Faire mon diagnostic
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

