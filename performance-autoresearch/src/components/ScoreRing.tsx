interface ScoreRingProps {
  score: number
  size?: number
}

export default function ScoreRing({ score, size = 80 }: ScoreRingProps) {
  const radius = (size - 10) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const color =
    score >= 90 ? '#34d399' : score >= 50 ? '#fbbf24' : '#f87171'

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1e2d47"
          strokeWidth={6}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <span
        className="absolute font-mono font-bold"
        style={{ fontSize: size * 0.22, color }}
      >
        {score === 0 ? '--' : score}
      </span>
    </div>
  )
}
