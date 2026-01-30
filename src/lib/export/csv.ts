import Papa from 'papaparse'

export interface CSVExportOptions {
  delimiter?: string
  includeHeaders?: boolean
  fileName?: string
}

export interface VocabularyData {
  word: string
  frequency: number
  definition?: string | null
  synonyms?: string[] | null
  antonyms?: string[] | null
  examples?: string[] | null
  partOfSpeech?: string | null
}

/**
 * Generate CSV content from vocabulary data
 */
export function generateCSV(
  data: VocabularyData[],
  options: CSVExportOptions = {}
): string {
  const { delimiter = ',', includeHeaders = true } = options

  // Transform data to flat structure
  const flatData = data.map((item) => ({
    Word: item.word,
    Frequency: item.frequency,
    'Part of Speech': item.partOfSpeech || '',
    Definition: item.definition || '',
    Synonyms: Array.isArray(item.synonyms) ? item.synonyms.join('; ') : '',
    Antonyms: Array.isArray(item.antonyms) ? item.antonyms.join('; ') : '',
    Examples: Array.isArray(item.examples) ? item.examples.join(' | ') : '',
  }))

  return Papa.unparse(flatData, {
    delimiter,
    header: includeHeaders,
    quotes: true,
  })
}

/**
 * Generate CSV for basic word list
 */
export function generateBasicCSV(
  data: Pick<VocabularyData, 'word' | 'frequency'>[],
  options: CSVExportOptions = {}
): string {
  const { delimiter = ',', includeHeaders = true } = options

  const flatData = data.map((item) => ({
    Word: item.word,
    Frequency: item.frequency,
  }))

  return Papa.unparse(flatData, {
    delimiter,
    header: includeHeaders,
    quotes: true,
  })
}

/**
 * Generate CSV with custom columns
 */
export function generateCustomCSV(
  data: Record<string, unknown>[],
  options: CSVExportOptions = {}
): string {
  const { delimiter = ',', includeHeaders = true } = options

  return Papa.unparse(data, {
    delimiter,
    header: includeHeaders,
    quotes: true,
  })
}

/**
 * Create downloadable CSV Blob
 */
export function createCSVBlob(csvContent: string): Blob {
  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
}

/**
 * Get default CSV filename
 */
export function getDefaultCSVFilename(projectName?: string): string {
  const timestamp = new Date().toISOString().split('T')[0]
  const baseName = projectName || 'vocabulary'
  return `${baseName}_export_${timestamp}.csv`
}
