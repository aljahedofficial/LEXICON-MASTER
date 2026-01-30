import JSZip from 'jszip'
import { VocabularyData } from './csv'
import { ProjectMetadata, AnalyticsData } from './excel'

export interface JSONExportOptions {
  fileName?: string
  prettify?: boolean
  includeMetadata?: boolean
  includeAnalytics?: boolean
}

export interface LearningPackageData {
  flashcards: Array<{
    front: string
    back: string
    examples?: string[]
    synonyms?: string[]
  }>
  quizQuestions: Array<{
    type: string
    question: string
    options: string[]
    correctAnswer: string
    explanation?: string
  }>
}

/**
 * Generate JSON export from vocabulary data
 */
export function generateJSON(
  data: VocabularyData[],
  metadata?: ProjectMetadata,
  analytics?: AnalyticsData,
  options: JSONExportOptions = {}
): string {
  const { prettify = true, includeMetadata = false, includeAnalytics = false } = options

  const exportData: Record<string, unknown> = {
    vocabulary: data,
  }

  if (includeMetadata && metadata) {
    exportData.metadata = {
      projectName: metadata.projectName,
      sourceCount: metadata.sourceCount,
      totalWords: metadata.totalWords,
      uniqueWords: metadata.uniqueWords,
      createdAt: metadata.createdAt.toISOString(),
      exportedAt: new Date().toISOString(),
    }
  }

  if (includeAnalytics && analytics) {
    exportData.analytics = analytics
  }

  return JSON.stringify(exportData, null, prettify ? 2 : 0)
}

/**
 * Generate learning package JSON
 */
export function generateLearningPackageJSON(data: VocabularyData[]): LearningPackageData {
  // Generate flashcards
  const flashcards = data.map((item) => ({
    front: item.word,
    back: item.definition || 'No definition available',
    examples: item.examples || [],
    synonyms: item.synonyms || [],
  }))

  // Generate quiz questions
  const quizQuestions = data.slice(0, 50).map((item, index) => {
    // Create wrong answers from other words
    const wrongAnswers = data
      .filter((_, i) => i !== index)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((w) => w.definition || 'Alternative definition')

    return {
      type: 'multiple_choice',
      question: `What is the definition of "${item.word}"?`,
      options: [item.definition || 'No definition', ...wrongAnswers].sort(() => Math.random() - 0.5),
      correctAnswer: item.definition || 'No definition',
      explanation: item.examples?.[0] || '',
    }
  })

  return {
    flashcards,
    quizQuestions,
  }
}

/**
 * Create learning package ZIP file
 */
export async function createLearningPackageZIP(
  vocabularyData: VocabularyData[],
  projectName: string
): Promise<Blob> {
  const zip = new JSZip()

  // Add vocabulary JSON
  const vocabJSON = JSON.stringify(vocabularyData, null, 2)
  zip.file('vocabulary.json', vocabJSON)

  // Add learning package JSON
  const learningPackage = generateLearningPackageJSON(vocabularyData)
  zip.file('flashcards.json', JSON.stringify(learningPackage.flashcards, null, 2))
  zip.file('quiz_questions.json', JSON.stringify(learningPackage.quizQuestions, null, 2))

  // Add README
  const readme = `# ${projectName} - Learning Package

This package contains:

1. **vocabulary.json**: Complete vocabulary list with all data
2. **flashcards.json**: Flashcard data for study
3. **quiz_questions.json**: Quiz questions for practice

## Import Instructions

### Flashcards
Import flashcards.json into your learning application or use with LEXICON MASTER.

### Quizzes
Use quiz_questions.json to practice vocabulary in quiz mode.

Generated on: ${new Date().toLocaleDateString()}
`
  zip.file('README.md', readme)

  // Add Anki import format (TSV)
  const ankiData = vocabularyData
    .map((item) => {
      const front = item.word
      const back = [
        item.definition || '',
        item.synonyms?.length ? `<br><b>Synonyms:</b> ${item.synonyms.join(', ')}` : '',
        item.examples?.[0] ? `<br><b>Example:</b> ${item.examples[0]}` : '',
      ]
        .filter(Boolean)
        .join('')

      return `${front}\t${back}`
    })
    .join('\n')

  zip.file('anki_import.txt', ankiData)

  return await zip.generateAsync({ type: 'blob' })
}

/**
 * Create batch export ZIP with multiple formats
 */
export async function createBatchExportZIP(
  files: Array<{ name: string; content: Blob | string }>,
  projectName: string
): Promise<Blob> {
  const zip = new JSZip()

  for (const file of files) {
    zip.file(file.name, file.content)
  }

  // Add export manifest
  const manifest = {
    projectName,
    exportDate: new Date().toISOString(),
    files: files.map((f) => f.name),
    fileCount: files.length,
  }

  zip.file('export_manifest.json', JSON.stringify(manifest, null, 2))

  return await zip.generateAsync({ type: 'blob' })
}

/**
 * Create downloadable JSON Blob
 */
export function createJSONBlob(jsonContent: string): Blob {
  return new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
}

/**
 * Get default JSON filename
 */
export function getDefaultJSONFilename(projectName?: string): string {
  const timestamp = new Date().toISOString().split('T')[0]
  const baseName = projectName || 'vocabulary'
  return `${baseName}_export_${timestamp}.json`
}

/**
 * Get default ZIP filename
 */
export function getDefaultZIPFilename(projectName?: string, packageType: string = 'package'): string {
  const timestamp = new Date().toISOString().split('T')[0]
  const baseName = projectName || 'vocabulary'
  return `${baseName}_${packageType}_${timestamp}.zip`
}
