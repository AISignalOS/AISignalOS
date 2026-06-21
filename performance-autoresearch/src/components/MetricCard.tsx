import { formatMs, formatScore, formatCLS, scoreColor } from '../lib/helpers'

interface MetricCardProps {
  label: string
  value: number | string
  format?: 'ms' | 'score' | 'cls' | 'raw'
  delta?: number
  deltaLabel?: string
  lowerIsBetter?: boolean
  compact?: boolean
  subLabel?: string
}

export default function MetricCard({
  label,
  value,
  format = 'raw',
  delta,
  compact = false,
  subLabel,
}: MetricCardProps) {
  const formatted =
    format === 'ms'
      ? formatMs(value as number)
      : format === 'score'
      ? formatScore(value as number)
      : format === 'cls'
      ? formatCLS(value as number)
      : String(value)

  const colorClass = format === 'score' && typeof value === 'number' ? scoreColor(value as number) : 'text-white'

  return (
    <div
      className={`bg-card border border-border rounded-lg ${compact ? 'p-3' : 'p-4'} flex flex-col gap-1 animate-fade-in`}
    >
      <span className="text-xs text-slate-500 uppercase tracking-wider font-mono">{label}</span>
      <span className={`font-mono font-bold ${compact ? 'text-xl' : 'text-2xl'} ${colorClass}`}>
        {formatted}
      </span>
      {subLabel && <span className="text-xs text-slate-500">{subLabel}</span>}
      {delta !== undefined && (
        <span
          className={`text-xs font-mono ${
            delta === 0 ? 'text-slate-500' : delta < 0 ? 'text-emerald-400' : 'text-red-400'
          }`}
        >
          {delta === 0 ? '—' : delta < 0 ? `▲ ${delta}` : `▼ +${delta}`}
        </span>
      )}
    </div>
  )
}
