import { useEffect, useState } from 'react';
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { moderatorService, type QuestionRequestDto } from '../../api/moderatorService';
import type { QuestionnaireDto, QuestionDto } from '../../types/diagnostic';

const QUESTIONNAIRE_ID = 1;

export default function ModeratorQuestionnairePage() {
    const [questionnaire, setQuestionnaire] = useState<QuestionnaireDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Formulaire nouvelle question
    const [newLibelle, setNewLibelle] = useState('');
    const [newPoints, setNewPoints] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Edition inline
    const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
    const [editLibelle, setEditLibelle] = useState('');
    const [editPoints, setEditPoints] = useState('');

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
        if (!newLibelle.trim() || !newPoints.trim()) return;
        setSubmitting(true);
        setError(null);
        setSuccess(null);
        try {
            const payload: QuestionRequestDto = {
                libelle: newLibelle.trim(),
                options: [
                    { libelle: 'Oui', points: parseInt(newPoints) },
                    { libelle: 'Non', points: 0 },
                ],
            };
            await moderatorService.createQuestion(QUESTIONNAIRE_ID, payload);
            setSuccess('Événement ajouté avec succès.');
            setNewLibelle('');
            setNewPoints('');
            await load();
        } catch {
            setError("Erreur lors de l'ajout de l'événement.");
        } finally {
            setSubmitting(false);
        }
    };

    const startEdit = (q: QuestionDto) => {
        setEditingQuestion(q.id);
        setEditLibelle(q.libelle);
        const ouiOption = q.options.find(o => o.libelle === 'Oui');
        setEditPoints(ouiOption ? String(ouiOption.points) : String(q.options[0]?.points ?? ''));
    };

    const handleUpdate = async (q: QuestionDto) => {
        setError(null);
        setSuccess(null);
        try {
            const ouiOption = q.options.find(o => o.libelle === 'Oui') ?? q.options[0];
            await moderatorService.updateQuestion(q.id, { libelle: editLibelle });
            if (ouiOption) {
                await moderatorService.updateOption(ouiOption.id, { points: parseInt(editPoints) });
            }
            setSuccess('Événement mis à jour.');
            setEditingQuestion(null);
            await load();
        } catch {
            setError('Erreur lors de la mise à jour.');
        }
    };

    const handleDelete = async (questionId: number) => {
        if (!confirm('Supprimer cet événement définitivement ?')) return;
        setError(null);
        setSuccess(null);
        try {
            await moderatorService.deleteQuestion(questionId);
            setSuccess('Événement supprimé.');
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
                        <h1 className="fr-h2">Questionnaire de stress</h1>
                        <p className="fr-text--lead">
                            Configurez les événements et leurs points associés (échelle Holmes &amp; Rahe).
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
                            <h2 className="fr-h5">Ajouter un événement</h2>
                            <form onSubmit={handleCreate}>
                                <div className="fr-grid-row fr-grid-row--gutters fr-grid-row--middle">
                                    <div className="fr-col-12 fr-col-md-7">
                                        <Input
                                            label="Libellé de l'événement"
                                            nativeInputProps={{
                                                value: newLibelle,
                                                onChange: e => setNewLibelle(e.target.value),
                                                placeholder: 'Ex : Décès d\'un conjoint',
                                                required: true,
                                            }}
                                        />
                                    </div>
                                    <div className="fr-col-12 fr-col-md-3">
                                        <Input
                                            label="Points associés"
                                            nativeInputProps={{
                                                type: 'number',
                                                value: newPoints,
                                                onChange: e => setNewPoints(e.target.value),
                                                min: 0,
                                                max: 9999,
                                                placeholder: 'Ex : 100',
                                                required: true,
                                            }}
                                        />
                                    </div>
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

                {/* ── Liste des événements ─────────────────────── */}
                <h2 className="fr-h5 fr-mb-2w">
                    Événements du questionnaire
                    {questionnaire && <span className="fr-badge fr-badge--info fr-ml-2w">{questionnaire.questions.length} événement(s)</span>}
                </h2>

                {loading ? (
                    <p>Chargement...</p>
                ) : questionnaire && questionnaire.questions.length === 0 ? (
                    <p className="fr-text--sm fr-hint-text">Aucun événement pour le moment.</p>
                ) : (
                    <div className="fr-table fr-table--bordered" style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                    <th scope="col" style={{ width: '50px' }}>#</th>
                                    <th scope="col">Événement</th>
                                    <th scope="col" style={{ width: '130px' }}>Points</th>
                                    <th scope="col" style={{ width: '160px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {questionnaire?.questions.map((q) => {
                                    const ouiOption = q.options.find(o => o.libelle === 'Oui') ?? q.options[0];
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
                                                    <input
                                                        className="fr-input"
                                                        type="number"
                                                        value={editPoints}
                                                        onChange={e => setEditPoints(e.target.value)}
                                                        style={{ width: '90px' }}
                                                        min={0}
                                                    />
                                                ) : (
                                                    <span className="fr-badge fr-badge--blue-cumulus">{ouiOption?.points ?? '–'} pts</span>
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

