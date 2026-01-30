'use client'

import React from 'react'
import { Button } from './Button'
import { exportChartAsPng, exportChartAsSvg, exportChartDataAsCsv } from '@/lib/chartExport'

interface ChartControlsProps {
  containerRef: React.RefObject<HTMLDivElement>
  fileBaseName: string
  csvData?: Array<Record<string, string | number>>
  animationEnabled?: boolean
  onToggleAnimation?: () => void
}

export function ChartControls({
  containerRef,
  fileBaseName,
  csvData,
  animationEnabled,
  onToggleAnimation,
}: ChartControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          if (containerRef.current) {
            exportChartAsPng(containerRef.current, `${fileBaseName}.png`)
          }
        }}
      >
        Export PNG
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          if (containerRef.current) {
            exportChartAsSvg(containerRef.current, `${fileBaseName}.svg`)
          }
        }}
      >
        Export SVG
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          if (csvData) {
            exportChartDataAsCsv(csvData, `${fileBaseName}.csv`)
          }
        }}
        disabled={!csvData || csvData.length === 0}
      >
        Export CSV
      </Button>
      {onToggleAnimation && (
        <Button variant="outline" size="sm" onClick={onToggleAnimation}>
          {animationEnabled ? 'Disable Animations' : 'Enable Animations'}
        </Button>
      )}
    </div>
  )
}
