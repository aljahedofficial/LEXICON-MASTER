import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

interface RouteParams {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    let userId: string
    try {
      const auth = requireAuth(request)
      userId = auth.userId
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        userId,
      },
      include: {
        files: {
          orderBy: { createdAt: 'desc' },
        },
        words: {
          orderBy: { frequency: 'desc' },
          take: 500,
        },
        _count: {
          select: {
            files: true,
            words: true,
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Calculate computed fields
    const totalWords = await prisma.word.aggregate({
      where: { projectId: params.id },
      _sum: { frequency: true },
    })

    const uniqueWords = await prisma.word.count({
      where: { projectId: params.id },
    })

    const sourceCount = await prisma.source.count({
      where: { projectId: params.id },
    })

    // Add computed fields to response
    const enrichedProject = {
      ...project,
      totalWords: totalWords._sum.frequency || 0,
      uniqueWords,
      sourceCount,
    }

    return NextResponse.json(enrichedProject)
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}
