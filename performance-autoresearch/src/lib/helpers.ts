import type { Run } from '../types'

export function formatMs(ms: number): string {
  if (ms === 0) return '--'
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.round(ms)}ms`
}

export function formatScore(score: number): string {
  if (score === 0) return '--'
  return score.toString()
}

export function formatCLS(cls: number): string {
  if (cls === 0 && cls.toString() !== '0') return '--'
  return cls.toFixed(3)
}

export function scoreColor(score: number): string {
  if (score >= 90) return 'text-emerald-400'
  if (score >= 50) return 'text-amber-400'
  return 'text-red-400'
}

export function scoreBg(score: number): string {
  if (score >= 90) return 'bg-emerald-400/10 border-emerald-400/20'
  if (score >= 50) return 'bg-amber-400/10 border-amber-400/20'
  return 'bg-red-400/10 border-red-400/20'
}

export function statusColor(status: Run['status']): string {
  switch (status) {
    case 'baseline': return 'text-signal-400 bg-signal-400/10 border-signal-400/30'
    case 'keep': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30'
    case 'discard': return 'text-red-400 bg-red-400/10 border-red-400/30'
    case 'review': return 'text-amber-400 bg-amber-400/10 border-amber-400/30'
    case 'pending': return 'text-slate-400 bg-slate-400/10 border-slate-400/30'
    default: return 'text-slate-400 bg-slate-400/10 border-slate-400/30'
  }
}

export function deltaColor(delta: number, lowerIsBetter = true): string {
  if (delta === 0) return 'text-slate-400'
  const improved = lowerIsBetter ? delta < 0 : delta > 0
  return improved ? 'text-emerald-400' : 'text-red-400'
}

export function formatDelta(delta: number, lowerIsBetter = true): string {
  if (delta === 0) return '—'
  const sign = delta > 0 ? '+' : ''
  const improved = lowerIsBetter ? delta < 0 : delta > 0
  const prefix = improved ? '▲ ' : '▼ '
  return `${prefix}${sign}${delta}`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function lcpRating(ms: number): 'good' | 'needs-improvement' | 'poor' {
  if (ms <= 2500) return 'good'
  if (ms <= 4000) return 'needs-improvement'
  return 'poor'
}

export function fcpRating(ms: number): 'good' | 'needs-improvement' | 'poor' {
  if (ms <= 1800) return 'good'
  if (ms <= 3000) return 'needs-improvement'
  return 'poor'
}

export function generateMarkdownReport(data: {
  project: { name: string; url: string }
  baselineRun?: Run
  bestRun?: Run
  comparison: any
  keptExperiments: any[]
  discardedExperiments: any[]
}): string {
  const { project, baselineRun, bestRun, comparison, keptExperiments, discardedExperiments } = data
  const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  let md = `# AISolutionsOS Performance Autoresearch Report\n\n`
  md += `**Project:** ${project.name}\n`
  md += `**URL:** ${project.url}\n`
  md += `**Date:** ${now}\n\n`
  md += `---\n\n`

  if (baselineRun) {
    md += `## Baseline\n\n`
    md += `| Metric | Value |\n|---|---|\n`
    md += `| Performance Score | ${baselineRun.performanceScore} |\n`
    md += `| FCP | ${formatMs(baselineRun.fcp)} |\n`
    md += `| LCP | ${formatMs(baselineRun.lcp)} |\n`
    md += `| TBT | ${formatMs(baselineRun.tbt)} |\n`
    md += `| CLS | ${formatCLS(baselineRun.cls)} |\n`
    md += `| Speed Index | ${formatMs(baselineRun.speedIndex)} |\n\n`
  }

  if (bestRun) {
    md += `## Best Result\n\n`
    md += `| Metric | Value |\n|---|---|\n`
    md += `| Performance Score | ${bestRun.performanceScore} |\n`
    md += `| FCP | ${formatMs(bestRun.fcp)} |\n`
    md += `| LCP | ${formatMs(bestRun.lcp)} |\n`
    md += `| TBT | ${formatMs(bestRun.tbt)} |\n`
    md += `| CLS | ${formatCLS(bestRun.cls)} |\n`
    md += `| Speed Index | ${formatMs(bestRun.speedIndex)} |\n\n`
  }

  if (comparison) {
    md += `## Improvements\n\n`
    md += `| Metric | Delta |\n|---|---|\n`
    md += `| Score | ${comparison.scoreDelta > 0 ? '+' : ''}${comparison.scoreDelta} pts |\n`
    md += `| FCP | ${comparison.fcpDelta > 0 ? '+' : ''}${formatMs(comparison.fcpDelta)} |\n`
    md += `| LCP | ${comparison.lcpDelta > 0 ? '+' : ''}${formatMs(comparison.lcpDelta)} |\n`
    md += `| TBT | ${comparison.tbtDelta > 0 ? '+' : ''}${formatMs(comparison.tbtDelta)} |\n`
    md += `| CLS | ${comparison.clsDelta.toFixed(3)} |\n`
    md += `| Speed Index | ${comparison.speedIndexDelta > 0 ? '+' : ''}${formatMs(comparison.speedIndexDelta)} |\n\n`
  }

  if (keptExperiments.length > 0) {
    md += `## Kept Experiments\n\n`
    keptExperiments.forEach((e) => {
      md += `- **${e.name}** (${e.category})\n`
      if (e.resultSummary) md += `  - ${e.resultSummary}\n`
    })
    md += '\n'
  }

  if (discardedExperiments.length > 0) {
    md += `## Discarded Experiments\n\n`
    discardedExperiments.forEach((e) => {
      md += `- **${e.name}** (${e.category})\n`
      if (e.resultSummary) md += `  - ${e.resultSummary}\n`
    })
    md += '\n'
  }

  md += `## Next Recommended Moves\n\n`
  md += `- Review LCP opportunities in Lighthouse suggestions\n`
  md += `- Audit and defer non-critical JavaScript\n`
  md += `- Optimize and compress images (WebP/AVIF)\n`
  md += `- Implement font-display: swap for web fonts\n`
  md += `- Review third-party script impact on TBT\n`
  md += `- Set explicit width/height on all images to prevent CLS\n`
  md += `- Run 3-5 audits per experiment for statistical stability\n\n`
  md += `---\n\n`
  md += `*Generated by AISolutionsOS Performance Autoresearch — SignalSpeed Lab*\n`

  return md
}

export const EXPERIMENT_TEMPLATES = [
  {
    category: 'CSS',
    name: 'Remove unused CSS',
    description: 'Identify and remove unused CSS rules using coverage analysis',
    hypothesis: 'Removing unused CSS will reduce render-blocking time and improve FCP/LCP',
  },
  {
    category: 'CSS',
    name: 'Inline critical CSS',
    description: 'Inline above-the-fold CSS in <head> and defer the rest',
    hypothesis: 'Inlining critical CSS eliminates render-blocking requests and improves FCP',
  },
  {
    category: 'JavaScript',
    name: 'Defer non-critical scripts',
    description: 'Add defer or async to non-critical JavaScript files',
    hypothesis: 'Deferring JS will reduce TBT and improve performance score significantly',
  },
  {
    category: 'JavaScript',
    name: 'Remove unused JavaScript',
    description: 'Audit JS bundles and tree-shake or code-split unused modules',
    hypothesis: 'Smaller JS bundles reduce parse/execute time, improving TBT and LCP',
  },
  {
    category: 'Images',
    name: 'Convert images to WebP/AVIF',
    description: 'Convert JPEG/PNG images to modern formats for better compression',
    hypothesis: 'WebP/AVIF reduces image payload by 30-80%, improving LCP directly',
  },
  {
    category: 'Images',
    name: 'Lazy-load below-fold images',
    description: 'Add loading="lazy" to images not visible on initial load',
    hypothesis: 'Lazy loading reduces initial page weight and speeds up LCP',
  },
  {
    category: 'Images',
    name: 'Preload hero image',
    description: 'Add <link rel="preload"> for the LCP hero image',
    hypothesis: 'Preloading the hero image will directly improve LCP timing',
  },
  {
    category: 'Fonts',
    name: 'Add font-display: swap',
    description: 'Set font-display: swap on all @font-face declarations',
    hypothesis: 'Font swap prevents FOIT (flash of invisible text) and improves FCP',
  },
  {
    category: 'Fonts',
    name: 'Replace external font with system stack',
    description: 'Remove Google Fonts dependency and use system font stack',
    hypothesis: 'Eliminating external font requests removes a render-blocking dependency',
  },
  {
    category: 'Third-party scripts',
    name: 'Delay third-party scripts',
    description: 'Load analytics, chat widgets, and tracking scripts after page load',
    hypothesis: 'Third-party scripts on main thread are major TBT contributors',
  },
  {
    category: 'Layout/CLS',
    name: 'Reserve space for dynamic content',
    description: 'Add explicit dimensions for ads, embeds, and dynamically loaded content',
    hypothesis: 'Setting reserved space prevents layout shifts and improves CLS to <0.1',
  },
  {
    category: 'Caching',
    name: 'Add aggressive cache headers',
    description: 'Set Cache-Control: max-age=31536000 for static assets',
    hypothesis: 'Long cache TTL for static assets reduces repeat visit load times',
  },
] as const
