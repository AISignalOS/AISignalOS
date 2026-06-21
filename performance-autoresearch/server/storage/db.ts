import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type { Project, Run, Experiment } from '../../src/types/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '../../data')

function readFile<T>(filename: string): T[] {
  const filePath = path.join(DATA_DIR, filename)
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]', 'utf-8')
    return []
  }
  const raw = fs.readFileSync(filePath, 'utf-8')
  try {
    return JSON.parse(raw) as T[]
  } catch {
    return []
  }
}

function writeFile<T>(filename: string, data: T[]): void {
  const filePath = path.join(DATA_DIR, filename)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

export const db = {
  projects: {
    findAll: (): Project[] => readFile<Project>('projects.json'),
    findById: (id: string): Project | undefined =>
      readFile<Project>('projects.json').find((p) => p.id === id),
    create: (project: Project): Project => {
      const projects = readFile<Project>('projects.json')
      projects.push(project)
      writeFile('projects.json', projects)
      return project
    },
    update: (id: string, data: Partial<Project>): Project | null => {
      const projects = readFile<Project>('projects.json')
      const idx = projects.findIndex((p) => p.id === id)
      if (idx === -1) return null
      projects[idx] = { ...projects[idx], ...data, updatedAt: new Date().toISOString() }
      writeFile('projects.json', projects)
      return projects[idx]
    },
    delete: (id: string): boolean => {
      const projects = readFile<Project>('projects.json')
      const filtered = projects.filter((p) => p.id !== id)
      if (filtered.length === projects.length) return false
      writeFile('projects.json', filtered)
      return true
    },
  },

  runs: {
    findAll: (): Run[] => readFile<Run>('runs.json'),
    findById: (id: string): Run | undefined =>
      readFile<Run>('runs.json').find((r) => r.id === id),
    findByProject: (projectId: string): Run[] =>
      readFile<Run>('runs.json')
        .filter((r) => r.projectId === projectId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    create: (run: Run): Run => {
      const runs = readFile<Run>('runs.json')
      runs.push(run)
      writeFile('runs.json', runs)
      return run
    },
    update: (id: string, data: Partial<Run>): Run | null => {
      const runs = readFile<Run>('runs.json')
      const idx = runs.findIndex((r) => r.id === id)
      if (idx === -1) return null
      runs[idx] = { ...runs[idx], ...data }
      writeFile('runs.json', runs)
      return runs[idx]
    },
  },

  experiments: {
    findAll: (): Experiment[] => readFile<Experiment>('experiments.json'),
    findById: (id: string): Experiment | undefined =>
      readFile<Experiment>('experiments.json').find((e) => e.id === id),
    findByProject: (projectId: string): Experiment[] =>
      readFile<Experiment>('experiments.json').filter((e) => e.projectId === projectId),
    create: (experiment: Experiment): Experiment => {
      const experiments = readFile<Experiment>('experiments.json')
      experiments.push(experiment)
      writeFile('experiments.json', experiments)
      return experiment
    },
    update: (id: string, data: Partial<Experiment>): Experiment | null => {
      const experiments = readFile<Experiment>('experiments.json')
      const idx = experiments.findIndex((e) => e.id === id)
      if (idx === -1) return null
      experiments[idx] = { ...experiments[idx], ...data }
      writeFile('experiments.json', experiments)
      return experiments[idx]
    },
  },
}
