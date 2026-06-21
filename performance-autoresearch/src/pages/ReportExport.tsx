import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { projectsApi } from '../lib/api'
import { generateMarkdownReport, formatMs, formatCLS, formatDate } from '../lib/helpers'
import LoadingSpinner from '../components/LoadingSpinner'
import type { Project, Run, Experiment, Comparison } from '../types'

interface ReportData {
  project: Project
  baselineRun?: Run
  bestRun?: Run
  comparison: Comparison | null
  keptExperiments: Experiment[]
  discardedExperiments: Experiment[]
  runs: Run[]
  experiments: Experiment[]
}

export default function ReportExport() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!id) return
    projectsApi
      .getReport(id)
      .then(setData)
      .catch(() => setError('Failed to load report'))
      .finally(() => setLoading(false))
  }, [id])

  const markdown = data ? generateMarkdownReport(data) : ''

  async function copyMarkdown() {
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function downloadJson() {
    if (!data) return
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${data.project.name.replace(/\s+/g, '-').toLowerCase()}-report.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return (
    <div className="flex justify-center py-24"><LoadingSpinner message="Loading report..." /></div>
  )
  if (error || !data) return (
    <div className="text-center py-24">
      <p className="text-red-400 font-mono">{error || 'Not found'}</p>
      <Link to="/" className="text-signal-400 text-sm mt-4 block">← Back</Link>
    </div>
  )

  const { project, baselineRun, bestRun, comparison, keptExperiments, discardedExperiments } = data

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link to={`/project/${project.id}`} className="text-xs text-slate-500 hover:text-slate-300 font-mono flex items-center gap-1 mb-2">
            ← Back to project
          </Link>
          <h1 className="text-xl font-bold text-white">Performance Report</h1>
          <p className="text-slate-500 font-mono text-sm mt-0.5">{project.name} — {project.url}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={copyMarkdown}
            className="flex items-center gap-2 text-sm text-signal-400 hover:text-signal-300 border border-signal-600/30 hover:border-signal-600/60 rounded-lg px-4 py-2 transition-colors"
          >
            {copied ? '✓ Copied!' : '📋 Copy Markdown'}
          </button>
          <button
            onClick={downloadJson}
            className="flex items-center gap-2 text-sm bg-signal-600 hover:bg-signal-500 text-white rounded-lg px-4 py-2 transition-colors"
          >
            ↓ Download JSON
          </button>
        </div>
      </div>

      {/* Report body */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-2xl overflow-hidden">
        {/* Report header */}
        <div className="p-6 border-b border-[#1f2937]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-signal-500" />
            <span className="text-xs font-mono text-signal-400 uppercase tracking-widest">AISolutionsOS Performance Autoresearch</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">{project.name}</h2>
          <p className="text-slate-500 font-mono text-sm">{project.url}</p>
          <p className="text-slate-600 text-xs mt-1">{formatDate(new Date().toISOString())} · {project.deviceMode} mode</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Baseline vs Best */}
          <div className="grid grid-cols-2 gap-4">
            <MetricBlock title="Baseline" run={baselineRun} accent="border-slate-600/30" />
            <MetricBlock title="Best Result" run={bestRun} accent="border-signal-600/30" />
          </div>

          {/* Deltas */}
          {comparison && (
            <div>
              <h3 className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-3">Performance Delta</h3>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                <DeltaCell label="Score" delta={comparison.scoreDelta} lowerIsBetter={false} suffix=" pts" />
                <DeltaCell label="FCP" delta={comparison.fcpDelta} lowerIsBetter unit="ms" />
                <DeltaCell label="LCP" delta={comparison.lcpDelta} lowerIsBetter unit="ms" />
                <DeltaCell label="TBT" delta={comparison.tbtDelta} lowerIsBetter unit="ms" />
                <DeltaCell label="CLS" delta={comparison.clsDelta} lowerIsBetter suffix="" isDecimal />
                <DeltaCell label="Speed Index" delta={comparison.speedIndexDelta} lowerIsBetter unit="ms" />
              </div>
            </div>
          )}

          {/* Kept */}
          <ExperimentSection title="Kept Experiments" experiments={keptExperiments} color="emerald" />
          <ExperimentSection title="Discarded Experiments" experiments={discardedExperiments} color="red" />

          {/* Next steps */}
          <div>
            <h3 className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-3">Next Recommended Moves</h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {[
                'Review LCP opportunities in Lighthouse suggestions',
                'Audit and defer non-critical JavaScript',
                'Optimize and compress images (WebP/AVIF)',
                'Implement font-display: swap for web fonts',
                'Review third-party script impact on TBT',
                'Set explicit width/height on all images to prevent CLS',
                'Run 3-5 audits per experiment for statistical stability',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-signal-500 font-mono text-xs mt-0.5">{i + 1}.</span>
                  <span className="text-slate-300 text-sm">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#1f2937] flex items-center justify-between">
          <span className="text-xs text-slate-600 font-mono">Generated by AISolutionsOS Performance Autoresearch — SignalSpeed Lab</span>
          <span className="text-xs text-slate-600 font-mono">{data.runs.length} runs · {data.experiments.length} experiments</span>
        </div>
      </div>

      {/* Markdown preview */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Markdown Source</span>
          <button onClick={copyMarkdown} className="text-xs text-signal-400 hover:text-signal-300 font-mono">
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
        <pre className="px-5 py-4 text-xs text-slate-400 font-mono overflow-x-auto whitespace-pre-wrap max-h-80 overflow-y-auto">
          {markdown}
        </pre>
      </div>
    </div>
  )
}

function MetricBlock({ title, run, accent }: { title: string; run?: Run; accent: string }) {
  if (!run) {
    return (
      <div className={`border ${accent} rounded-xl p-4`}>
        <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-3">{title}</h4>
        <p className="text-slate-600 text-sm">No data yet.</p>
      </div>
    )
  }
  return (
    <div className={`border ${accent} rounded-xl p-4`}>
      <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-3">{title}</h4>
      <div className="space-y-2">
        <MRow label="Score" value={run.performanceScore.toString()} />
        <MRow label="FCP" value={formatMs(run.fcp)} />
        <MRow label="LCP" value={formatMs(run.lcp)} />
        <MRow label="TBT" value={formatMs(run.tbt)} />
        <MRow label="CLS" value={formatCLS(run.cls)} />
        <MRow label="Speed Index" value={formatMs(run.speedIndex)} />
      </div>
    </div>
  )
}

function MRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-slate-500 font-mono">{label}</span>
      <span className="text-white font-mono">{value}</span>
    </div>
  )
}

function DeltaCell({
  label, delta, lowerIsBetter = true, unit, suffix = '', isDecimal = false,
}: {
  label: string; delta: number; lowerIsBetter?: boolean; unit?: string; suffix?: string; isDecimal?: boolean
}) {
  const improved = lowerIsBetter ? delta < 0 : delta > 0
  const colorClass = delta === 0 ? 'text-slate-400' : improved ? 'text-emerald-400' : 'text-red-400'
  const sign = delta > 0 ? '+' : ''
  const display = isDecimal ? delta.toFixed(3) : Math.round(delta).toString()

  return (
    <div className="bg-navy-900 rounded-lg p-3 text-center">
      <div className="text-[10px] text-slate-600 font-mono uppercase tracking-wide mb-1">{label}</div>
      <div className={`text-sm font-mono font-bold ${colorClass}`}>
        {sign}{display}{unit ? ` ${unit}` : suffix}
      </div>
    </div>
  )
}

function ExperimentSection({ title, experiments, color }: { title: string; experiments: Experiment[]; color: 'emerald' | 'red' }) {
  const colorMap = { emerald: 'text-emerald-400', red: 'text-red-400' }
  if (experiments.length === 0) return null
  return (
    <div>
      <h3 className={`text-xs font-mono ${colorMap[color]} uppercase tracking-wider mb-3`}>{title}</h3>
      <div className="space-y-2">
        {experiments.map((e) => (
          <div key={e.id} className="flex items-start gap-2">
            <span className={`mt-0.5 ${colorMap[color]}`}>{color === 'emerald' ? '✓' : '✕'}</span>
            <div>
              <span className="text-white text-sm">{e.name}</span>
              <span className="text-slate-600 text-xs ml-2 font-mono">({e.category})</span>
              {e.resultSummary && <p className="text-slate-400 text-xs">{e.resultSummary}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
