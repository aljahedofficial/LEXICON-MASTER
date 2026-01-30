import { NextRequest, NextResponse } from 'next/server'
import { join } from 'path'
import { prisma } from '@/lib/prisma'
import { extractTextFromFile } from '@/lib/extraction'
import { preprocessText, extractUniqueWords, tokenize, detectLanguage, getStopWords } from '@/lib/preprocessing'
import { requireAuth } from '@/lib/auth'
import { createExtractionJob, enqueueExtractionTask } from '@/lib/processingQueue'

interface ExtractionRequest {
  projectId: string
  fileIds: string[]
  useOcr?: boolean
}

export async function POST(request: NextRequest) {
  try {
    let userId: string
    try {
      const auth = requireAuth(request)
      userId = auth.userId
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: ExtractionRequest = await request.json()
    const { projectId, fileIds } = body
    const useOcr = body.useOcr ?? false

    if (!projectId || !fileIds || fileIds.length === 0) {
      return NextResponse.json(
        { error: 'Missing projectId or fileIds' },
        { status: 400 }
      )
    }

    // Verify project exists and user has access
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!project || project.userId !== userId) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 403 }
      )
    }

    // Fetch files from database
    const files = await prisma.projectFile.findMany({
      where: {
        id: { in: fileIds },
        projectId: projectId,
      },
    })

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files found' }, { status: 404 })
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads')

    const job = createExtractionJob(
      files.map((file) => ({ id: file.id, name: file.originalName }))
    )

    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'PROCESSING' },
    })

    for (const file of files) {
      await prisma.projectFile.update({
        where: { id: file.id },
        data: { processingStatus: 'QUEUED' },
      })

      enqueueExtractionTask(job.jobId, file.id, async () => {
        await prisma.projectFile.update({
          where: { id: file.id },
          data: { processingStatus: 'PROCESSING' },
        })

        const filePath = join(uploadDir, file.fileName)
        const fileExt = file.fileName.split('.').pop() || ''

        const extractedText = await extractTextFromFile(filePath, fileExt, { useOcr })

        const processed = preprocessText(extractedText, {
          removeSpecialChars: true,
          normalizeWhitespace: true,
          toLowerCase: true,
        })

        const detectedLanguage = detectLanguage(processed)
        const stopWords = getStopWords(detectedLanguage)

        const uniqueWords = extractUniqueWords(processed, true, 3, stopWords)
        const tokens = tokenize(processed)
        const allowed = new Set(uniqueWords)
        const frequencyMap = new Map<string, number>()

        tokens.forEach((token) => {
          const clean = token.replace(/[^\w'-]/g, '').toLowerCase()
          if (!allowed.has(clean)) return
          frequencyMap.set(clean, (frequencyMap.get(clean) || 0) + 1)
        })

        const wordsToCreate = Array.from(frequencyMap.entries())
          .slice(0, 500)
          .map(([word, frequency]) => ({
            projectId: projectId,
            word,
            frequency,
            wordLength: word.length,
            language: detectedLanguage === 'bn' ? 'bn' : 'en',
          }))

        const createdWords = await Promise.all(
          wordsToCreate.map((data) =>
            prisma.word.create({ data }).catch(() => null)
          )
        )
        const createdCount = createdWords.filter(Boolean).length

        await prisma.projectFile.update({
          where: { id: file.id },
          data: { processingStatus: 'COMPLETED' },
        })

        return {
          wordsExtracted: createdCount,
          wordCount: tokens.length,
          uniqueWords: uniqueWords.length,
        }
      })
    }

    return NextResponse.json({
      success: true,
      jobId: job.jobId,
      status: job,
    })
  } catch (error) {
    console.error('Extraction error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Extraction failed',
      },
      { status: 500 }
    )
  }
}
