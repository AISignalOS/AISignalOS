import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar,
} from 'recharts'
import { projectsApi, auditsApi, experimentsApi } from '../lib/api'
import { formatMs, formatCLS, formatDate, scoreColor, statusColor, deltaColor, EXPERIMENT_TEMPLATES } from '../lib/helpers'
import StatusBadge from '../components/StatusBadge'
import ScoreRing from '../components/ScoreRing'
import LoadingSpinner from '../components/LoadingSpinner'
import type { Project, Run, Experiment } from '../types'

const CHART_COLORS = {
  lcp: '#7b8cf9',
  fcp: '#34d399',
  score: '#fbbf24',
  tbt: '#f87171',
}

type Tab = 'lab' | 'report'

export default function ProjectAudit() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [runs, setRuns] = useState<Run[]>([])
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [tab, setTab] = useState<Tab>('lab')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showNewExperiment, setShowNewExperiment] = useState(false)
  const [auditingExperiment, setAuditingExperiment] = useState<string | null>(null)
  const [auditError, setAuditError] = useState('')

  const load = useCallback(async () => {
    if (!id) return
    try {
      const [proj, r, e] = await Promise.all([
        projectsApi.get(id),
        projectsApi.getRuns(id),
        projectsApi.getExperiments(id),
      ])
      setProject(proj)
      setRuns(r)
      setExperiments(e)
    } catch {
      setError('Failed to load project')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  const baseline = runs.find((r) => r.type === 'baseline')
  const validRuns = runs.filter((r) => !r.error && r.performanceScore > 0)
  const bestRun = validRuns.reduce<Run | undefined>((best, r) =>
    !best || r.performanceScore > best.performanceScore ? r : best, undefined)

  const chartData = runs
    .filter((r) => !r.error && r.performanceScore > 0)
    .map((r, i) => ({
      name: `#${r.runNumber}`,
      score: r.performanceScore,
      lcp: Math.round(r.lcp / 100) / 10,
      fcp: Math.round(r.fcp / 100) / 10,
      tbt: r.tbt,
      status: r.status,
    }))

  async function updateRunStatus(runId: string, status: string) {
    await auditsApi.updateRunStatus(runId, status)
    load()
  }

  async function runExperimentAudit(experimentId: string) {
    if (!project) return
    setAuditingExperiment(experimentId)
    setAuditError('')
    try {
      await auditsApi.runExperiment({
        url: project.url,
        projectId: project.id,
        experimentId,
        deviceMode: project.deviceMode,
      })
      await load()
    } catch (err: any) {
      setAuditError(err?.response?.data?.error ?? 'Audit failed')
    } finally {
      setAuditingExperiment(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner message="Loading project..." />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="text-center py-24">
        <p className="text-red-400 font-mono">{error || 'Project not found'}</p>
        <Link to="/" className="text-signal-400 text-sm mt-4 block">← Back to dashboard</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link to="/" className="text-xs text-slate-500 hover:text-slate-300 font-mono flex items-center gap-1 mb-2">
            ← Dashboard
          </Link>
          <h1 className="text-xl font-bold text-white">{project.name}</h1>
          <p className="text-slate-500 font-mono text-sm mt-0.5">{project.url}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-mono border border-border text-slate-500 rounded px-2 py-1">{project.deviceMode}</span>
          <Link
            to={`/project/${project.id}/report`}
            className="text-sm text-signal-400 hover:text-signal-300 border border-signal-600/30 hover:border-signal-600/60 rounded-lg px-3 py-1.5 transition-colors"
          >
            Export Report
          </Link>
          <button
            onClick={() => setShowNewExperiment(true)}
            className="text-sm bg-signal-600 hover:bg-signal-500 text-white font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            + Experiment
          </button>
        </div>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <TopMetric label="Perf Score" value={bestRun?.performanceScore ?? 0} format="score" />
        <TopMetric label="FCP" value={bestRun?.fcp ?? 0} format="ms" />
        <TopMetric label="LCP" value={bestRun?.lcp ?? 0} format="ms" />
        <TopMetric label="TBT" value={bestRun?.tbt ?? 0} format="ms" />
        <TopMetric label="CLS" value={bestRun?.cls ?? 0} format="cls" />
        <TopMetric label="Speed Index" value={bestRun?.speedIndex ?? 0} format="ms" />
        <TopMetric label="Exp Run" value={experiments.length} format="count" />
        <TopMetric label="Exp Kept" value={experiments.filter((e) => e.status === 'keep').length} format="count" color="text-emerald-400" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border pb-0">
        {(['lab', 'report'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px capitalize ${
              tab === t
                ? 'border-signal-500 text-signal-400'
                : 'border-transparent text-slate-500 hover:text-white'
            }`}
          >
            {t === 'lab' ? 'Lab View' : 'Report View'}
          </button>
        ))}
      </div>

      {tab === 'lab' ? (
        <LabView
          runs={runs}
          experiments={experiments}
          chartData={chartData}
          baseline={baseline}
          bestRun={bestRun}
          onStatusChange={updateRunStatus}
          onRunExperiment={runExperimentAudit}
          auditingExperiment={auditingExperiment}
          auditError={auditError}
          onRefresh={load}
        />
      ) : (
        <ReportView
          runs={runs}
          experiments={experiments}
          chartData={chartData}
          baseline={baseline}
          bestRun={bestRun}
          project={project}
        />
      )}

      {showNewExperiment && (
        <NewExperimentModal
          projectId={project.id}
          onClose={() => setShowNewExperiment(false)}
          onCreated={() => { setShowNewExperiment(false); load() }}
        />
      )}
    </div>
  )
}

// ─── Lab View ───────────────────────────────────────────────────────────────

function LabView({
  runs, experiments, chartData, baseline, bestRun,
  onStatusChange, onRunExperiment, auditingExperiment, auditError, onRefresh,
}: {
  runs: Run[]
  experiments: Experiment[]
  chartData: any[]
  baseline?: Run
  bestRun?: Run
  onStatusChange: (id: string, status: string) => void
  onRunExperiment: (experimentId: string) => void
  auditingExperiment: string | null
  auditError: string
  onRefresh: () => void
}) {
  return (
    <div className="space-y-6">
      {/* Charts row */}
      {chartData.length > 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard title="Performance Score Over Time">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d47" />
                <XAxis dataKey="name" tick={{ fill: '#4a5568', fontSize: 11, fontFamily: 'monospace' }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#4a5568', fontSize: 11, fontFamily: 'monospace' }} />
                <Tooltip contentStyle={{ background: '#131c2e', border: '1px solid #1e2d47', borderRadius: 8, color: '#fff', fontFamily: 'monospace', fontSize: 12 }} />
                <Line type="monotone" dataKey="score" stroke={CHART_COLORS.score} strokeWidth={2} dot={{ r: 4, fill: CHART_COLORS.score }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="LCP / FCP (seconds)">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d47" />
                <XAxis dataKey="name" tick={{ fill: '#4a5568', fontSize: 11, fontFamily: 'monospace' }} />
                <YAxis tick={{ fill: '#4a5568', fontSize: 11, fontFamily: 'monospace' }} />
                <Tooltip contentStyle={{ background: '#131c2e', border: '1px solid #1e2d47', borderRadius: 8, color: '#fff', fontFamily: 'monospace', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'monospace', color: '#4a5568' }} />
                <Line type="monotone" dataKey="lcp" stroke={CHART_COLORS.lcp} strokeWidth={2} dot={{ r: 3, fill: CHART_COLORS.lcp }} name="LCP (s)" />
                <Line type="monotone" dataKey="fcp" stroke={CHART_COLORS.fcp} strokeWidth={2} dot={{ r: 3, fill: CHART_COLORS.fcp }} name="FCP (s)" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* Experiments panel */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white font-mono">Experiments</h3>
          <span className="text-xs text-slate-500 font-mono">{experiments.length} total</span>
        </div>

        {auditError && (
          <div className="mx-5 mt-4 bg-red-400/10 border border-red-400/30 rounded-lg p-3">
            <p className="text-red-400 text-xs font-mono">{auditError}</p>
          </div>
        )}

        {experiments.length === 0 ? (
          <div className="px-5 py-8 text-center text-slate-500 text-sm">
            No experiments yet. Click "+ Experiment" to add one.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {experiments.map((exp) => {
              const expRun = runs
                .filter((r) => r.experimentId === exp.id && !r.error)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]

              return (
                <div key={exp.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white text-sm font-medium">{exp.name}</span>
                        <span className="text-[10px] font-mono text-slate-600 border border-border rounded px-1.5 py-0.5">{exp.category}</span>
                        <StatusBadge status={exp.status} size="sm" />
                      </div>
                      {exp.description && <p className="text-xs text-slate-500 mb-1">{exp.description}</p>}
                      {exp.hypothesis && <p className="text-xs text-slate-600 italic">H: {exp.hypothesis}</p>}
                      {exp.resultSummary && <p className="text-xs text-emerald-400/80 mt-1">{exp.resultSummary}</p>}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {expRun && (
                        <div className="text-right">
                          <div className={`text-base font-mono font-bold ${scoreColor(expRun.performanceScore)}`}>
                            {expRun.performanceScore}
                          </div>
                          <div className="text-[10px] text-slate-600 font-mono">LCP {formatMs(expRun.lcp)}</div>
                        </div>
                      )}

                      <button
                        onClick={() => onRunExperiment(exp.id)}
                        disabled={auditingExperiment === exp.id}
                        className="text-xs bg-navy-900 hover:bg-signal-600/20 border border-border hover:border-signal-600/50 text-slate-300 rounded px-2.5 py-1.5 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {auditingExperiment === exp.id ? <LoadingSpinner size="sm" /> : '▶'}
                        {auditingExperiment === exp.id ? 'Running...' : 'Run Audit'}
                      </button>

                      {expRun && (
                        <StatusDropdown
                          current={exp.status}
                          onChange={async (s) => {
                            await experimentsApi.updateStatus(exp.id, s)
                            await auditsApi.updateRunStatus(expRun.id, s === 'pending' ? 'review' : s)
                            onRefresh()
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Run Log table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white font-mono">Run Log</h3>
          <span className="text-xs text-slate-500 font-mono">{runs.length} runs</span>
        </div>
        {runs.length === 0 ? (
          <div className="px-5 py-6 text-center text-slate-500 text-sm">No runs yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-border text-slate-600 uppercase tracking-wider text-[10px]">
                  <th className="text-left px-5 py-2">#</th>
                  <th className="text-left px-3 py-2">Status</th>
                  <th className="text-right px-3 py-2">Score</th>
                  <th className="text-right px-3 py-2">LCP</th>
                  <th className="text-right px-3 py-2">FCP</th>
                  <th className="text-right px-3 py-2">TBT</th>
                  <th className="text-right px-3 py-2">CLS</th>
                  <th className="text-left px-3 py-2">Date</th>
                  <th className="text-left px-3 py-2">Notes</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {runs.map((run) => {
                  const scoreD = baseline && run.id !== baseline.id ? run.performanceScore - baseline.performanceScore : null
                  return (
                    <tr key={run.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-5 py-2.5 text-slate-500">{run.runNumber}</td>
                      <td className="px-3 py-2.5"><StatusBadge status={run.status} size="sm" /></td>
                      <td className="px-3 py-2.5 text-right">
                        <span className={scoreColor(run.performanceScore)}>{run.error ? 'ERR' : run.performanceScore}</span>
                        {scoreD !== null && (
                          <span className={`ml-1 text-[10px] ${deltaColor(scoreD, false)}`}>
                            {scoreD > 0 ? `+${scoreD}` : scoreD}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-right text-slate-300">{run.error ? '--' : formatMs(run.lcp)}</td>
                      <td className="px-3 py-2.5 text-right text-slate-300">{run.error ? '--' : formatMs(run.fcp)}</td>
                      <td className="px-3 py-2.5 text-right text-slate-300">{run.error ? '--' : formatMs(run.tbt)}</td>
                      <td className="px-3 py-2.5 text-right text-slate-300">{run.error ? '--' : formatCLS(run.cls)}</td>
                      <td className="px-3 py-2.5 text-slate-500">{formatDate(run.createdAt)}</td>
                      <td className="px-3 py-2.5 text-slate-600 max-w-32 truncate">{run.notes || '—'}</td>
                      <td className="px-3 py-2.5">
                        {run.status !== 'baseline' && !run.error && (
                          <StatusDropdown
                            current={run.status}
                            onChange={(s) => onStatusChange(run.id, s)}
                          />
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Report View ─────────────────────────────────────────────────────────────

function ReportView({
  runs, experiments, chartData, baseline, bestRun, project,
}: {
  runs: Run[]
  experiments: Experiment[]
  chartData: any[]
  baseline?: Run
  bestRun?: Run
  project: Project
}) {
  const keptExp = experiments.filter((e) => e.status === 'keep')
  const discardedExp = experiments.filter((e) => e.status === 'discard')

  const lcpImprovement =
    baseline && bestRun && baseline.lcp > 0
      ? (((baseline.lcp - bestRun.lcp) / baseline.lcp) * 100).toFixed(1)
      : null

  const scoreDelta =
    baseline && bestRun ? bestRun.performanceScore - baseline.performanceScore : null

  return (
    <div className="space-y-6">
      {/* Report header cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <ReportMetricCard
          label="Best Score"
          value={bestRun?.performanceScore ?? '--'}
          baseline={baseline?.performanceScore}
          higherIsBetter
        />
        <ReportMetricCard label="Best LCP" value={bestRun ? formatMs(bestRun.lcp) : '--'} baseline={baseline ? formatMs(baseline.lcp) : undefined} />
        <ReportMetricCard label="Best FCP" value={bestRun ? formatMs(bestRun.fcp) : '--'} baseline={baseline ? formatMs(baseline.fcp) : undefined} />
        <ReportMetricCard label="LCP Δ%" value={lcpImprovement !== null ? `${lcpImprovement}%` : '--'} positive={lcpImprovement !== null && parseFloat(lcpImprovement) > 0} />
        <ReportMetricCard label="Score Δ" value={scoreDelta !== null ? (scoreDelta > 0 ? `+${scoreDelta}` : String(scoreDelta)) : '--'} positive={scoreDelta !== null && scoreDelta > 0} />
        <ReportMetricCard label={`${runs.length} Runs / ${keptExp.length} Kept`} value={`${discardedExp.length} disc.`} />
      </div>

      {/* 4 charts */}
      {chartData.length > 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <LightChartCard title="LCP Over Time (s)">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f4ff20" />
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                <Line type="monotone" dataKey="lcp" stroke="#7b8cf9" strokeWidth={2.5} dot={{ r: 4, fill: '#7b8cf9' }} />
              </LineChart>
            </ResponsiveContainer>
          </LightChartCard>

          <LightChartCard title="FCP Over Time (s)">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f4ff20" />
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                <Line type="monotone" dataKey="fcp" stroke="#34d399" strokeWidth={2.5} dot={{ r: 4, fill: '#34d399' }} />
              </LineChart>
            </ResponsiveContainer>
          </LightChartCard>

          <LightChartCard title="Performance Score Over Time">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f4ff20" />
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                <Line type="monotone" dataKey="score" stroke="#fbbf24" strokeWidth={2.5} dot={{ r: 4, fill: '#fbbf24' }} />
              </LineChart>
            </ResponsiveContainer>
          </LightChartCard>

          <LightChartCard title="TBT Over Time (ms)">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f4ff20" />
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                <Bar dataKey="tbt" fill="#f87171" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </LightChartCard>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SummaryCard title="What Improved" color="emerald">
          {keptExp.length === 0 ? (
            <p className="text-slate-400 text-sm">No kept experiments yet.</p>
          ) : (
            keptExp.map((e) => (
              <div key={e.id} className="flex items-start gap-2 text-sm">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <div>
                  <span className="text-white">{e.name}</span>
                  {e.resultSummary && <p className="text-slate-400 text-xs">{e.resultSummary}</p>}
                </div>
              </div>
            ))
          )}
        </SummaryCard>

        <SummaryCard title="What Got Worse" color="red">
          {discardedExp.length === 0 ? (
            <p className="text-slate-400 text-sm">No discarded experiments.</p>
          ) : (
            discardedExp.map((e) => (
              <div key={e.id} className="flex items-start gap-2 text-sm">
                <span className="text-red-400 mt-0.5">✕</span>
                <div>
                  <span className="text-white">{e.name}</span>
                  {e.resultSummary && <p className="text-slate-400 text-xs">{e.resultSummary}</p>}
                </div>
              </div>
            ))
          )}
        </SummaryCard>

        <SummaryCard title="Recommended Next Steps" color="signal" className="sm:col-span-2">
          <div className="grid sm:grid-cols-2 gap-2">
            {[
              'Audit and defer non-critical JavaScript',
              'Optimize hero image with WebP + preload',
              'Inline critical CSS, defer the rest',
              'Delay third-party scripts until after page load',
              'Set explicit dimensions on all images (CLS)',
              'Add font-display: swap for web fonts',
              'Run 3-5 audits per experiment for stability',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="text-signal-400 font-mono mt-0.5">{i + 1}.</span>
                <span className="text-slate-300">{step}</span>
              </div>
            ))}
          </div>
        </SummaryCard>
      </div>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function TopMetric({ label, value, format, color }: {
  label: string; value: number; format: string; color?: string
}) {
  const display =
    format === 'ms' ? formatMs(value) :
    format === 'cls' ? formatCLS(value) :
    format === 'score' ? (value === 0 ? '--' : value.toString()) :
    value.toString()

  const colorClass = format === 'score' ? scoreColor(value) : color ?? 'text-white'

  return (
    <div className="bg-card border border-border rounded-lg p-3 col-span-1">
      <div className="text-[10px] font-mono text-slate-600 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-xl font-mono font-bold ${colorClass}`}>{display}</div>
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-3">{title}</h4>
      {children}
    </div>
  )
}

function LightChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4">
      <h4 className="text-xs font-medium text-slate-400 mb-3">{title}</h4>
      {children}
    </div>
  )
}

function ReportMetricCard({
  label, value, baseline, higherIsBetter = false, positive,
}: {
  label: string; value: string | number; baseline?: string | number; higherIsBetter?: boolean; positive?: boolean
}) {
  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4">
      <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-mono">{label}</div>
      <div className={`text-xl font-mono font-bold ${positive === true ? 'text-emerald-400' : positive === false ? 'text-red-400' : 'text-white'}`}>
        {value}
      </div>
      {baseline !== undefined && (
        <div className="text-[10px] text-slate-600 mt-1 font-mono">Base: {baseline}</div>
      )}
    </div>
  )
}

function SummaryCard({
  title, color, children, className = '',
}: {
  title: string; color: string; children: React.ReactNode; className?: string
}) {
  const borderMap: Record<string, string> = {
    emerald: 'border-emerald-400/20',
    red: 'border-red-400/20',
    signal: 'border-signal-600/20',
  }
  const titleMap: Record<string, string> = {
    emerald: 'text-emerald-400',
    red: 'text-red-400',
    signal: 'text-signal-400',
  }
  return (
    <div className={`bg-[#111827] border ${borderMap[color] ?? 'border-[#1f2937]'} rounded-xl p-5 ${className}`}>
      <h4 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${titleMap[color] ?? 'text-white'}`}>
        {title}
      </h4>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function StatusDropdown({ current, onChange }: { current: string; onChange: (s: string) => void }) {
  return (
    <select
      value={current}
      onChange={(e) => onChange(e.target.value)}
      className="text-[11px] font-mono bg-navy-900 border border-border text-slate-400 rounded px-2 py-1 focus:outline-none focus:border-signal-600 cursor-pointer"
    >
      <option value="keep">Keep</option>
      <option value="discard">Discard</option>
      <option value="review">Review</option>
      <option value="pending">Pending</option>
    </select>
  )
}

// ─── New Experiment Modal ────────────────────────────────────────────────────

const CATEGORIES = ['CSS', 'JavaScript', 'Images', 'Fonts', 'HTML', 'Third-party scripts', 'Layout/CLS', 'Caching', 'Other']

function NewExperimentModal({
  projectId, onClose, onCreated,
}: {
  projectId: string; onClose: () => void; onCreated: () => void
}) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'JavaScript',
    hypothesis: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [useTemplate, setUseTemplate] = useState(false)

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function applyTemplate(t: (typeof EXPERIMENT_TEMPLATES)[number]) {
    setForm({ name: t.name, description: t.description, category: t.category, hypothesis: t.hypothesis })
    setUseTemplate(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name is required'); return }
    setLoading(true)
    try {
      await experimentsApi.create({ projectId, ...form })
      onCreated()
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Failed to create experiment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-white">New Experiment</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">✕</button>
        </div>

        <div className="px-6 py-2 border-b border-border">
          <button
            onClick={() => setUseTemplate(!useTemplate)}
            className="text-xs text-signal-400 hover:text-signal-300 font-mono py-2"
          >
            {useTemplate ? '▲ Hide templates' : '▼ Load from template'}
          </button>
        </div>

        {useTemplate && (
          <div className="px-6 py-3 border-b border-border max-h-48 overflow-y-auto space-y-1">
            {EXPERIMENT_TEMPLATES.map((t, i) => (
              <button
                key={i}
                onClick={() => applyTemplate(t)}
                className="w-full text-left text-xs px-3 py-2 rounded hover:bg-signal-600/10 hover:text-signal-300 text-slate-400 transition-colors"
              >
                <span className="text-[10px] border border-border rounded px-1.5 mr-2 text-slate-600">{t.category}</span>
                {t.name}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-1.5">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="w-full bg-navy-900 border border-border rounded-lg px-3 py-2 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-signal-600"
              placeholder="Defer non-critical scripts"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
            <select
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
              className="w-full bg-navy-900 border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-signal-600"
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              rows={2}
              className="w-full bg-navy-900 border border-border rounded-lg px-3 py-2 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-signal-600 resize-none"
              placeholder="What change are you testing?"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-1.5">Hypothesis</label>
            <input
              type="text"
              value={form.hypothesis}
              onChange={(e) => update('hypothesis', e.target.value)}
              className="w-full bg-navy-900 border border-border rounded-lg px-3 py-2 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-signal-600"
              placeholder="This will improve LCP by reducing..."
            />
          </div>

          {error && <p className="text-red-400 text-xs font-mono">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm text-slate-400 border border-border rounded-lg hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 text-sm bg-signal-600 hover:bg-signal-500 text-white font-medium rounded-lg transition-colors disabled:opacity-60"
            >
              {loading ? 'Creating...' : 'Create Experiment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
