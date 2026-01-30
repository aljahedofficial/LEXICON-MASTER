import { NextRequest, NextResponse } from 'next/server'
import { createQuizSession } from '@/lib/quiz'
import { verifyAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { quizType = 'MULTIPLE_CHOICE', limit = 10 } = body

    const session = await createQuizSession(authUser.userId, quizType, limit)

    return NextResponse.json(session)
  } catch (error) {
    console.error('Error starting quiz:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
