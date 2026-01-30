import { generateCSV, createCSVBlob, getDefaultCSVFilename, VocabularyData } from './csv'
import {
  generateExcel,
  createExcelBlob,
  getDefaultExcelFilename,
  ProjectMetadata,
  AnalyticsData,
} from './excel'
import { generatePDF, generateLearningPDF, createPDFBlob, getDefaultPDFFilename } from './pdf'
import {
  generateJSON,
  createJSONBlob,
  getDefaultJSONFilename,
  createLearningPackageZIP,
  createBatchExportZIP,
  getDefaultZIPFilename,
} from './json'

export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json' | 'learning-package' | 'learning-pdf'

export interface ExportOptions {
  format: ExportFormat
  fileName?: string
  includeMetadata?: boolean
  includeAnalytics?: boolean
  includeTopWords?: number
  prettifyJSON?: boolean
}

export interface ExportResult {
  blob: Blob
  fileName: string
  mimeType: string
}

/**
 * Main export function - handles all export formats
 */
export async function exportVocabulary(
  data: VocabularyData[],
  projectName: string,
  metadata?: ProjectMetadata,
  analytics?: AnalyticsData,
  options: ExportOptions = { format: 'csv' }
): Promise<ExportResult> {
  const { format, fileName, includeMetadata = true, includeAnalytics = true } = options

  switch (format) {
    case 'csv': {
      const csvContent = generateCSV(data)
      const blob = createCSVBlob(csvContent)
      const defaultFileName = fileName || getDefaultCSVFilename(projectName)
      return {
        blob,
        fileName: defaultFileName,
        mimeType: 'text/csv',
      }
    }

    case 'excel': {
      const workbook = generateExcel(data, metadata, analytics, {
        includeMetadata,
        includeAnalytics,
      })
      const blob = createExcelBlob(workbook)
      const defaultFileName = fileName || getDefaultExcelFilename(projectName)
      return {
        blob,
        fileName: defaultFileName,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }
    }

    case 'pdf': {
      const doc = generatePDF(data, metadata, analytics, {
        includeMetadata,
        includeAnalytics,
        includeTopWords: options.includeTopWords || 50,
      })
      const blob = createPDFBlob(doc)
      const defaultFileName = fileName || getDefaultPDFFilename(projectName, 'report')
      return {
        blob,
        fileName: defaultFileName,
        mimeType: 'application/pdf',
      }
    }

    case 'learning-pdf': {
      const doc = generateLearningPDF(data, projectName)
      const blob = createPDFBlob(doc)
      const defaultFileName = fileName || getDefaultPDFFilename(projectName, 'study-guide')
      return {
        blob,
        fileName: defaultFileName,
        mimeType: 'application/pdf',
      }
    }

    case 'json': {
      const jsonContent = generateJSON(data, metadata, analytics, {
        prettify: options.prettifyJSON !== false,
        includeMetadata,
        includeAnalytics,
      })
      const blob = createJSONBlob(jsonContent)
      const defaultFileName = fileName || getDefaultJSONFilename(projectName)
      return {
        blob,
        fileName: defaultFileName,
        mimeType: 'application/json',
      }
    }

    case 'learning-package': {
      const blob = await createLearningPackageZIP(data, projectName)
      const defaultFileName = fileName || getDefaultZIPFilename(projectName, 'learning-package')
      return {
        blob,
        fileName: defaultFileName,
        mimeType: 'application/zip',
      }
    }

    default:
      throw new Error(`Unsupported export format: ${format}`)
  }
}

/**
 * Export multiple formats at once
 */
export async function exportMultipleFormats(
  data: VocabularyData[],
  projectName: string,
  formats: ExportFormat[],
  metadata?: ProjectMetadata,
  analytics?: AnalyticsData
): Promise<ExportResult> {
  const files: Array<{ name: string; content: Blob }> = []

  for (const format of formats) {
    const result = await exportVocabulary(data, projectName, metadata, analytics, { format })
    files.push({
      name: result.fileName,
      content: result.blob,
    })
  }

  const zipBlob = await createBatchExportZIP(files, projectName)
  const zipFileName = getDefaultZIPFilename(projectName, 'batch-export')

  return {
    blob: zipBlob,
    fileName: zipFileName,
    mimeType: 'application/zip',
  }
}

/**
 * Download file in browser
 */
export function downloadFile(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Calculate export file size estimate
 */
export function estimateExportSize(data: VocabularyData[], format: ExportFormat): string {
  const dataSize = JSON.stringify(data).length

  let multiplier = 1
  switch (format) {
    case 'csv':
      multiplier = 0.5
      break
    case 'excel':
      multiplier = 1.5
      break
    case 'pdf':
      multiplier = 2
      break
    case 'json':
      multiplier = 1.2
      break
    case 'learning-package':
      multiplier = 3
      break
    case 'learning-pdf':
      multiplier = 2.5
      break
  }

  const estimatedBytes = dataSize * multiplier

  if (estimatedBytes < 1024) {
    return `${Math.round(estimatedBytes)} B`
  } else if (estimatedBytes < 1024 * 1024) {
    return `${(estimatedBytes / 1024).toFixed(1)} KB`
  } else {
    return `${(estimatedBytes / (1024 * 1024)).toFixed(1)} MB`
  }
}

// Re-export types
export type { VocabularyData, ProjectMetadata, AnalyticsData }
