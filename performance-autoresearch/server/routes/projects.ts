import { Router, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../storage/db.js'
import type { Project, Run, Comparison } from '../../src/types/index.js'
import { calculateImprovementPercent, determineRunStatus } from '../services/lighthouse.js'

const router = Router()

router.get('/', (_req: Request, res: Response) => {
  const projects = db.projects.findAll()
  res.json(projects)
})

router.post('/', (req: Request, res: Response) => {
  const { name, url, deviceMode = 'mobile', notes } = req.body
  if (!name || !url) {
    res.status(400).json({ error: 'name and url are required' })
    return
  }
  const project: Project = {
    id: uuidv4(),
    name,
    url,
    deviceMode,
    notes: notes ?? '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  db.projects.create(project)
  res.status(201).json(project)
})

router.get('/:id', (req: Request, res: Response) => {
  const project = db.projects.findById(req.params.id)
  if (!project) {
    res.status(404).json({ error: 'Project not found' })
    return
  }
  res.json(project)
})

router.get('/:id/runs', (req: Request, res: Response) => {
  const project = db.projects.findById(req.params.id)
  if (!project) {
    res.status(404).json({ error: 'Project not found' })
    return
  }
  const runs = db.runs.findByProject(req.params.id)
  res.json(runs)
})

router.get('/:id/experiments', (req: Request, res: Response) => {
  const project = db.projects.findById(req.params.id)
  if (!project) {
    res.status(404).json({ error: 'Project not found' })
    return
  }
  const experiments = db.experiments.findByProject(req.params.id)
  res.json(experiments)
})

router.get('/:id/stats', (req: Request, res: Response) => {
  const project = db.projects.findById(req.params.id)
  if (!project) {
    res.status(404).json({ error: 'Project not found' })
    return
  }
  const runs = db.runs.findByProject(req.params.id)
  const experiments = db.experiments.findByProject(req.params.id)

  const baselineRun = runs.find((r) => r.type === 'baseline')
  const validRuns = runs.filter((r) => !r.error)
  const bestRun = validRuns.reduce<Run | undefined>((best, run) => {
    if (!best) return run
    return run.performanceScore > best.performanceScore ? run : best
  }, undefined)

  res.json({
    project,
    baselineRun,
    bestRun,
    totalRuns: runs.length,
    keptRuns: runs.filter((r) => r.status === 'keep').length,
    discardedRuns: runs.filter((r) => r.status === 'discard').length,
    reviewRuns: runs.filter((r) => r.status === 'review').length,
    experiments,
    recentRuns: runs.slice(-5).reverse(),
  })
})

router.get('/:id/report', (req: Request, res: Response) => {
  const project = db.projects.findById(req.params.id)
  if (!project) {
    res.status(404).json({ error: 'Project not found' })
    return
  }

  const runs = db.runs.findByProject(req.params.id)
  const experiments = db.experiments.findByProject(req.params.id)

  const baselineRun = runs.find((r) => r.type === 'baseline')
  const validRuns = runs.filter((r) => !r.error)
  const bestRun = validRuns.reduce<Run | undefined>((best, run) => {
    if (!best) return run
    return run.performanceScore > best.performanceScore ? run : best
  }, undefined)

  const keptExperiments = experiments.filter((e) => e.status === 'keep')
  const discardedExperiments = experiments.filter((e) => e.status === 'discard')

  let comparison: Comparison | null = null
  if (baselineRun && bestRun && baselineRun.id !== bestRun.id) {
    comparison = {
      baselineRunId: baselineRun.id,
      currentRunId: bestRun.id,
      scoreDelta: bestRun.performanceScore - baselineRun.performanceScore,
      fcpDelta: bestRun.fcp - baselineRun.fcp,
      lcpDelta: bestRun.lcp - baselineRun.lcp,
      tbtDelta: bestRun.tbt - baselineRun.tbt,
      clsDelta: parseFloat((bestRun.cls - baselineRun.cls).toFixed(3)),
      speedIndexDelta: bestRun.speedIndex - baselineRun.speedIndex,
      improvementPercent: calculateImprovementPercent(bestRun.lcp, baselineRun.lcp, 'lower-is-better'),
      suggestedStatus: determineRunStatus(bestRun, baselineRun),
    }
  }

  res.json({ project, baselineRun, bestRun, comparison, keptExperiments, discardedExperiments, runs, experiments })
})

export default router
