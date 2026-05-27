import { useEffect, useState } from 'react';
import { pageService } from '../../api/pageService';
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Table } from "@codegouvfr/react-dsfr/Table";
import type { PageDto } from '../../types/page';

type PageForm = {
    id?: number;
    titre: string;
    contenu: string;
    estActif: boolean;
};

const emptyForm: PageForm = { titre: '', contenu: '', estActif: true };

export default function AdminPagesPage() {
    const [pages, setPages] = useState<PageDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [editingPage, setEditingPage] = useState<PageForm | null>(null);
    const [saving, setSaving] = useState(false);

    const fetchPages = () => {
        setLoading(true);
        pageService.getAllPagesAdmin()
            .then(setPages)
            .catch(() => setError('Impossible de charger les pages.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchPages(); }, []);

    const handleNew = () => setEditingPage({ ...emptyForm });

    const handleEdit = (page: PageDto) => {
        setEditingPage({ id: page.id, titre: page.titre, contenu: page.contenu ?? '', estActif: page.estActif });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPage) return;
        setSaving(true);
        setError('');
        try {
            if (editingPage.id) {
                await pageService.updatePage(editingPage.id, editingPage);
                setSuccessMsg('Page modifiée avec succès.');
            } else {
                await pageService.createPage(editingPage);
                setSuccessMsg('Page créée avec succès.');
            }
            setEditingPage(null);
            fetchPages();
        } catch {
            setError('Erreur lors de la sauvegarde.');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async (page: PageDto) => {
        try {
            await pageService.updatePage(page.id, { ...page, estActif: !page.estActif });
            setSuccessMsg(`Page "${page.titre}" ${page.estActif ? 'désactivée' : 'activée'}.`);
            fetchPages();
        } catch {
            setError('Erreur lors de la modification.');
        }
    };

    const tableData = pages.map(page => [
        page.titre,
        <code key={page.id + '-slug'} className="fr-text--sm">{page.slug}</code>,
        <Badge key={page.id + '-status'} severity={page.estActif ? 'success' : 'error'} small>
            {page.estActif ? 'Active' : 'Inactive'}
        </Badge>,
        <div key={page.id + '-actions'} style={{ display: 'flex', gap: '0.5rem' }}>
            <Button size="small" priority="secondary" iconId="fr-icon-edit-line" onClick={() => handleEdit(page)}>
                Modifier
            </Button>
            <Button
                size="small"
                priority="tertiary"
                iconId={page.estActif ? 'fr-icon-eye-off-line' : 'fr-icon-eye-line'}
                onClick={() => handleToggleActive(page)}
            >
                {page.estActif ? 'Désactiver' : 'Activer'}
            </Button>
        </div>,
    ]);

    return (
        <main role="main" id="content">
            <div className="fr-container fr-my-4w">
                <Breadcrumb
                    currentPageLabel="Pages d'information"
                    homeLinkProps={{ href: "/" }}
                    segments={[{ label: "Administration", linkProps: { href: "/admin" } }]}
                />

                <div className="fr-grid-row fr-grid-row--middle fr-mb-4w">
                    <div className="fr-col">
                        <h1 className="fr-h2">Pages d'information</h1>
                    </div>
                    <div className="fr-col-auto">
                        <Button onClick={handleNew} iconId="fr-icon-add-circle-line">
                            Nouvelle page
                        </Button>
                    </div>
                </div>

                {successMsg && (
                    <Alert severity="success" title="Succès" description={successMsg} className="fr-mb-3w" small
                        closable onClose={() => setSuccessMsg('')} />
                )}
                {error && (
                    <Alert severity="error" title="Erreur" description={error} className="fr-mb-3w" small
                        closable onClose={() => setError('')} />
                )}

                {/* Formulaire de création/modification */}
                {editingPage && (
                    <div className="fr-card fr-card--shadow fr-p-4w fr-mb-4w">
                        <h2 className="fr-h4">{editingPage.id ? 'Modifier la page' : 'Nouvelle page'}</h2>
                        <form onSubmit={handleSave}>
                            <Input
                                label="Titre"
                                nativeInputProps={{
                                    value: editingPage.titre,
                                    required: true,
                                    onChange: (e) => setEditingPage({ ...editingPage, titre: e.target.value }),
                                }}
                            />
                            <div className="fr-input-group fr-mt-2w">
                                <label className="fr-label">Contenu</label>
                                <textarea
                                    className="fr-input"
                                    rows={10}
                                    value={editingPage.contenu}
                                    onChange={(e) => setEditingPage({ ...editingPage, contenu: e.target.value })}
                                    style={{ height: 'auto' }}
                                />
                                <span className="fr-hint-text">Vous pouvez utiliser du HTML simple pour la mise en forme.</span>
                            </div>
                            <div className="fr-checkbox-group fr-mt-2w">
                                <input
                                    type="checkbox"
                                    id="page-active"
                                    className="fr-checkbox"
                                    checked={editingPage.estActif}
                                    onChange={(e) => setEditingPage({ ...editingPage, estActif: e.target.checked })}
                                />
                                <label className="fr-label" htmlFor="page-active">Page active (visible par les utilisateurs)</label>
                            </div>
                            <div className="fr-btns-group fr-btns-group--inline fr-mt-3w">
                                <Button type="submit" disabled={saving} iconId="fr-icon-save-line">
                                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                                </Button>
                                <Button
                                    type="button"
                                    priority="secondary"
                                    onClick={() => setEditingPage(null)}
                                    iconId="fr-icon-close-line"
                                >
                                    Annuler
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Tableau des pages */}
                {loading ? (
                    <div className="fr-my-4w" style={{ textAlign: 'center' }}>
                        <span>Chargement...</span>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <Table
                            caption="Liste des pages d'information"
                            headers={['Titre', 'Slug', 'Statut', 'Actions']}
                            data={tableData}
                        />
                    </div>
                )}
            </div>
        </main>
    );
}


