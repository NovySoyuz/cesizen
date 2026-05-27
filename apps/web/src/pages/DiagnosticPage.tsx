import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { diagnosticService } from '../api/diagnosticService';
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import type { QuestionnaireDto, DiagnosticResponse, OptionReponseDto } from '../types/diagnostic';
import { useAuth } from '../context/AuthContext';

const QUESTIONNAIRE_ID = 1;

function getBadgeSeverity(niveau: string): 'success' | 'warning' | 'error' | 'info' {
    const n = (niveau ?? '').toLowerCase();
    if (n.includes('faible')) return 'success';
    if (n.includes('modéré')) return 'warning';
    return 'error';
}

// ─── Carte d'option cliquable ────────────────────────────────────
function OptionCard({
    option,
    selected,
    onClick,
}: {
    option: OptionReponseDto;
    selected: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                width: '100%',
                textAlign: 'left',
                padding: '0.6rem 1rem',
                marginBottom: '0.4rem',
                border: selected
                    ? '2px solid var(--blue-france-sun-113-625)'
                    : '1px solid var(--border-default-grey)',
                borderRadius: '4px',
                background: selected ? 'var(--blue-france-950-100)' : 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                transition: 'all 0.15s ease',
                fontFamily: 'inherit',
                fontSize: '0.9375rem',
                color: selected ? 'var(--blue-france-sun-113-625)' : 'var(--text-title-grey)',
            }}
        >
            <span
                style={{
                    width: '16px',
                    height: '16px',
                    minWidth: '16px',
                    borderRadius: '50%',
                    border: selected
                        ? '5px solid var(--blue-france-sun-113-625)'
                        : '2px solid var(--border-default-grey)',
                    background: 'white',
                    display: 'inline-block',
                    transition: 'all 0.15s ease',
                }}
            />
            <span style={{ fontWeight: selected ? 600 : 400 }}>{option.libelle}</span>
        </button>
    );
}

export default function DiagnosticPage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [questionnaire, setQuestionnaire] = useState<QuestionnaireDto | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [result, setResult] = useState<DiagnosticResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [started, setStarted] = useState(false);

    useEffect(() => {
        diagnosticService.getQuestionnaire(QUESTIONNAIRE_ID)
            .then(setQuestionnaire)
            .catch(() => setError('Impossible de charger le questionnaire. Vérifiez que le serveur est démarré.'))
            .finally(() => setLoading(false));
    }, []);

    const sortedQuestions = questionnaire?.questions
        ? [...questionnaire.questions].sort((a, b) => a.ordre - b.ordre)
        : [];

    const totalSteps = sortedQuestions.length;
    const currentQuestion = sortedQuestions[currentStep];
    const isLastStep = currentStep === totalSteps - 1;
    const hasAnsweredCurrent = currentQuestion && answers[currentQuestion.id] !== undefined;
    // Le compteur suit la position actuelle (revient en arrière avec Précédent)
    const answeredCount = currentStep;

    const handleAnswer = (questionId: number, optionId: number) => {
        const newAnswers = { ...answers, [questionId]: optionId };
        setAnswers(newAnswers);
        // Auto-avance après sélection si pas la dernière question
        if (!isLastStep) {
            setTimeout(() => setCurrentStep(s => s + 1), 350);
        }
    };

    const handleSubmit = async () => {
        if (!questionnaire) return;
        setSubmitting(true);
        setError('');
        try {
            const optionIds = sortedQuestions.map(q => answers[q.id]).filter(Boolean);
            const response = await diagnosticService.submitDiagnostic({
                questionnaireId: questionnaire.id,
                optionIds,
            });
            setResult(response);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch {
            setError('Erreur lors de la soumission. Veuillez réessayer.');
        } finally {
            setSubmitting(false);
        }
    };

    const resetDiagnostic = () => {
        setResult(null);
        setCurrentStep(0);
        setAnswers({});
        setStarted(false);
    };

    // ── Chargement ────────────────────────────────────────────────
    if (loading) {
        return (
            <main role="main" id="content">
                <div className="fr-container fr-my-6w" style={{ textAlign: 'center' }}>
                    <span className="fr-text--lg">Chargement du questionnaire...</span>
                </div>
            </main>
        );
    }

    if (error && !questionnaire) {
        return (
            <main role="main" id="content">
                <div className="fr-container fr-my-4w">
                    <Alert severity="error" title="Questionnaire indisponible" description={error} />
                </div>
            </main>
        );
    }

    // ── Résultat intégré dans la même card ────────────────────────
    if (result) {
        const severity = getBadgeSeverity(result.niveauStress);
        const colorMap = {
            success: 'var(--success-425-625)',
            warning: 'var(--warning-425-625)',
            error:   'var(--error-425-625)',
            info:    'var(--info-425-625)',
        };
        const resultColor = colorMap[severity];

        return (
            <main role="main" id="content" style={{ position: 'relative', zIndex: 1 }}>
                <div className="fr-container fr-mt-4w" style={{ paddingBottom: '8rem' }}>
                    <div className="fr-grid-row fr-grid-row--center">
                        <div className="fr-col-12 fr-col-md-9 fr-col-lg-7">

                            {/* Même structure de card que le questionnaire */}
                            <div className="fr-card fr-card--shadow" style={{ overflow: 'hidden' }}>

                                {/* Corps du résultat */}
                                <div style={{ padding: '2rem 1.5rem 1.5rem', textAlign: 'center' }}>

                                    {/* Icône + score */}
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <div style={{
                                            fontSize: '3rem',
                                            marginBottom: '0.75rem',
                                            lineHeight: 1,
                                        }}>
                                            {severity === 'success' ? '✅' : severity === 'warning' ? '⚠️' : '🔴'}
                                        </div>
                                        <div style={{
                                            fontSize: '2.5rem',
                                            fontWeight: 700,
                                            color: resultColor,
                                            lineHeight: 1.1,
                                        }}>
                                            {result.scoreTotal} <span style={{ fontSize: '1.25rem', fontWeight: 400, color: 'var(--text-mention-grey)' }}>/ 40</span>
                                        </div>
                                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-mention-grey)' }}>
                                            Score PSS-10
                                        </p>
                                    </div>

                                    {/* Badge niveau */}
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <Badge severity={severity}>
                                            {result.niveauStress}
                                        </Badge>
                                    </div>

                                    {/* Message interprétation */}
                                    <div style={{
                                        background: 'var(--background-alt-grey)',
                                        borderLeft: `4px solid ${resultColor}`,
                                        borderRadius: '4px',
                                        padding: '1rem 1.25rem',
                                        textAlign: 'left',
                                        marginBottom: '1.25rem',
                                    }}>
                                        <p style={{ margin: 0, fontSize: '0.9375rem', lineHeight: '1.6', color: 'var(--text-title-grey)' }}>
                                            {result.messageResultat}
                                        </p>
                                    </div>

                                    {/* Invite connexion */}
                                    {!isAuthenticated && (
                                        <Alert
                                            severity="info"
                                            title="Suivez votre évolution"
                                            description="Créez un compte pour sauvegarder ce résultat."
                                            small
                                        />
                                    )}
                                </div>

                                {/* Pied de card : actions */}
                                <div style={{
                                    borderTop: '1px solid var(--border-default-grey)',
                                    padding: '0.75rem 1.5rem',
                                    display: 'flex',
                                    gap: '0.75rem',
                                    flexWrap: 'wrap',
                                    background: 'var(--background-alt-grey)',
                                }}>
                                    <button
                                        type="button"
                                        onClick={resetDiagnostic}
                                        style={{
                                            flex: 1,
                                            minWidth: '120px',
                                            padding: '0.5rem 1rem',
                                            border: '1px solid var(--blue-france-sun-113-625)',
                                            background: 'white',
                                            color: 'var(--blue-france-sun-113-625)',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem',
                                            fontWeight: 500,
                                            fontFamily: 'inherit',
                                        }}
                                    >
                                        ↺ Refaire le test
                                    </button>
                                    {isAuthenticated ? (
                                        <button
                                            type="button"
                                            onClick={() => navigate('/diagnostic/historique')}
                                            style={{
                                                flex: 1,
                                                minWidth: '120px',
                                                padding: '0.5rem 1rem',
                                                border: 'none',
                                                background: 'var(--blue-france-sun-113-625)',
                                                color: 'white',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                fontWeight: 500,
                                                fontFamily: 'inherit',
                                            }}
                                        >
                                            Mon historique
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => navigate('/inscription')}
                                            style={{
                                                flex: 1,
                                                minWidth: '120px',
                                                padding: '0.5rem 1rem',
                                                border: 'none',
                                                background: 'var(--blue-france-sun-113-625)',
                                                color: 'white',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                fontWeight: 500,
                                                fontFamily: 'inherit',
                                            }}
                                        >
                                            Créer un compte
                                        </button>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </main>
        );
    }

    // ── Écran d'introduction ──────────────────────────────────────
    if (!started) {
        return (
            <main role="main" id="content" style={{ position: 'relative', zIndex: 1 }}>
                <div className="fr-container fr-mt-4w fr-pb-8w">
                    <Breadcrumb
                        currentPageLabel="Diagnostic de stress"
                        homeLinkProps={{ href: "/" }}
                        segments={[]}
                    />
                    <div className="fr-grid-row fr-grid-row--center">
                        <div className="fr-col-12 fr-col-md-8 fr-col-lg-7">
                            <div className="fr-card fr-card--shadow fr-p-4w">
                                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                    <span className="fr-icon-heart-pulse-fill fr-icon--lg" aria-hidden="true"
                                        style={{ fontSize: '3rem', color: 'var(--blue-france-sun-113-625)', display: 'block', marginBottom: '0.75rem' }} />
                                    <h1 className="fr-h2">{questionnaire?.titre}</h1>
                                </div>

                                <p className="fr-text--lead fr-mb-3w" style={{ textAlign: 'center' }}>
                                    {questionnaire?.description}
                                </p>

                                {/* Infos pratiques */}
                                <div className="fr-grid-row fr-grid-row--gutters fr-mb-4w">
                                    <div className="fr-col-4" style={{ textAlign: 'center' }}>
                                        <span className="fr-icon-question-fill" aria-hidden="true"
                                            style={{ fontSize: '1.5rem', color: 'var(--blue-france-sun-113-625)' }} />
                                        <p className="fr-text--sm fr-mb-0"><strong>{totalSteps}</strong><br />questions</p>
                                    </div>
                                    <div className="fr-col-4" style={{ textAlign: 'center' }}>
                                        <span className="fr-icon-time-fill" aria-hidden="true"
                                            style={{ fontSize: '1.5rem', color: 'var(--blue-france-sun-113-625)' }} />
                                        <p className="fr-text--sm fr-mb-0"><strong>~3 min</strong><br />durée estimée</p>
                                    </div>
                                    <div className="fr-col-4" style={{ textAlign: 'center' }}>
                                        <span className="fr-icon-lock-fill" aria-hidden="true"
                                            style={{ fontSize: '1.5rem', color: 'var(--blue-france-sun-113-625)' }} />
                                        <p className="fr-text--sm fr-mb-0"><strong>Anonyme</strong><br />sans inscription</p>
                                    </div>
                                </div>

                                <div className="fr-notice fr-notice--info fr-mb-3w">
                                    <div className="fr-notice__body">
                                        <p className="fr-notice__title">Ce test ne remplace pas un avis médical.</p>
                                    </div>
                                </div>

                                <div style={{ textAlign: 'center' }}>
                                    <Button
                                        onClick={() => setStarted(true)}
                                        iconId="fr-icon-arrow-right-line"
                                        iconPosition="right"
                                        size="large"
                                    >
                                        Commencer le questionnaire
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    // ── Questionnaire ─────────────────────────────────────────────
    return (
        <main role="main" id="content" style={{ position: 'relative', zIndex: 1 }}>
            <div className="fr-container fr-mt-4w" style={{ paddingBottom: '8rem' }}>
                <div className="fr-grid-row fr-grid-row--center">
                    <div className="fr-col-12 fr-col-md-9 fr-col-lg-7">

                        {/* Bouton Abandonner en haut */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <button
                                type="button"
                                onClick={resetDiagnostic}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-mention-grey)',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    fontFamily: 'inherit',
                                    padding: '0.25rem 0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    textDecoration: 'underline',
                                    textUnderlineOffset: '3px',
                                }}
                            >
                                ✕ Abandonner le questionnaire
                            </button>
                        </div>

                        {/* Stepper DSFR */}
                        <Stepper
                            currentStep={currentStep + 1}
                            stepCount={totalSteps}
                            title={`Question ${currentStep + 1} sur ${totalSteps}`}
                            nextTitle={!isLastStep ? sortedQuestions[currentStep + 1]?.libelle?.substring(0, 70) + '...' : undefined}
                            className="fr-mb-3w"
                        />

                        {/* Barre de progression */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{
                                background: 'var(--border-default-grey)',
                                borderRadius: '4px',
                                height: '8px',
                                overflow: 'hidden',
                                marginBottom: '0.5rem',
                            }}>
                                <div style={{
                                    height: '100%',
                                    width: `${(answeredCount / totalSteps) * 100}%`,
                                    background: 'var(--blue-france-sun-113-625)',
                                    transition: 'width 0.3s ease',
                                    borderRadius: '4px',
                                }} />
                            </div>
                            <p style={{ margin: 0, textAlign: 'right', fontSize: '0.875rem', color: 'var(--text-mention-grey)' }}>
                                {answeredCount} / {totalSteps} questions répondues
                            </p>
                        </div>

                        {/* Carte de la question + bouton Précédent intégré en bas */}
                        {currentQuestion && (
                            <div className="fr-card fr-card--shadow" style={{
                                marginBottom: '1.5rem',
                                overflow: 'hidden',
                            }}>
                                {/* Corps de la question */}
                                <div style={{ padding: '1.5rem 1.5rem 1rem' }}>
                                    <p style={{
                                        fontWeight: 600,
                                        color: 'var(--text-title-grey)',
                                        lineHeight: '1.6',
                                        fontSize: '1rem',
                                        marginBottom: '1rem',
                                        marginTop: 0,
                                    }}>
                                        {currentQuestion.libelle}
                                    </p>

                                    <div>
                                        {currentQuestion.options
                                            .sort((a, b) => a.id - b.id)
                                            .map((option) => (
                                                <OptionCard
                                                    key={option.id}
                                                    option={option}
                                                    selected={answers[currentQuestion.id] === option.id}
                                                    onClick={() => handleAnswer(currentQuestion.id, option.id)}
                                                />
                                            ))}
                                    </div>
                                </div>

                                {/* Pied de carte : Précédent (+ Voir résultats sur dernière question) */}
                                <div style={{
                                    borderTop: '1px solid var(--border-default-grey)',
                                    padding: '0.75rem 1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: isLastStep ? 'space-between' : 'flex-start',
                                    gap: '1rem',
                                    background: 'var(--background-alt-grey)',
                                }}>
                                    {/* Bouton Précédent */}
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(s => s - 1)}
                                        disabled={currentStep === 0}
                                        style={{
                                            padding: '0.5rem 1.25rem',
                                            border: `1px solid ${currentStep === 0 ? 'var(--border-default-grey)' : 'var(--blue-france-sun-113-625)'}`,
                                            background: 'white',
                                            color: currentStep === 0 ? 'var(--text-disabled-grey)' : 'var(--blue-france-sun-113-625)',
                                            borderRadius: '4px',
                                            cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                                            fontSize: '0.9rem',
                                            fontWeight: 500,
                                            fontFamily: 'inherit',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.4rem',
                                            userSelect: 'none',
                                        }}
                                    >
                                        ← Précédent
                                    </button>

                                    {/* Bouton Voir mes résultats (dernière question uniquement) */}
                                    {isLastStep && (
                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            disabled={!hasAnsweredCurrent || submitting}
                                            style={{
                                                padding: '0.5rem 1.25rem',
                                                border: 'none',
                                                background: (!hasAnsweredCurrent || submitting)
                                                    ? 'var(--border-default-grey)'
                                                    : 'var(--blue-france-sun-113-625)',
                                                color: 'white',
                                                borderRadius: '4px',
                                                cursor: (!hasAnsweredCurrent || submitting) ? 'not-allowed' : 'pointer',
                                                fontSize: '0.9rem',
                                                fontWeight: 500,
                                                fontFamily: 'inherit',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.4rem',
                                                userSelect: 'none',
                                            }}
                                        >
                                            {submitting ? 'Calcul...' : 'Voir mes résultats ✓'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {error && (
                            <Alert severity="error" title="Erreur" description={error} className="fr-mb-3w" small />
                        )}

                    </div>
                </div>
            </div>
        </main>
    );
}

















