import { NextRequest, NextResponse } from 'next/server'
import { recordReview } from '@/lib/spacedRepetition'
import { updateStudyStreak } from '@/lib/learning'
import { verifyAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { flashcardId, wasCorrect, qualityScore } = body

    if (!flashcardId || qualityScore === undefined || wasCorrect === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Record the review using spaced repetition algorithm
    const result = await recordReview(flashcardId, wasCorrect, qualityScore)

    // Update study streak
    await updateStudyStreak(authUser.userId)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error recording review:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
