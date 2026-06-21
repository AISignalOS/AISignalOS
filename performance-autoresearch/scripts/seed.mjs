/**
 * Seed script: Creates a demo project with realistic runs and experiments.
 * Run with: node scripts/seed.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '../data')

const projectId = 'demo-project-001'
const now = new Date()
const ago = (minutes) => new Date(now.getTime() - minutes * 60 * 1000).toISOString()

const project = {
  id: projectId,
  name: 'My Company Website',
  url: 'https://example.com',
  createdAt: ago(240),
  updatedAt: ago(5),
  notes: 'Main marketing site. Priority: LCP improvement.',
  deviceMode: 'mobile',
}

const experiments = [
  {
    id: 'exp-001',
    projectId,
    name: 'Defer non-critical scripts',
    description: 'Add defer to analytics and chat widget scripts',
    category: 'JavaScript',
    hypothesis: 'Deferring JS will reduce TBT and improve performance score significantly',
    status: 'keep',
    createdAt: ago(180),
    resultSummary: 'TBT reduced from 680ms to 210ms. Score +8 points.',
  },
  {
    id: 'exp-002',
    projectId,
    name: 'Convert hero image to WebP',
    description: 'Replace 480KB PNG hero with 89KB WebP',
    category: 'Images',
    hypothesis: 'WebP reduces image payload by ~80%, improving LCP directly',
    status: 'keep',
    createdAt: ago(120),
    resultSummary: 'LCP improved from 4.2s to 2.8s. Score +12 points.',
  },
  {
    id: 'exp-003',
    projectId,
    name: 'Add backdrop-filter blur to nav',
    description: 'Apply CSS backdrop-filter: blur(12px) to sticky nav',
    category: 'CSS',
    hypothesis: 'Blur filter will create a modern look with minimal performance impact',
    status: 'discard',
    createdAt: ago(90),
    resultSummary: 'Performance score dropped -4. backdrop-filter triggers GPU compositing.',
  },
  {
    id: 'exp-004',
    projectId,
    name: 'Preload hero image',
    description: 'Add <link rel="preload"> for the LCP hero image',
    category: 'Images',
    hypothesis: 'Preloading hero will directly improve LCP timing',
    status: 'pending',
    createdAt: ago(30),
  },
]

const runs = [
  {
    id: 'run-001',
    projectId,
    runNumber: 1,
    type: 'baseline',
    status: 'baseline',
    createdAt: ago(220),
    performanceScore: 38,
    fcp: 3100,
    lcp: 5800,
    tbt: 920,
    cls: 0.142,
    speedIndex: 4200,
    notes: 'Initial baseline before any optimizations',
  },
  {
    id: 'run-002',
    projectId,
    runNumber: 2,
    type: 'experiment',
    experimentId: 'exp-001',
    status: 'keep',
    createdAt: ago(170),
    performanceScore: 46,
    fcp: 2800,
    lcp: 5200,
    tbt: 210,
    cls: 0.138,
    speedIndex: 3800,
    notes: 'After deferring analytics & chat widget',
  },
  {
    id: 'run-003',
    projectId,
    runNumber: 3,
    type: 'experiment',
    experimentId: 'exp-002',
    status: 'keep',
    createdAt: ago(110),
    performanceScore: 58,
    fcp: 2400,
    lcp: 2800,
    tbt: 195,
    cls: 0.041,
    speedIndex: 2900,
    notes: 'After WebP hero image conversion',
  },
  {
    id: 'run-004',
    projectId,
    runNumber: 4,
    type: 'experiment',
    experimentId: 'exp-003',
    status: 'discard',
    createdAt: ago(80),
    performanceScore: 54,
    fcp: 2600,
    lcp: 3100,
    tbt: 240,
    cls: 0.038,
    speedIndex: 3100,
    notes: 'After adding backdrop-filter blur to nav — regression',
  },
]

fs.writeFileSync(path.join(DATA_DIR, 'projects.json'), JSON.stringify([project], null, 2))
fs.writeFileSync(path.join(DATA_DIR, 'experiments.json'), JSON.stringify(experiments, null, 2))
fs.writeFileSync(path.join(DATA_DIR, 'runs.json'), JSON.stringify(runs, null, 2))

console.log('✓ Demo data seeded successfully')
console.log('  Project:', project.name)
console.log('  Runs:', runs.length)
console.log('  Experiments:', experiments.length)
console.log('')
console.log('Open: http://localhost:5173/project/demo-project-001')
