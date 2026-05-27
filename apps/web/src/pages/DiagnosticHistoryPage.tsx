import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { diagnosticService } from '../api/diagnosticService';
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import type { DiagnosticResponse } from '../types/diagnostic';
import {
    ResponsiveContainer,
    ComposedChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceArea,
    ReferenceLine,
} from 'recharts';

// ─── Helpers ─────────────────────────────────────────────────────
function getBadgeSeverity(niveau: string): 'success' | 'warning' | 'error' | 'info' {
    if (!niveau) return 'info';
    const n = niveau.toLowerCase();
    if (n.includes('faible')) return 'success';
    if (n.includes('modéré')) return 'warning';
    return 'error';
}

function getScoreColor(score: number) {
    if (score <= 13) return '#18753c'; // vert - faible
    if (score <= 26) return '#b34000'; // orange - modéré
    return '#ce0500';                  // rouge - élevé
}

function formatDateShort(dateStr: string) {
    try {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit', month: '2-digit', year: '2-digit',
        });
    } catch { return dateStr; }
}

function formatDateFull(dateStr: string) {
    try {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    } catch { return dateStr; }
}

// ─── Tooltip personnalisé ────────────────────────────────────────
function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{payload: ChartPoint}> }) {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div style={{
            background: 'white',
            border: '1px solid var(--border-default-grey)',
            borderRadius: '4px',
            padding: '0.75rem 1rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            fontSize: '0.875rem',
        }}>
            <p style={{ margin: '0 0 0.25rem', color: 'var(--text-mention-grey)', fontSize: '0.8rem' }}>
                {d.dateFull}
            </p>
            <p style={{ margin: '0 0 0.25rem', fontWeight: 700, fontSize: '1.25rem', color: d.color }}>
                {d.score} <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>/ 40</span>
            </p>
            <p style={{ margin: 0, fontWeight: 500, color: d.color }}>
                {d.niveau}
            </p>
        </div>
    );
}

interface ChartPoint {
    date: string;
    dateFull: string;
    score: number;
    niveau: string;
    color: string;
    index: number;
}

// ─── Point coloré sur le graphique ──────────────────────────────
function ColoredDot(props: {cx?: number; cy?: number; payload?: ChartPoint}) {
    const { cx, cy, payload } = props;
    if (!cx || !cy || !payload) return null;
    return (
        <circle
            cx={cx} cy={cy} r={5}
            fill={payload.color}
            stroke="white"
            strokeWidth={2}
        />
    );
}

export default function DiagnosticHistoryPage() {
    const navigate = useNavigate();
    const [diagnostics, setDiagnostics] = useState<DiagnosticResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        diagnosticService.getMyDiagnostics()
            .then(data => setDiagnostics(
                data.sort((a, b) => new Date(b.dateRealisation).getTime() - new Date(a.dateRealisation).getTime())
            ))
            .catch(() => setError('Impossible de charger votre historique.'))
            .finally(() => setLoading(false));
    }, []);

    // Données triées chronologiquement pour le graphique (ordre croissant)
    const chartData: ChartPoint[] = [...diagnostics]
        .reverse()
        .map((d, i) => ({
            date: formatDateShort(d.dateRealisation),
            dateFull: formatDateFull(d.dateRealisation),
            score: d.scoreTotal,
            niveau: d.niveauStress ?? 'Inconnu',
            color: getScoreColor(d.scoreTotal),
            index: i + 1,
        }));

    // Stats résumées
    const scores = diagnostics.map(d => d.scoreTotal);
    const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const minScore = scores.length ? Math.min(...scores) : 0;
    const maxScore = scores.length ? Math.max(...scores) : 0;
    const trend = scores.length >= 2
        ? scores[0] < scores[1] ? '↓ En amélioration' : scores[0] > scores[1] ? '↑ En augmentation' : '→ Stable'
        : null;
    const trendColor = trend?.includes('amélioration') ? '#18753c' : trend?.includes('augmentation') ? '#ce0500' : '#666';

    return (
        <main role="main" id="content" style={{ position: 'relative', zIndex: 1 }}>
            <div className="fr-container fr-my-4w" style={{ paddingBottom: '4rem' }}>
                <Breadcrumb
                    currentPageLabel="Mes diagnostics"
                    homeLinkProps={{ href: "/" }}
                    segments={[{ label: "Diagnostic", linkProps: { href: "/diagnostic" } }]}
                />

                <div className="fr-grid-row fr-grid-row--gutters fr-grid-row--middle fr-mb-4w">
                    <div className="fr-col">
                        <h1 className="fr-h2" style={{ marginBottom: '0.25rem' }}>Mes diagnostics</h1>
                        <p style={{ margin: 0, color: 'var(--text-mention-grey)', fontSize: '0.9375rem' }}>
                            Suivez l'évolution de votre stress dans le temps.
                        </p>
                    </div>
                    <div className="fr-col-auto">
                        <Button onClick={() => navigate('/diagnostic')} iconId="fr-icon-add-circle-line">
                            Nouveau diagnostic
                        </Button>
                    </div>
                </div>

                {loading && (
                    <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                        <span>Chargement...</span>
                    </div>
                )}

                {error && <Alert severity="error" title="Erreur" description={error} className="fr-mb-3w" />}

                {/* ── État vide ── */}
                {!loading && diagnostics.length === 0 && !error && (
                    <div className="fr-card fr-card--shadow fr-p-4w" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                        <h2 className="fr-h4">Aucun diagnostic réalisé</h2>
                        <p style={{ color: 'var(--text-mention-grey)', marginBottom: '1.5rem' }}>
                            Passez votre premier diagnostic pour commencer à suivre votre évolution.
                        </p>
                        <Button onClick={() => navigate('/diagnostic')} iconId="fr-icon-heart-pulse-fill">
                            Faire mon diagnostic
                        </Button>
                    </div>
                )}

                {!loading && diagnostics.length > 0 && (
                    <>
                        {/* ── Cartes de stats résumées ── */}
                        <div className="fr-grid-row fr-grid-row--gutters fr-mb-4w">
                            {[
                                { label: 'Diagnostics', value: diagnostics.length, color: 'var(--blue-france-sun-113-625)', unit: '' },
                                { label: 'Score moyen', value: avgScore, color: getScoreColor(avgScore), unit: '/40' },
                                { label: 'Meilleur score', value: minScore, color: '#18753c', unit: '/40' },
                                { label: 'Score le plus haut', value: maxScore, color: '#ce0500', unit: '/40' },
                            ].map(stat => (
                                <div key={stat.label} className="fr-col-6 fr-col-md-3">
                                    <div className="fr-card fr-card--shadow" style={{ padding: '1rem 1.25rem' }}>
                                        <p style={{
                                            margin: '0 0 0.25rem',
                                            fontSize: '0.8rem',
                                            color: 'var(--text-mention-grey)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.04em'
                                        }}>
                                            {stat.label}
                                        </p>
                                        <p style={{
                                            margin: 0,
                                            fontWeight: 700,
                                            fontSize: '1.75rem',
                                            color: stat.color,
                                            lineHeight: 1.1,
                                        }}>
                                            {stat.value}
                                            <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-mention-grey)' }}>
                                                {stat.unit}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Tendance */}
                        {trend && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '1.5rem',
                                padding: '0.625rem 1rem',
                                background: 'var(--background-alt-grey)',
                                borderRadius: '4px',
                                fontSize: '0.9375rem',
                            }}>
                                <span style={{ fontWeight: 600, color: trendColor }}>{trend}</span>
                                <span style={{ color: 'var(--text-mention-grey)' }}>
                                    — entre le dernier et l'avant-dernier diagnostic
                                </span>
                            </div>
                        )}

                        {/* ── Graphique d'évolution ── */}
                        {chartData.length >= 2 && (
                            <div className="fr-card fr-card--shadow" style={{ overflow: 'hidden', marginBottom: '2rem' }}>
                                <div style={{ padding: '1.25rem 1.5rem 0.5rem' }}>
                                    <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-title-grey)' }}>
                                        Évolution du score de stress
                                    </h2>
                                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-mention-grey)' }}>
                                        Score PSS-10 — de 0 (aucun stress) à 40 (stress élevé)
                                    </p>
                                </div>
                                <div style={{ padding: '1rem 0.5rem 1.5rem' }}>
                                    <ResponsiveContainer width="100%" height={280}>
                                        <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                                            {/* Zones colorées */}
                                            <ReferenceArea y1={0}  y2={13} fill="#dffee8" fillOpacity={0.6} />
                                            <ReferenceArea y1={14} y2={26} fill="#fff3e0" fillOpacity={0.6} />
                                            <ReferenceArea y1={27} y2={40} fill="#feecec" fillOpacity={0.6} />

                                            {/* Lignes seuil */}
                                            <ReferenceLine y={13} stroke="#18753c" strokeDasharray="4 3" strokeWidth={1.5}
                                                label={{ value: 'Faible', position: 'insideTopRight', fontSize: 11, fill: '#18753c' }} />
                                            <ReferenceLine y={26} stroke="#b34000" strokeDasharray="4 3" strokeWidth={1.5}
                                                label={{ value: 'Modéré', position: 'insideTopRight', fontSize: 11, fill: '#b34000' }} />

                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                                            <XAxis
                                                dataKey="date"
                                                tick={{ fontSize: 12, fill: '#666' }}
                                                tickLine={false}
                                                axisLine={{ stroke: '#e5e5e5' }}
                                            />
                                            <YAxis
                                                domain={[0, 40]}
                                                ticks={[0, 10, 13, 20, 26, 30, 40]}
                                                tick={{ fontSize: 11, fill: '#666' }}
                                                tickLine={false}
                                                axisLine={false}
                                                width={30}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Line
                                                type="monotone"
                                                dataKey="score"
                                                stroke="var(--blue-france-sun-113-625)"
                                                strokeWidth={2.5}
                                                dot={<ColoredDot />}
                                                activeDot={{ r: 7 }}
                                                name="Score"
                                            />
                                        </ComposedChart>
                                    </ResponsiveContainer>

                                    {/* Légende des zones */}
                                    <div style={{
                                        display: 'flex',
                                        gap: '1.5rem',
                                        justifyContent: 'center',
                                        flexWrap: 'wrap',
                                        marginTop: '0.5rem',
                                        fontSize: '0.8rem',
                                    }}>
                                        {[
                                            { color: '#18753c', bg: '#dffee8', label: 'Faible (0–13)' },
                                            { color: '#b34000', bg: '#fff3e0', label: 'Modéré (14–26)' },
                                            { color: '#ce0500', bg: '#feecec', label: 'Élevé (27–40)' },
                                        ].map(z => (
                                            <span key={z.label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                                <span style={{ width: 14, height: 14, borderRadius: 2, background: z.bg, border: `1.5px solid ${z.color}`, display: 'inline-block' }} />
                                                <span style={{ color: z.color, fontWeight: 500 }}>{z.label}</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Tableau des diagnostics ── */}
                        <div className="fr-card fr-card--shadow" style={{ overflow: 'hidden' }}>
                            <div style={{ padding: '1.25rem 1.5rem 1rem' }}>
                                <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-title-grey)' }}>
                                    Historique détaillé
                                </h2>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr style={{ background: 'var(--background-alt-grey)', borderBottom: '2px solid var(--border-default-grey)' }}>
                                            {['#', 'Date', 'Score', 'Niveau', 'Évolution'].map(h => (
                                                <th key={h} style={{
                                                    padding: '0.75rem 1.25rem',
                                                    textAlign: 'left',
                                                    fontWeight: 600,
                                                    fontSize: '0.8125rem',
                                                    color: 'var(--text-mention-grey)',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.04em',
                                                    whiteSpace: 'nowrap',
                                                }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {diagnostics.map((diag, index) => {
                                            const prev = diagnostics[index + 1];
                                            const diff = prev ? diag.scoreTotal - prev.scoreTotal : null;
                                            const evo = diff === null ? '—'
                                                : diff < 0 ? `↓ ${Math.abs(diff)} pts`
                                                : diff > 0 ? `↑ ${diff} pts`
                                                : '→ stable';
                                            const evoColor = diff === null ? '#666'
                                                : diff < 0 ? '#18753c'
                                                : diff > 0 ? '#ce0500'
                                                : '#666';
                                            return (
                                                <tr key={diag.id} style={{
                                                    borderBottom: '1px solid var(--border-default-grey)',
                                                    background: index === 0 ? 'var(--blue-france-950-100)' : 'white',
                                                    transition: 'background 0.1s',
                                                }}>
                                                    <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-mention-grey)', fontWeight: 500 }}>
                                                        {index === 0
                                                            ? <Badge small>Dernier</Badge>
                                                            : <span>{diagnostics.length - index}</span>
                                                        }
                                                    </td>
                                                    <td style={{ padding: '0.875rem 1.25rem', whiteSpace: 'nowrap' }}>
                                                        {formatDateFull(diag.dateRealisation)}
                                                    </td>
                                                    <td style={{ padding: '0.875rem 1.25rem' }}>
                                                        <span style={{
                                                            fontWeight: 700,
                                                            fontSize: '1.1rem',
                                                            color: getScoreColor(diag.scoreTotal),
                                                        }}>
                                                            {diag.scoreTotal}
                                                        </span>
                                                        <span style={{ color: 'var(--text-mention-grey)', fontSize: '0.8rem' }}> /40</span>
                                                    </td>
                                                    <td style={{ padding: '0.875rem 1.25rem' }}>
                                                        <Badge severity={getBadgeSeverity(diag.niveauStress)} small>
                                                            {diag.niveauStress ?? 'Inconnu'}
                                                        </Badge>
                                                    </td>
                                                    <td style={{ padding: '0.875rem 1.25rem', fontWeight: 600, color: evoColor, whiteSpace: 'nowrap' }}>
                                                        {evo}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}


