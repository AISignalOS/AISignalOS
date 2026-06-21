import { Router, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../storage/db.js'
import { runAudit, determineRunStatus } from '../services/lighthouse.js'
import type { Run } from '../../src/types/index.js'

const router = Router()

router.post('/baseline', async (req: Request, res: Response) => {
  const { url, projectId, deviceMode = 'mobile', notes = '', runs: runCount = 1 } = req.body

  if (!url || !projectId) {
    res.status(400).json({ error: 'url and projectId are required' })
    return
  }

  const project = db.projects.findById(projectId)
  if (!project) {
    res.status(404).json({ error: 'Project not found' })
    return
  }

  const existingRuns = db.runs.findByProject(projectId)
  const runNumber = existingRuns.length + 1

  res.json({ message: 'Audit started', status: 'running' })

  // Run asynchronously and store result
  runAudit(url, deviceMode, runCount).then((result) => {
    const run: Run = {
      id: uuidv4(),
      projectId,
      runNumber,
      type: 'baseline',
      status: 'baseline',
      createdAt: new Date().toISOString(),
      performanceScore: result.metrics?.performanceScore ?? 0,
      fcp: result.metrics?.fcp ?? 0,
      lcp: result.metrics?.lcp ?? 0,
      tbt: result.metrics?.tbt ?? 0,
      cls: result.metrics?.cls ?? 0,
      speedIndex: result.metrics?.speedIndex ?? 0,
      notes,
      error: result.success ? undefined : result.error,
    }
    db.runs.create(run)
    db.projects.update(projectId, { updatedAt: new Date().toISOString() })
  })
})

router.post('/baseline/sync', async (req: Request, res: Response) => {
  const { url, projectId, deviceMode = 'mobile', notes = '', runs: runCount = 1 } = req.body

  if (!url || !projectId) {
    res.status(400).json({ error: 'url and projectId are required' })
    return
  }

  const project = db.projects.findById(projectId)
  if (!project) {
    res.status(404).json({ error: 'Project not found' })
    return
  }

  const result = await runAudit(url, deviceMode, runCount)
  const existingRuns = db.runs.findByProject(projectId)
  const runNumber = existingRuns.length + 1

  const run: Run = {
    id: uuidv4(),
    projectId,
    runNumber,
    type: 'baseline',
    status: 'baseline',
    createdAt: new Date().toISOString(),
    performanceScore: result.metrics?.performanceScore ?? 0,
    fcp: result.metrics?.fcp ?? 0,
    lcp: result.metrics?.lcp ?? 0,
    tbt: result.metrics?.tbt ?? 0,
    cls: result.metrics?.cls ?? 0,
    speedIndex: result.metrics?.speedIndex ?? 0,
    notes,
    error: result.success ? undefined : result.error,
  }
  db.runs.create(run)
  db.projects.update(projectId, { updatedAt: new Date().toISOString() })

  if (!result.success) {
    res.status(422).json({ error: result.error, run })
    return
  }

  res.json({ run, metrics: result.metrics })
})

router.post('/experiment', async (req: Request, res: Response) => {
  const { url, projectId, deviceMode = 'mobile', experimentId, notes = '', runs: runCount = 1 } = req.body

  if (!url || !projectId || !experimentId) {
    res.status(400).json({ error: 'url, projectId, and experimentId are required' })
    return
  }

  const project = db.projects.findById(projectId)
  if (!project) {
    res.status(404).json({ error: 'Project not found' })
    return
  }

  const experiment = db.experiments.findById(experimentId)
  if (!experiment) {
    res.status(404).json({ error: 'Experiment not found' })
    return
  }

  const result = await runAudit(url, deviceMode, runCount)
  const existingRuns = db.runs.findByProject(projectId)
  const runNumber = existingRuns.length + 1

  const baselineRun = existingRuns.find((r) => r.type === 'baseline')

  let suggestedStatus: Run['status'] = 'review'
  if (result.success && result.metrics && baselineRun) {
    suggestedStatus = determineRunStatus(result.metrics as any, baselineRun)
  }

  const run: Run = {
    id: uuidv4(),
    projectId,
    runNumber,
    type: 'experiment',
    experimentId,
    status: suggestedStatus,
    createdAt: new Date().toISOString(),
    performanceScore: result.metrics?.performanceScore ?? 0,
    fcp: result.metrics?.fcp ?? 0,
    lcp: result.metrics?.lcp ?? 0,
    tbt: result.metrics?.tbt ?? 0,
    cls: result.metrics?.cls ?? 0,
    speedIndex: result.metrics?.speedIndex ?? 0,
    notes,
    error: result.success ? undefined : result.error,
  }
  db.runs.create(run)
  db.projects.update(projectId, { updatedAt: new Date().toISOString() })

  if (!result.success) {
    res.status(422).json({ error: result.error, run })
    return
  }

  res.json({ run, metrics: result.metrics, suggestedStatus })
})

router.patch('/runs/:id/status', (req: Request, res: Response) => {
  const { status } = req.body
  if (!['baseline', 'keep', 'discard', 'review'].includes(status)) {
    res.status(400).json({ error: 'Invalid status' })
    return
  }
  const updated = db.runs.update(req.params.id, { status })
  if (!updated) {
    res.status(404).json({ error: 'Run not found' })
    return
  }
  res.json(updated)
})

export default router
