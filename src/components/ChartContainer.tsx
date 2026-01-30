'use client'

import { Legend, Tooltip } from 'recharts'

const TOOLTIP_STYLE = {
  backgroundColor: '#1f2937',
  border: 'none',
  borderRadius: '0.5rem',
  color: '#f3f4f6',
}

export function ChartTooltip() {
  return <Tooltip contentStyle={TOOLTIP_STYLE} />
}

export function ChartLegend() {
  return <Legend wrapperStyle={{ fontSize: '0.75rem', color: '#6b7280' }} />
}

export function ChartEmptyState({ message = 'No data available' }: { message?: string }) {
  return <div className="flex items-center justify-center h-64 text-gray-500">{message}</div>
}
