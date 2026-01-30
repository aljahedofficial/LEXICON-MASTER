import * as XLSX from 'xlsx'
import { VocabularyData } from './csv'

export interface ExcelExportOptions {
  fileName?: string
  includeMetadata?: boolean
  includeAnalytics?: boolean
}

export interface ProjectMetadata {
  projectName: string
  sourceCount: number
  totalWords: number
  uniqueWords: number
  createdAt: Date
}

export interface AnalyticsData {
  averageFrequency: number
  medianFrequency: number
  topWords: Array<{ word: string; frequency: number }>
  categoryBreakdown?: Record<string, number>
}

/**
 * Generate Excel workbook from vocabulary data
 */
export function generateExcel(
  data: VocabularyData[],
  metadata?: ProjectMetadata,
  analytics?: AnalyticsData,
  options: ExcelExportOptions = {}
): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new()

  // Vocabulary sheet
  const vocabularyData = data.map((item) => ({
    Word: item.word,
    Frequency: item.frequency,
    'Part of Speech': item.partOfSpeech || '',
    Definition: item.definition || '',
    Synonyms: Array.isArray(item.synonyms) ? item.synonyms.join(', ') : '',
    Antonyms: Array.isArray(item.antonyms) ? item.antonyms.join(', ') : '',
    Examples: Array.isArray(item.examples) ? item.examples.slice(0, 2).join(' | ') : '',
  }))

  const vocabularySheet = XLSX.utils.json_to_sheet(vocabularyData)
  
  // Set column widths
  vocabularySheet['!cols'] = [
    { wch: 20 }, // Word
    { wch: 10 }, // Frequency
    { wch: 15 }, // Part of Speech
    { wch: 40 }, // Definition
    { wch: 30 }, // Synonyms
    { wch: 30 }, // Antonyms
    { wch: 50 }, // Examples
  ]

  XLSX.utils.book_append_sheet(workbook, vocabularySheet, 'Vocabulary')

  // Metadata sheet
  if (options.includeMetadata && metadata) {
    const metadataData = [
      { Field: 'Project Name', Value: metadata.projectName },
      { Field: 'Number of Sources', Value: metadata.sourceCount },
      { Field: 'Total Words', Value: metadata.totalWords },
      { Field: 'Unique Words', Value: metadata.uniqueWords },
      { Field: 'Created At', Value: metadata.createdAt.toISOString() },
    ]
    const metadataSheet = XLSX.utils.json_to_sheet(metadataData)
    metadataSheet['!cols'] = [{ wch: 20 }, { wch: 40 }]
    XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Metadata')
  }

  // Analytics sheet
  if (options.includeAnalytics && analytics) {
    const analyticsData = [
      { Metric: 'Average Frequency', Value: analytics.averageFrequency.toFixed(2) },
      { Metric: 'Median Frequency', Value: analytics.medianFrequency.toFixed(2) },
      { Metric: 'Top Word', Value: analytics.topWords[0]?.word || 'N/A' },
      { Metric: 'Top Word Frequency', Value: analytics.topWords[0]?.frequency || 0 },
    ]
    const analyticsSheet = XLSX.utils.json_to_sheet(analyticsData)
    analyticsSheet['!cols'] = [{ wch: 25 }, { wch: 20 }]
    XLSX.utils.book_append_sheet(workbook, analyticsSheet, 'Analytics')

    // Top 20 words sheet
    if (analytics.topWords.length > 0) {
      const topWordsData = analytics.topWords.slice(0, 20).map((item, index) => ({
        Rank: index + 1,
        Word: item.word,
        Frequency: item.frequency,
      }))
      const topWordsSheet = XLSX.utils.json_to_sheet(topWordsData)
      topWordsSheet['!cols'] = [{ wch: 8 }, { wch: 20 }, { wch: 12 }]
      XLSX.utils.book_append_sheet(workbook, topWordsSheet, 'Top 20 Words')
    }
  }

  // Frequency distribution sheet
  const frequencyGroups = generateFrequencyDistribution(data)
  const frequencyData = Object.entries(frequencyGroups).map(([range, count]) => ({
    'Frequency Range': range,
    'Word Count': count,
  }))
  const frequencySheet = XLSX.utils.json_to_sheet(frequencyData)
  frequencySheet['!cols'] = [{ wch: 20 }, { wch: 12 }]
  XLSX.utils.book_append_sheet(workbook, frequencySheet, 'Frequency Distribution')

  return workbook
}

/**
 * Generate frequency distribution data
 */
function generateFrequencyDistribution(data: VocabularyData[]): Record<string, number> {
  const groups: Record<string, number> = {
    '1': 0,
    '2-5': 0,
    '6-10': 0,
    '11-20': 0,
    '21-50': 0,
    '51-100': 0,
    '100+': 0,
  }

  data.forEach((item) => {
    const freq = item.frequency
    if (freq === 1) groups['1']++
    else if (freq <= 5) groups['2-5']++
    else if (freq <= 10) groups['6-10']++
    else if (freq <= 20) groups['11-20']++
    else if (freq <= 50) groups['21-50']++
    else if (freq <= 100) groups['51-100']++
    else groups['100+']++
  })

  return groups
}

/**
 * Write Excel workbook to binary string
 */
export function workbookToBinary(workbook: XLSX.WorkBook): string {
  return XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' })
}

/**
 * Convert binary string to array buffer
 */
export function stringToArrayBuffer(s: string): ArrayBuffer {
  const buf = new ArrayBuffer(s.length)
  const view = new Uint8Array(buf)
  for (let i = 0; i < s.length; i++) {
    view[i] = s.charCodeAt(i) & 0xff
  }
  return buf
}

/**
 * Create downloadable Excel Blob
 */
export function createExcelBlob(workbook: XLSX.WorkBook): Blob {
  const binary = workbookToBinary(workbook)
  const buffer = stringToArrayBuffer(binary)
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

/**
 * Get default Excel filename
 */
export function getDefaultExcelFilename(projectName?: string): string {
  const timestamp = new Date().toISOString().split('T')[0]
  const baseName = projectName || 'vocabulary'
  return `${baseName}_export_${timestamp}.xlsx`
}
