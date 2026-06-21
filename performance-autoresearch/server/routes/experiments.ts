import { Router, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../storage/db.js'
import type { Experiment } from '../../src/types/index.js'

const router = Router()

router.post('/', (req: Request, res: Response) => {
  const { projectId, name, description, category, hypothesis } = req.body
  if (!projectId || !name) {
    res.status(400).json({ error: 'projectId and name are required' })
    return
  }

  const project = db.projects.findById(projectId)
  if (!project) {
    res.status(404).json({ error: 'Project not found' })
    return
  }

  const experiment: Experiment = {
    id: uuidv4(),
    projectId,
    name,
    description: description ?? '',
    category: category ?? 'Other',
    hypothesis: hypothesis ?? '',
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
  db.experiments.create(experiment)
  res.status(201).json(experiment)
})

router.get('/:id', (req: Request, res: Response) => {
  const experiment = db.experiments.findById(req.params.id)
  if (!experiment) {
    res.status(404).json({ error: 'Experiment not found' })
    return
  }
  res.json(experiment)
})

router.patch('/:id/status', (req: Request, res: Response) => {
  const { status, resultSummary } = req.body
  if (!['pending', 'keep', 'discard', 'review'].includes(status)) {
    res.status(400).json({ error: 'Invalid status' })
    return
  }
  const updated = db.experiments.update(req.params.id, {
    status,
    resultSummary: resultSummary ?? undefined,
  })
  if (!updated) {
    res.status(404).json({ error: 'Experiment not found' })
    return
  }
  res.json(updated)
})

export default router
