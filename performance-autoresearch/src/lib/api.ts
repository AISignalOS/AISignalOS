import axios from 'axios'
import type { Project, Run, Experiment, Comparison } from '../types'

const api = axios.create({ baseURL: '/api' })

export const projectsApi = {
  list: () => api.get<Project[]>('/projects').then((r) => r.data),
  get: (id: string) => api.get<Project>(`/projects/${id}`).then((r) => r.data),
  create: (data: { name: string; url: string; deviceMode: string; notes?: string }) =>
    api.post<Project>('/projects', data).then((r) => r.data),
  getRuns: (id: string) => api.get<Run[]>(`/projects/${id}/runs`).then((r) => r.data),
  getExperiments: (id: string) => api.get<Experiment[]>(`/projects/${id}/experiments`).then((r) => r.data),
  getStats: (id: string) =>
    api
      .get<{
        project: Project
        baselineRun?: Run
        bestRun?: Run
        totalRuns: number
        keptRuns: number
        discardedRuns: number
        reviewRuns: number
        experiments: Experiment[]
        recentRuns: Run[]
      }>(`/projects/${id}/stats`)
      .then((r) => r.data),
  getReport: (id: string) =>
    api
      .get<{
        project: Project
        baselineRun?: Run
        bestRun?: Run
        comparison: Comparison | null
        keptExperiments: Experiment[]
        discardedExperiments: Experiment[]
        runs: Run[]
        experiments: Experiment[]
      }>(`/projects/${id}/report`)
      .then((r) => r.data),
}

export const auditsApi = {
  runBaseline: (data: {
    url: string
    projectId: string
    deviceMode: string
    notes?: string
    runs?: number
  }) => api.post<{ run: Run; metrics: any }>('/audits/baseline/sync', data).then((r) => r.data),
  runExperiment: (data: {
    url: string
    projectId: string
    experimentId: string
    deviceMode: string
    notes?: string
    runs?: number
  }) =>
    api
      .post<{ run: Run; metrics: any; suggestedStatus: string }>('/audits/experiment', data)
      .then((r) => r.data),
  updateRunStatus: (id: string, status: string) =>
    api.patch<Run>(`/audits/runs/${id}/status`, { status }).then((r) => r.data),
}

export const experimentsApi = {
  create: (data: {
    projectId: string
    name: string
    description: string
    category: string
    hypothesis: string
  }) => api.post<Experiment>('/experiments', data).then((r) => r.data),
  get: (id: string) => api.get<Experiment>(`/experiments/${id}`).then((r) => r.data),
  updateStatus: (id: string, status: string, resultSummary?: string) =>
    api.patch<Experiment>(`/experiments/${id}/status`, { status, resultSummary }).then((r) => r.data),
}
