'use client'

import { useState } from 'react'
import { Button } from './Button'
import { Card } from './Card'

export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json' | 'learning-package' | 'learning-pdf'

interface ExportOption {
  format: ExportFormat
  name: string
  description: string
  icon: string
  fileExtension: string
}

const exportOptions: ExportOption[] = [
  {
    format: 'csv',
    name: 'CSV',
    description: 'Comma-separated values, compatible with Excel and spreadsheet apps',
    icon: '📊',
    fileExtension: '.csv',
  },
  {
    format: 'excel',
    name: 'Excel',
    description: 'Multi-sheet workbook with vocabulary, analytics, and frequency distribution',
    icon: '📗',
    fileExtension: '.xlsx',
  },
  {
    format: 'pdf',
    name: 'PDF Report',
    description: 'Professional report with statistics and top words table',
    icon: '📄',
    fileExtension: '.pdf',
  },
  {
    format: 'learning-pdf',
    name: 'Study Guide (PDF)',
    description: 'Learning-focused PDF with definitions, examples, and synonyms',
    icon: '📚',
    fileExtension: '.pdf',
  },
  {
    format: 'json',
    name: 'JSON',
    description: 'Raw data format for developers and custom applications',
    icon: '💾',
    fileExtension: '.json',
  },
  {
    format: 'learning-package',
    name: 'Learning Package',
    description: 'ZIP with flashcards, quizzes, and Anki import file',
    icon: '📦',
    fileExtension: '.zip',
  },
]

interface ExportSelectorProps {
  projectId: string
  projectName: string
  onExportStart?: () => void
  onExportComplete?: () => void
  onExportError?: (error: string) => void
}

export function ExportSelector({
  projectId,
  projectName,
  onExportStart,
  onExportComplete,
  onExportError,
}: ExportSelectorProps) {
  const [selectedFormats, setSelectedFormats] = useState<ExportFormat[]>([])
  const [isExporting, setIsExporting] = useState(false)
  const [includeMetadata, setIncludeMetadata] = useState(true)
  const [includeAnalytics, setIncludeAnalytics] = useState(true)

  const toggleFormat = (format: ExportFormat) => {
    setSelectedFormats((prev) =>
      prev.includes(format) ? prev.filter((f) => f !== format) : [...prev, format]
    )
  }

  const handleExport = async (format?: ExportFormat) => {
    setIsExporting(true)
    onExportStart?.()

    try {
      const body = format
        ? { projectId, format, includeMetadata, includeAnalytics }
        : { projectId, formats: selectedFormats, includeMetadata, includeAnalytics }

      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename =
        contentDisposition?.match(/filename="(.+)"/)?.[1] ||
        `${projectName}_export_${Date.now()}${format ? `.${exportOptions.find((o) => o.format === format)?.fileExtension}` : '.zip'}`

      // Download file
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      onExportComplete?.()
    } catch (error) {
      console.error('Export error:', error)
      onExportError?.(error instanceof Error ? error.message : 'Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  const handleBatchExport = () => {
    if (selectedFormats.length === 0) {
      onExportError?.('Please select at least one format')
      return
    }
    handleExport()
  }

  return (
    <div className="space-y-6">
      {/* Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exportOptions.map((option) => {
          const isSelected = selectedFormats.includes(option.format)
          return (
            <Card
              key={option.format}
              variant={isSelected ? 'elevated' : 'default'}
              className={`cursor-pointer transition-all ${
                isSelected
                  ? 'ring-2 ring-primary border-primary'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => toggleFormat(option.format)}
            >
              <div className="flex items-start space-x-3 p-4">
                <div className="text-3xl">{option.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">{option.name}</h3>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleFormat(option.format)}
                      className="w-4 h-4 text-primary"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted-foreground">{option.fileExtension}</span>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleExport(option.format)
                      }}
                      disabled={isExporting}
                    >
                      Export
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Export Options */}
      <Card>
        <div className="p-4 space-y-4">
          <h3 className="font-semibold text-foreground">Export Options</h3>
          
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={includeMetadata}
                onChange={(e) => setIncludeMetadata(e.target.checked)}
                className="w-4 h-4 text-primary"
              />
              <span className="text-sm text-foreground">Include project metadata</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={includeAnalytics}
                onChange={(e) => setIncludeAnalytics(e.target.checked)}
                className="w-4 h-4 text-primary"
              />
              <span className="text-sm text-foreground">Include analytics data</span>
            </label>
          </div>
        </div>
      </Card>

      {/* Batch Export */}
      {selectedFormats.length > 1 && (
        <Card variant="elevated">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">Batch Export</h3>
                <p className="text-sm text-muted-foreground">
                  Export {selectedFormats.length} formats as a ZIP file
                </p>
              </div>
              <Button onClick={handleBatchExport} disabled={isExporting}>
                {isExporting ? 'Exporting...' : 'Export All'}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
