interface LoadingSpinnerProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function LoadingSpinner({ message, size = 'md' }: LoadingSpinnerProps) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-10 h-10' : 'w-6 h-6'

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeClass} rounded-full border-2 border-signal-600/30 border-t-signal-500 animate-spin`}
      />
      {message && <p className="text-sm text-slate-400 font-mono">{message}</p>}
    </div>
  )
}
