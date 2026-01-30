import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  exportVocabulary,
  exportMultipleFormats,
  ExportFormat,
  VocabularyData,
  ProjectMetadata,
  AnalyticsData,
} from '@/lib/export'

export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      projectId,
      format,
      formats, // For batch export
      includeMetadata = true,
      includeAnalytics = true,
      includeTopWords = 50,
      prettifyJSON = true,
    } = body

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // Fetch project data
    const project = await prisma.project.findUnique({
      where: { id: projectId, userId: authUser.userId },
      include: {
        words: {
          include: {
            enrichment: true,
          },
          orderBy: { frequency: 'desc' },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Transform data to export format
    const vocabularyData: VocabularyData[] = project.words.map((word) => ({
      word: word.word,
      frequency: word.frequency,
      definition: word.enrichment?.definition || null,
      synonyms: null, // To be added when enrichment includes synonyms
      antonyms: null, // To be added when enrichment includes antonyms
      examples: null, // To be added when enrichment includes examples
      partOfSpeech: word.partOfSpeech,
    }))

    // Prepare metadata
    const totalWords = vocabularyData.reduce((sum, w) => sum + w.frequency, 0)
    const uniqueWords = vocabularyData.length
    const sourceCount = await prisma.source.count({ where: { projectId } })

    const metadata: ProjectMetadata = {
      projectName: project.name,
      sourceCount,
      totalWords,
      uniqueWords,
      createdAt: project.createdAt,
    }

    // Calculate analytics
    const frequencies = vocabularyData.map((w) => w.frequency)
    const averageFrequency = frequencies.reduce((a, b) => a + b, 0) / frequencies.length
    const sortedFrequencies = [...frequencies].sort((a, b) => a - b)
    const medianFrequency = sortedFrequencies[Math.floor(sortedFrequencies.length / 2)]

    const analytics: AnalyticsData = {
      averageFrequency,
      medianFrequency,
      topWords: vocabularyData.slice(0, 20).map((w) => ({ word: w.word, frequency: w.frequency })),
    }

    // Handle batch export
    if (formats && Array.isArray(formats)) {
      const result = await exportMultipleFormats(
        vocabularyData,
        project.name,
        formats as ExportFormat[],
        metadata,
        analytics
      )

      // Record export in database
      await prisma.export.create({
        data: {
          userId: authUser.userId,
          projectId,
          format: 'BATCH',
          fileName: result.fileName,
          status: 'COMPLETED',
        },
      })

      return new NextResponse(result.blob, {
        headers: {
          'Content-Type': result.mimeType,
          'Content-Disposition': `attachment; filename="${result.fileName}"`,
        },
      })
    }

    // Single format export
    if (!format) {
      return NextResponse.json({ error: 'Format is required' }, { status: 400 })
    }

    const result = await exportVocabulary(vocabularyData, project.name, metadata, analytics, {
      format: format as ExportFormat,
      includeMetadata,
      includeAnalytics,
      includeTopWords,
      prettifyJSON,
    })

    // Record export in database
    await prisma.export.create({
      data: {
        userId: authUser.userId,
        projectId,
        format: format.toUpperCase(),
        fileName: result.fileName,
        status: 'COMPLETED',
      },
    })

    return new NextResponse(result.blob, {
      headers: {
        'Content-Type': result.mimeType,
        'Content-Disposition': `attachment; filename="${result.fileName}"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
