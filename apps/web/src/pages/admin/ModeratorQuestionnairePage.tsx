import { useEffect, useState } from 'react';
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { moderatorService, type QuestionRequestDto } from '../../api/moderatorService';
import type { QuestionnaireDto, QuestionDto } from '../../types/diagnostic';

const QUESTIONNAIRE_ID = 1;

// Les 5 niveaux de réponse du PSS-10
const STRESS_OPTIONS = [
    { key: 'jamais'        as const, libelle: 'Jamais',          abbrev: 'J'  },
    { key: 'presqueJamais' as const, libelle: 'Presque jamais',  abbrev: 'PJ' },
    { key: 'parfois'       as const, libelle: 'Parfois',         abbrev: 'P'  },
    { key: 'assezSouvent'  as const, libelle: 'Assez souvent',   abbrev: 'AS' },
    { key: 'tresSouvent'   as const, libelle: 'Très souvent',    abbrev: 'TS' },
] as const;

type OptionsMap = {
    jamais: string; presqueJamais: string; parfois: string;
    assezSouvent: string; tresSouvent: string;
};

// Par défaut : question directe (0→4)
const DEFAULT_OPTIONS: OptionsMap = { jamais: '0', presqueJamais: '1', parfois: '2', assezSouvent: '3', tresSouvent: '4' };
const EMPTY_OPTIONS:   OptionsMap = { jamais: '0', presqueJamais: '0', parfois: '0', assezSouvent: '0', tresSouvent: '0' };

function libelleToKey(libelle: string): keyof OptionsMap | null {
    switch (libelle) {
        case 'Jamais':         return 'jamais';
        case 'Presque jamais': return 'presqueJamais';
        case 'Parfois':        return 'parfois';
        case 'Assez souvent':  return 'assezSouvent';
        case 'Très souvent':   return 'tresSouvent';
        default:               return null;
    }
}

export default function ModeratorQuestionnairePage() {
    const [questionnaire, setQuestionnaire] = useState<QuestionnaireDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Formulaire nouvelle question
    const [newLibelle, setNewLibelle] = useState('');
    const [newOptions, setNewOptions] = useState<OptionsMap>(DEFAULT_OPTIONS);
    const [submitting, setSubmitting] = useState(false);

    // Edition inline
    const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
    const [editLibelle, setEditLibelle] = useState('');
    const [editOptions, setEditOptions] = useState<OptionsMap>(EMPTY_OPTIONS);

    const load = async () => {
        try {
            setLoading(true);
            const data = await moderatorService.getQuestionnaire(QUESTIONNAIRE_ID);
            setQuestionnaire(data);
        } catch {
            setError('Impossible de charger le questionnaire.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newLibelle.trim()) return;
        setSubmitting(true);
        setError(null);
        setSuccess(null);
        try {
            const payload: QuestionRequestDto = {
                libelle: newLibelle.trim(),
                options: STRESS_OPTIONS.map(opt => ({
                    libelle: opt.libelle,
                    points: parseInt(newOptions[opt.key]) || 0,
                })),
            };
            await moderatorService.createQuestion(QUESTIONNAIRE_ID, payload);
            setSuccess('Question ajoutée avec succès.');
            setNewLibelle('');
            setNewOptions(DEFAULT_OPTIONS);
            await load();
        } catch {
            setError("Erreur lors de l'ajout de la question.");
        } finally {
            setSubmitting(false);
        }
    };

    const startEdit = (q: QuestionDto) => {
        setEditingQuestion(q.id);
        setEditLibelle(q.libelle);
        const opts: OptionsMap = { ...EMPTY_OPTIONS };
        for (const opt of q.options) {
            const key = libelleToKey(opt.libelle);
            if (key) opts[key] = String(opt.points);
        }
        setEditOptions(opts);
    };

    const handleUpdate = async (q: QuestionDto) => {
        setError(null);
        setSuccess(null);
        try {
            await moderatorService.updateQuestion(q.id, { libelle: editLibelle });
            // Mise à jour individuelle de chaque option par son ID
            for (const opt of q.options) {
                const key = libelleToKey(opt.libelle);
                if (key !== null) {
                    await moderatorService.updateOption(opt.id, { points: parseInt(editOptions[key]) || 0 });
                }
            }
            setSuccess('Question mise à jour.');
            setEditingQuestion(null);
            await load();
        } catch {
            setError('Erreur lors de la mise à jour.');
        }
    };

    const handleDelete = async (questionId: number) => {
        if (!confirm('Supprimer cette question définitivement ?')) return;
        setError(null);
        setSuccess(null);
        try {
            await moderatorService.deleteQuestion(questionId);
            setSuccess('Question supprimée.');
            await load();
        } catch {
            setError('Erreur lors de la suppression.');
        }
    };

    return (
        <main role="main" id="content">
            <div className="fr-container fr-my-4w">
                <Breadcrumb
                    currentPageLabel="Questionnaire diagnostic"
                    homeLinkProps={{ href: "/" }}
                    segments={[{ label: "Administration", linkProps: { href: "/admin" } }]}
                />

                <div className="fr-grid-row fr-grid-row--middle fr-mb-4w">
                    <div className="fr-col">
                        <h1 className="fr-h2">Questionnaire de stress (PSS-10)</h1>
                        <p className="fr-text--lead">
                            Configurez les questions et les points associés à chaque niveau de réponse.
                        </p>
                    </div>
                </div>

                {error && (
                    <Alert severity="error" title="Erreur" description={error} className="fr-mb-3w" closable onClose={() => setError(null)} />
                )}
                {success && (
                    <Alert severity="success" title="Succès" description={success} className="fr-mb-3w" closable onClose={() => setSuccess(null)} />
                )}

                {/* ── Formulaire ajout ─────────────────────────── */}
                <div className="fr-card fr-card--shadow fr-mb-4w">
                    <div className="fr-card__body">
                        <div className="fr-card__content">
                            <h2 className="fr-h5">Ajouter une question</h2>
                            <form onSubmit={handleCreate}>
                                <Input
                                    label="Libellé de la question"
                                    nativeInputProps={{
                                        value: newLibelle,
                                        onChange: e => setNewLibelle(e.target.value),
                                        placeholder: 'Ex : Au cours du dernier mois, à quelle fréquence...',
                                        required: true,
                                    }}
                                />
                                <p className="fr-label fr-mb-1w">Points par niveau de réponse</p>
                                <div className="fr-grid-row fr-grid-row--gutters fr-grid-row--middle fr-mb-2w">
                                    {STRESS_OPTIONS.map(opt => (
                                        <div key={opt.key} className="fr-col-6 fr-col-md-2">
                                            <label className="fr-label" style={{ fontSize: '0.85rem' }}>
                                                {opt.libelle}
                                            </label>
                                            <input
                                                className="fr-input"
                                                type="number"
                                                value={newOptions[opt.key]}
                                                onChange={e => setNewOptions(prev => ({ ...prev, [opt.key]: e.target.value }))}
                                                min={0}
                                                max={9999}
                                            />
                                        </div>
                                    ))}
                                    <div className="fr-col-12 fr-col-md-2" style={{ paddingTop: '1.5rem' }}>
                                        <Button type="submit" disabled={submitting} iconId="fr-icon-add-line">
                                            Ajouter
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* ── Liste des questions ─────────────────────── */}
                <h2 className="fr-h5 fr-mb-2w">
                    Questions du questionnaire
                    {questionnaire && <span className="fr-badge fr-badge--info fr-ml-2w">{questionnaire.questions.length} question(s)</span>}
                </h2>

                {loading ? (
                    <p>Chargement...</p>
                ) : questionnaire && questionnaire.questions.length === 0 ? (
                    <p className="fr-text--sm fr-hint-text">Aucune question pour le moment.</p>
                ) : (
                    <div className="fr-table fr-table--bordered" style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                    <th scope="col" style={{ width: '50px' }}>#</th>
                                    <th scope="col">Question</th>
                                    <th scope="col" style={{ width: '340px' }}>Points par réponse</th>
                                    <th scope="col" style={{ width: '160px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {questionnaire?.questions.map((q) => {
                                    const isEditing = editingQuestion === q.id;
                                    return (
                                        <tr key={q.id}>
                                            <td>{q.ordre}</td>
                                            <td>
                                                {isEditing ? (
                                                    <input
                                                        className="fr-input"
                                                        value={editLibelle}
                                                        onChange={e => setEditLibelle(e.target.value)}
                                                        style={{ width: '100%' }}
                                                    />
                                                ) : q.libelle}
                                            </td>
                                            <td>
                                                {isEditing ? (
                                                    /* 5 inputs en mode édition */
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                        {STRESS_OPTIONS.map(opt => (
                                                            <div key={opt.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem' }}>
                                                                <label style={{ fontSize: '0.72rem', color: 'var(--text-mention-grey)', whiteSpace: 'nowrap' }}>
                                                                    {opt.libelle}
                                                                </label>
                                                                <input
                                                                    className="fr-input"
                                                                    type="number"
                                                                    value={editOptions[opt.key]}
                                                                    onChange={e => setEditOptions(prev => ({ ...prev, [opt.key]: e.target.value }))}
                                                                    style={{ width: '58px', textAlign: 'center' }}
                                                                    min={0}
                                                                    max={9999}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    /* 5 badges en lecture seule */
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                                                        {STRESS_OPTIONS.map(opt => {
                                                            const found = q.options.find(o => o.libelle === opt.libelle);
                                                            return (
                                                                <span
                                                                    key={opt.key}
                                                                    className="fr-badge fr-badge--blue-cumulus"
                                                                    title={opt.libelle}
                                                                    style={{ fontSize: '0.75rem' }}
                                                                >
                                                                    {opt.abbrev} : {found?.points ?? '–'}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                {isEditing ? (
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <Button
                                                            size="small"
                                                            iconId="fr-icon-check-line"
                                                            onClick={() => handleUpdate(q)}
                                                            title="Valider"
                                                        >
                                                            OK
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            priority="secondary"
                                                            iconId="fr-icon-close-line"
                                                            onClick={() => setEditingQuestion(null)}
                                                            title="Annuler"
                                                        >
                                                            Annuler
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <Button
                                                            size="small"
                                                            priority="secondary"
                                                            iconId="fr-icon-edit-line"
                                                            onClick={() => startEdit(q)}
                                                            title="Modifier"
                                                        >
                                                            Modifier
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            priority="tertiary no outline"
                                                            iconId="fr-icon-delete-line"
                                                            onClick={() => handleDelete(q.id)}
                                                            title="Supprimer"
                                                            style={{ color: 'var(--text-default-error)' }}
                                                        >
                                                            Supprimer
                                                        </Button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    );
}

