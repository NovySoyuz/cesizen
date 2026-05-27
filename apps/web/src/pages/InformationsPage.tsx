import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pageService } from '../api/pageService';
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import type { PageDto } from '../types/page';

export default function InformationsPage() {
    const [pages, setPages] = useState<PageDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        pageService.getAllPages()
            .then(setPages)
            .catch(() => setError('Impossible de charger les informations.'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <main role="main" id="content">
            <div className="fr-container fr-my-4w">
                <Breadcrumb
                    currentPageLabel="Informations"
                    homeLinkProps={{ href: "/" }}
                    segments={[]}
                />

                <h1 className="fr-h2">Informations santé mentale</h1>
                <p className="fr-text--lead fr-mb-4w">
                    Retrouvez ici des ressources et articles pour mieux comprendre la santé mentale et agir sur votre bien-être.
                </p>

                {loading && (
                    <div className="fr-my-6w" style={{ textAlign: 'center' }}>
                        <span className="fr-text--lg">Chargement...</span>
                    </div>
                )}

                {error && (
                    <Alert severity="error" title="Erreur" description={error} className="fr-mb-3w" />
                )}

                {!loading && pages.length === 0 && !error && (
                    <Alert
                        severity="info"
                        title="Aucune information disponible pour le moment."
                        description="Revenez bientôt, du contenu sera ajouté prochainement."
                    />
                )}

                <div className="fr-grid-row fr-grid-row--gutters">
                    {pages.map((page) => (
                        <div key={page.id} className="fr-col-12 fr-col-md-6 fr-col-lg-4">
                            <div
                                className="fr-card fr-card--shadow fr-card--horizontal-tier fr-enlarge-link"
                                style={{ cursor: 'pointer' }}
                                onClick={() => navigate(`/informations/${page.slug}`)}
                            >
                                <div className="fr-card__body">
                                    <div className="fr-card__content">
                                        <h3 className="fr-card__title">
                                            <span className="fr-card__link">{page.titre}</span>
                                        </h3>
                                        <p className="fr-card__desc">
                                            {page.contenu
                                                ? page.contenu.replace(/<[^>]+>/g, '').substring(0, 150) + '...'
                                                : 'Cliquez pour en savoir plus.'}
                                        </p>
                                        <div className="fr-card__start">
                                            <Tag small>Santé mentale</Tag>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}

