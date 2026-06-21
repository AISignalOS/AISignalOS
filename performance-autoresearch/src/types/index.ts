export interface Project {
  id: string
  name: string
  url: string
  createdAt: string
  updatedAt: string
  notes?: string
  deviceMode: 'mobile' | 'desktop'
}

export interface Run {
  id: string
  projectId: string
  runNumber: number
  type: 'baseline' | 'experiment'
  experimentId?: string
  status: 'baseline' | 'keep' | 'discard' | 'review' | 'pending'
  createdAt: string
  performanceScore: number
  fcp: number
  lcp: number
  tbt: number
  cls: number
  speedIndex: number
  fileSizeKb?: number
  notes?: string
  rawLighthousePath?: string
  error?: string
}

export interface Experiment {
  id: string
  projectId: string
  name: string
  description: string
  category:
    | 'CSS'
    | 'JavaScript'
    | 'Images'
    | 'Fonts'
    | 'HTML'
    | 'Third-party scripts'
    | 'Layout/CLS'
    | 'Caching'
    | 'Other'
  hypothesis: string
  status: 'pending' | 'keep' | 'discard' | 'review'
  createdAt: string
  resultSummary?: string
}

export interface Comparison {
  baselineRunId: string
  currentRunId: string
  scoreDelta: number
  fcpDelta: number
  lcpDelta: number
  tbtDelta: number
  clsDelta: number
  speedIndexDelta: number
  improvementPercent: number
  suggestedStatus: 'keep' | 'discard' | 'review'
}

export interface AuditRequest {
  url: string
  projectId: string
  deviceMode: 'mobile' | 'desktop'
  experimentId?: string
  notes?: string
  runs?: number
}

export interface ProjectStats {
  project: Project
  baselineRun?: Run
  bestRun?: Run
  totalRuns: number
  keptRuns: number
  discardedRuns: number
  reviewRuns: number
  experiments: Experiment[]
  recentRuns: Run[]
}
