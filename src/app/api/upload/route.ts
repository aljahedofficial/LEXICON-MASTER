import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads')
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const ACCEPTED_FORMATS = ['pdf', 'txt', 'docx', 'doc', 'xlsx', 'xls', 'epub']

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true })
  }
}

// Validate file
function validateFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided' }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
    }
  }

  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!ext || !ACCEPTED_FORMATS.includes(ext)) {
    return {
      valid: false,
      error: `File format .${ext} not supported. Accepted: ${ACCEPTED_FORMATS.join(', ')}`,
    }
  }

  return { valid: true }
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

    await ensureUploadDir()

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const projectId = formData.get('projectId') as string

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    if (files.length > 10) {
      return NextResponse.json(
        { error: 'Cannot upload more than 10 files at once' },
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

    const uploadedFiles = []

    for (const file of files) {
      const validation = validateFile(file)
      if (!validation.valid) {
        return NextResponse.json(
          { error: `${file.name}: ${validation.error}` },
          { status: 400 }
        )
      }

      // Generate unique filename
      const timestamp = Date.now()
      const random = Math.random().toString(36).substring(7)
      const originalExt = file.name.split('.').pop()
      const filename = `${timestamp}-${random}.${originalExt}`
      const filepath = join(UPLOAD_DIR, filename)
      const relativePath = `uploads/${filename}`

      // Convert file to buffer and write
      const bytes = await file.arrayBuffer()
      await writeFile(filepath, Buffer.from(bytes))

      // Save file metadata to database
      const projectFile = await prisma.projectFile.create({
        data: {
          originalName: file.name,
          fileName: filename,
          fileType: file.type || originalExt || 'unknown',
          fileSize: file.size,
          filePath: relativePath,
          projectId: projectId,
        },
      })

      uploadedFiles.push({
        id: projectFile.id,
        name: projectFile.originalName,
        filename: projectFile.fileName,
        size: projectFile.fileSize,
        path: projectFile.filePath,
        createdAt: projectFile.createdAt,
      })
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      message: `Successfully uploaded ${uploadedFiles.length} file(s)`,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Upload failed',
      },
      { status: 500 }
    )
  }
}
