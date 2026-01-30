import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { VocabularyData } from './csv'
import { ProjectMetadata, AnalyticsData } from './excel'

export interface PDFExportOptions {
  fileName?: string
  includeMetadata?: boolean
  includeAnalytics?: boolean
  includeTopWords?: number // Top N words to include
  format?: 'letter' | 'a4'
  orientation?: 'portrait' | 'landscape'
}

/**
 * Generate PDF report from vocabulary data
 */
export function generatePDF(
  data: VocabularyData[],
  metadata?: ProjectMetadata,
  analytics?: AnalyticsData,
  options: PDFExportOptions = {}
): jsPDF {
  const {
    format = 'letter',
    orientation = 'portrait',
    includeMetadata = true,
    includeAnalytics = true,
    includeTopWords = 50,
  } = options

  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format,
  })

  let yPosition = 20

  // Title page
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('Vocabulary Analysis Report', doc.internal.pageSize.getWidth() / 2, yPosition, {
    align: 'center',
  })

  yPosition += 15
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(
    `Generated on ${new Date().toLocaleDateString()}`,
    doc.internal.pageSize.getWidth() / 2,
    yPosition,
    { align: 'center' }
  )

  // Metadata section
  if (includeMetadata && metadata) {
    yPosition += 20
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Project Information', 20, yPosition)

    yPosition += 10
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')

    const metadataLines = [
      `Project Name: ${metadata.projectName}`,
      `Number of Sources: ${metadata.sourceCount}`,
      `Total Words: ${metadata.totalWords.toLocaleString()}`,
      `Unique Words: ${metadata.uniqueWords.toLocaleString()}`,
      `Created: ${metadata.createdAt.toLocaleDateString()}`,
    ]

    metadataLines.forEach((line) => {
      doc.text(line, 20, yPosition)
      yPosition += 7
    })
  }

  // Analytics section
  if (includeAnalytics && analytics) {
    yPosition += 10
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Statistical Summary', 20, yPosition)

    yPosition += 10
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')

    const analyticsLines = [
      `Average Frequency: ${analytics.averageFrequency.toFixed(2)}`,
      `Median Frequency: ${analytics.medianFrequency.toFixed(2)}`,
      `Most Frequent Word: ${analytics.topWords[0]?.word || 'N/A'} (${analytics.topWords[0]?.frequency || 0} occurrences)`,
    ]

    analyticsLines.forEach((line) => {
      doc.text(line, 20, yPosition)
      yPosition += 7
    })
  }

  // Top words table
  doc.addPage()
  yPosition = 20

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(`Top ${includeTopWords} Words by Frequency`, 20, yPosition)

  yPosition += 10

  const topWords = data.slice(0, includeTopWords)
  const tableData = topWords.map((item, index) => [
    (index + 1).toString(),
    item.word,
    item.frequency.toString(),
    item.partOfSpeech || '',
    (item.definition || '').substring(0, 100) + ((item.definition?.length || 0) > 100 ? '...' : ''),
  ])

  autoTable(doc, {
    startY: yPosition,
    head: [['#', 'Word', 'Freq', 'POS', 'Definition']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [26, 42, 74], // Primary color
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 30 },
      2: { cellWidth: 15 },
      3: { cellWidth: 15 },
      4: { cellWidth: 'auto' },
    },
  })

  // Full vocabulary list (if not too large)
  if (data.length > includeTopWords && data.length <= 500) {
    doc.addPage()
    yPosition = 20

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Complete Vocabulary List', 20, yPosition)

    yPosition += 10

    const fullTableData = data.map((item, index) => [
      (index + 1).toString(),
      item.word,
      item.frequency.toString(),
      item.partOfSpeech || '',
    ])

    autoTable(doc, {
      startY: yPosition,
      head: [['#', 'Word', 'Frequency', 'Part of Speech']],
      body: fullTableData,
      theme: 'grid',
      headStyles: {
        fillColor: [26, 42, 74],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 50 },
        2: { cellWidth: 20 },
        3: { cellWidth: 'auto' },
      },
    })
  }

  // Footer on all pages
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )
  }

  return doc
}

/**
 * Generate a learning-focused PDF with definitions and examples
 */
export function generateLearningPDF(
  data: VocabularyData[],
  projectName: string,
  options: PDFExportOptions = {}
): jsPDF {
  const { format = 'letter', orientation = 'portrait' } = options

  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format,
  })

  let yPosition = 20

  // Title
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(`${projectName} - Study Guide`, 20, yPosition)

  yPosition += 15

  // Generate vocabulary cards
  data.forEach((item, index) => {
    // Check if we need a new page
    if (yPosition > doc.internal.pageSize.getHeight() - 50) {
      doc.addPage()
      yPosition = 20
    }

    // Word
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(`${index + 1}. ${item.word}`, 20, yPosition)

    yPosition += 8

    // Part of Speech
    if (item.partOfSpeech) {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'italic')
      doc.text(`(${item.partOfSpeech})`, 20, yPosition)
      yPosition += 6
    }

    // Definition
    if (item.definition) {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      const definitionLines = doc.splitTextToSize(item.definition, 170)
      doc.text(definitionLines, 25, yPosition)
      yPosition += definitionLines.length * 5 + 3
    }

    // Synonyms
    if (item.synonyms && item.synonyms.length > 0) {
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text('Synonyms: ', 25, yPosition)
      doc.setFont('helvetica', 'normal')
      doc.text(item.synonyms.join(', '), 45, yPosition)
      yPosition += 5
    }

    // Examples
    if (item.examples && item.examples.length > 0) {
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text('Example: ', 25, yPosition)
      doc.setFont('helvetica', 'italic')
      const exampleLines = doc.splitTextToSize(item.examples[0], 150)
      doc.text(exampleLines, 45, yPosition)
      yPosition += exampleLines.length * 5 + 3
    }

    yPosition += 8 // Space between entries
  })

  return doc
}

/**
 * Create downloadable PDF Blob
 */
export function createPDFBlob(doc: jsPDF): Blob {
  return doc.output('blob')
}

/**
 * Get default PDF filename
 */
export function getDefaultPDFFilename(projectName?: string, reportType: string = 'report'): string {
  const timestamp = new Date().toISOString().split('T')[0]
  const baseName = projectName || 'vocabulary'
  return `${baseName}_${reportType}_${timestamp}.pdf`
}
