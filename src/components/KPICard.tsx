import React from 'react'

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  trend?: {
    direction: 'up' | 'down'
    percentage: number
  }
  variant?: 'primary' | 'secondary' | 'success' | 'warning'
}

export function KPICard({ title, value, subtitle, icon, trend, variant = 'primary' }: KPICardProps) {
  const bgClass = {
    primary: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    secondary: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
  }[variant]

  const textColorClass = {
    primary: 'text-blue-900 dark:text-blue-100',
    secondary: 'text-purple-900 dark:text-purple-100',
    success: 'text-green-900 dark:text-green-100',
    warning: 'text-amber-900 dark:text-amber-100',
  }[variant]

  return (
    <div className={`rounded-lg border p-6 ${bgClass}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className={`mt-2 text-3xl font-bold ${textColorClass}`}>{value}</p>
          {subtitle && <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">{subtitle}</p>}
        </div>
        {(icon || trend) && (
          <div className="flex flex-col items-end gap-2">
            {icon && <div className="text-2xl">{icon}</div>}
            {trend && (
              <div
                className={`flex items-center gap-1 text-sm font-semibold ${
                  trend.direction === 'up'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {trend.direction === 'up' ? '↑' : '↓'} {trend.percentage}%
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

interface KPIGridProps {
  children: React.ReactNode
}

export function KPIGrid({ children }: KPIGridProps) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
}
