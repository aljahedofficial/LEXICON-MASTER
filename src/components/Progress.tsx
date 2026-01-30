'use client'

interface ProgressProps {
  value: number // 0-100
  className?: string
  showLabel?: boolean
}

export function Progress({ value, className = '', showLabel = false }: ProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value))

  return (
    <div className={`w-full ${className}`}>
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 transition-all duration-300"
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{clampedValue}%</p>}
    </div>
  )
}
