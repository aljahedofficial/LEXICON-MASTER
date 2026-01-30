import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    // Get export history
    const exports = await prisma.export.findMany({
      where: {
        userId: authUser.userId,
        ...(projectId && { projectId }),
      },
      include: {
        project: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Last 50 exports
    })

    return NextResponse.json(exports)
  } catch (error) {
    console.error('Error fetching export history:', error)
    return NextResponse.json({ error: 'Failed to fetch export history' }, { status: 500 })
  }
}
