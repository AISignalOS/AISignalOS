import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { projectsApi } from '../lib/api'
import { formatMs, formatDate, scoreColor } from '../lib/helpers'
import ScoreRing from '../components/ScoreRing'
import LoadingSpinner from '../components/LoadingSpinner'
import type { Project } from '../types'

interface ProjectCard {
  project: Project
  totalRuns: number
  keptRuns: number
  discardedRuns: number
  baselineRun?: { performanceScore: number; lcp: number }
  bestRun?: { performanceScore: number; lcp: number }
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [cards, setCards] = useState<ProjectCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProjects()
  }, [])

  async function loadProjects() {
    try {
      const data = await projectsApi.list()
      setProjects(data)
      const statsArr = await Promise.all(
        data.map((p) => projectsApi.getStats(p.id).catch(() => null))
      )
      const cards: ProjectCard[] = data.map((p, i) => {
        const s = statsArr[i]
        return {
          project: p,
          totalRuns: s?.totalRuns ?? 0,
          keptRuns: s?.keptRuns ?? 0,
          discardedRuns: s?.discardedRuns ?? 0,
          baselineRun: s?.baselineRun
            ? { performanceScore: s.baselineRun.performanceScore, lcp: s.baselineRun.lcp }
            : undefined,
          bestRun: s?.bestRun
            ? { performanceScore: s.bestRun.performanceScore, lcp: s.bestRun.lcp }
            : undefined,
        }
      })
      setCards(cards)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-800 via-card to-navy-900 border border-border p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-signal-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-32 w-48 h-48 bg-signal-500/3 rounded-full blur-2xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-signal-400 animate-pulse" />
            <span className="text-xs font-mono text-signal-400 uppercase tracking-widest">SignalSpeed Lab</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            AISolutionsOS{' '}
            <span className="text-signal-400">Performance Autoresearch</span>
          </h1>
          <p className="text-slate-400 text-base max-w-xl">
            Turn website speed tests into repeatable optimization systems. Input → System → Asset → Tool → Product.
          </p>
          <div className="flex items-center gap-3 mt-6">
            <Link
              to="/new-audit"
              className="inline-flex items-center gap-2 bg-signal-600 hover:bg-signal-500 text-white font-medium px-5 py-2.5 rounded-lg transition-colors shadow-lg shadow-signal-600/25"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Audit
            </Link>
            <span className="text-slate-600 text-sm font-mono">{projects.length} project{projects.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      {cards.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatChip label="Total Projects" value={cards.length} />
          <StatChip label="Total Runs" value={cards.reduce((a, c) => a + c.totalRuns, 0)} />
          <StatChip label="Kept Experiments" value={cards.reduce((a, c) => a + c.keptRuns, 0)} color="emerald" />
          <StatChip label="Discarded" value={cards.reduce((a, c) => a + c.discardedRuns, 0)} color="red" />
        </div>
      )}

      {/* Projects grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner message="Loading projects..." />
        </div>
      ) : cards.length === 0 ? (
        <EmptyState />
      ) : (
        <div>
          <h2 className="text-sm font-mono text-slate-500 uppercase tracking-wider mb-4">Projects</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card) => (
              <ProjectCard key={card.project.id} {...card} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatChip({ label, value, color = 'signal' }: { label: string; value: number; color?: string }) {
  const colorMap: Record<string, string> = {
    signal: 'text-signal-400',
    emerald: 'text-emerald-400',
    red: 'text-red-400',
    amber: 'text-amber-400',
  }
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className={`text-2xl font-mono font-bold ${colorMap[color] ?? 'text-white'}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-1 font-mono uppercase tracking-wide">{label}</div>
    </div>
  )
}

function ProjectCard({ project, totalRuns, keptRuns, discardedRuns, baselineRun, bestRun }: ProjectCard) {
  const score = bestRun?.performanceScore ?? baselineRun?.performanceScore ?? 0
  const lcp = bestRun?.lcp ?? baselineRun?.lcp ?? 0

  return (
    <Link to={`/project/${project.id}`}>
      <div className="bg-card border border-border hover:border-signal-600/50 rounded-xl p-5 transition-all hover:shadow-lg hover:shadow-signal-600/10 group cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-sm truncate group-hover:text-signal-300 transition-colors">
              {project.name}
            </h3>
            <p className="text-xs text-slate-500 font-mono truncate mt-0.5">{project.url}</p>
          </div>
          <ScoreRing score={score} size={52} />
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <MiniStat label="Runs" value={totalRuns} />
          <MiniStat label="Kept" value={keptRuns} color="text-emerald-400" />
          <MiniStat label="Disc." value={discardedRuns} color="text-red-400" />
        </div>

        {lcp > 0 && (
          <div className="flex items-center justify-between text-xs border-t border-border pt-3">
            <span className="text-slate-500 font-mono">Best LCP</span>
            <span className={`font-mono font-medium ${scoreColor(score)}`}>{formatMs(lcp)}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs mt-2">
          <span className="text-slate-600 font-mono">{project.deviceMode}</span>
          <span className="text-slate-600 font-mono">{formatDate(project.updatedAt)}</span>
        </div>
      </div>
    </Link>
  )
}

function MiniStat({ label, value, color = 'text-white' }: { label: string; value: number; color?: string }) {
  return (
    <div className="text-center">
      <div className={`text-lg font-mono font-bold ${color}`}>{value}</div>
      <div className="text-[10px] text-slate-600 uppercase tracking-wide font-mono">{label}</div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-signal-600/10 border border-signal-600/20 flex items-center justify-center">
        <svg className="w-8 h-8 text-signal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <div className="text-center">
        <h3 className="text-white font-semibold mb-1">No projects yet</h3>
        <p className="text-slate-500 text-sm max-w-xs">
          Create your first project to start tracking performance and running optimization experiments.
        </p>
      </div>
      <Link
        to="/new-audit"
        className="inline-flex items-center gap-2 bg-signal-600 hover:bg-signal-500 text-white font-medium px-5 py-2.5 rounded-lg transition-colors mt-2"
      >
        Create First Project
      </Link>
    </div>
  )
}
