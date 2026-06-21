import { statusColor } from '../lib/helpers'
import type { Run, Experiment } from '../types'

type Status = Run['status'] | Experiment['status']

interface StatusBadgeProps {
  status: Status
  size?: 'sm' | 'md'
}

const labels: Record<Status, string> = {
  baseline: 'Baseline',
  keep: 'Keep',
  discard: 'Discard',
  review: 'Review',
  pending: 'Pending',
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  return (
    <span
      className={`border rounded font-mono uppercase tracking-wider ${statusColor(status)} ${
        size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1'
      }`}
    >
      {labels[status]}
    </span>
  )
}
