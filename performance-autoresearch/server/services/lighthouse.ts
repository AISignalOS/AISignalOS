import type { Run } from '../../src/types/index.js'

interface LighthouseMetrics {
  performanceScore: number
  fcp: number
  lcp: number
  tbt: number
  cls: number
  speedIndex: number
}

interface LighthouseResult {
  success: boolean
  metrics?: LighthouseMetrics
  error?: string
  rawPath?: string
}

async function runLighthouse(url: string, deviceMode: 'mobile' | 'desktop'): Promise<LighthouseResult> {
  try {
    const chromeLauncher = await import('chrome-launcher')
    const lighthouse = await import('lighthouse')

    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'] })

    const formFactor = deviceMode === 'mobile' ? 'mobile' : 'desktop'
    const screenEmulation =
      deviceMode === 'mobile'
        ? { mobile: true, width: 375, height: 812, deviceScaleFactor: 2 }
        : { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1 }

    const options = {
      logLevel: 'silent' as const,
      output: 'json' as const,
      onlyCategories: ['performance'],
      port: chrome.port,
      formFactor,
      screenEmulation,
      throttlingMethod: 'simulate' as const,
    }

    const runnerResult = await lighthouse.default(url, options)

    await chrome.kill()

    if (!runnerResult || !runnerResult.lhr) {
      return { success: false, error: 'Lighthouse returned no results' }
    }

    const lhr = runnerResult.lhr
    const audits = lhr.audits

    const metrics: LighthouseMetrics = {
      performanceScore: Math.round((lhr.categories.performance?.score ?? 0) * 100),
      fcp: Math.round((audits['first-contentful-paint']?.numericValue ?? 0)),
      lcp: Math.round((audits['largest-contentful-paint']?.numericValue ?? 0)),
      tbt: Math.round((audits['total-blocking-time']?.numericValue ?? 0)),
      cls: parseFloat((audits['cumulative-layout-shift']?.numericValue ?? 0).toFixed(3)),
      speedIndex: Math.round((audits['speed-index']?.numericValue ?? 0)),
    }

    return { success: true, metrics }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes('No usable sandbox') || message.includes('chrome')) {
      return { success: false, error: `Chrome/Lighthouse error: ${message}. Try running with --no-sandbox flag or ensure Chrome is installed.` }
    }
    return { success: false, error: message }
  }
}

export async function runAudit(
  url: string,
  deviceMode: 'mobile' | 'desktop',
  runCount: number = 1
): Promise<LighthouseResult> {
  const results: LighthouseMetrics[] = []

  for (let i = 0; i < runCount; i++) {
    const result = await runLighthouse(url, deviceMode)
    if (!result.success || !result.metrics) {
      return result
    }
    results.push(result.metrics)
    if (i < runCount - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1500))
    }
  }

  if (results.length === 0) {
    return { success: false, error: 'No successful runs' }
  }

  // Average across multiple runs for stability
  const avg = (key: keyof LighthouseMetrics): number => {
    const sum = results.reduce((acc, r) => acc + r[key], 0)
    return sum / results.length
  }

  const metrics: LighthouseMetrics = {
    performanceScore: Math.round(avg('performanceScore')),
    fcp: Math.round(avg('fcp')),
    lcp: Math.round(avg('lcp')),
    tbt: Math.round(avg('tbt')),
    cls: parseFloat(avg('cls').toFixed(3)),
    speedIndex: Math.round(avg('speedIndex')),
  }

  return { success: true, metrics }
}

export function calculateDelta(current: number, baseline: number): number {
  return parseFloat((current - baseline).toFixed(3))
}

export function calculateImprovementPercent(
  current: number,
  baseline: number,
  metric: 'score' | 'lower-is-better'
): number {
  if (baseline === 0) return 0
  if (metric === 'score') {
    return parseFloat(((current - baseline) / baseline * 100).toFixed(1))
  }
  // For FCP, LCP, TBT, CLS, Speed Index: lower is better
  return parseFloat(((baseline - current) / baseline * 100).toFixed(1))
}

export function determineRunStatus(
  current: Pick<Run, 'performanceScore' | 'lcp' | 'fcp' | 'tbt'>,
  baseline: Pick<Run, 'performanceScore' | 'lcp' | 'fcp' | 'tbt'>
): 'keep' | 'discard' | 'review' {
  const scoreDelta = current.performanceScore - baseline.performanceScore
  const lcpImprovement = calculateImprovementPercent(current.lcp, baseline.lcp, 'lower-is-better')

  if (scoreDelta < -2) return 'discard'
  if (lcpImprovement >= 5) return 'keep'
  if (scoreDelta >= 2 && lcpImprovement >= 0) return 'keep'
  if (scoreDelta >= 0 && lcpImprovement >= 0) return 'keep'
  return 'review'
}
