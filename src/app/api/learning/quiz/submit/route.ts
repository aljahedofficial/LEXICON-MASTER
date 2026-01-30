import { NextRequest, NextResponse } from 'next/server'
import { submitQuizAnswer } from '@/lib/quiz'
import { updateStudyStreak, updateDailyStats, checkAndUnlockAchievements } from '@/lib/learning'
import { verifyAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { flashcardId, question, userAnswer, correctAnswer, isCorrect, quizType = 'MULTIPLE_CHOICE' } = body

    if (!question || userAnswer === undefined || !correctAnswer) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Record the quiz answer
    const result = await submitQuizAnswer(
      authUser.userId,
      flashcardId || '',
      question,
      userAnswer,
      correctAnswer,
      quizType
    )

    // Update learning progress
    await updateStudyStreak(authUser.userId)
    await updateDailyStats(authUser.userId, 0, 0, 1, isCorrect ? 1 : 0)
    await checkAndUnlockAchievements(authUser.userId)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error submitting quiz answer:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
