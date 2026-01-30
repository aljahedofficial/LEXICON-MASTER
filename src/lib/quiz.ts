/**
 * Quiz system for vocabulary learning
 */

import { prisma } from './prisma'

export type QuizType = 'MULTIPLE_CHOICE' | 'MATCHING' | 'FILL_BLANK' | 'SYNONYM_ANTONYM' | 'CONTEXT'

export interface QuizQuestion {
  type: QuizType
  question: string
  options: string[]
  correctAnswer: string
  explanation?: string
}

export interface QuizSession {
  sessionId: string
  userId: string
  quizType: QuizType
  questions: QuizQuestion[]
  currentIndex: number
  score: number
  answers: Array<{ questionIndex: number; userAnswer: string; isCorrect: boolean }>
}

/**
 * Generate multiple choice quiz question
 */
export function generateMultipleChoiceQuestion(
  word: string,
  correctDefinition: string,
  wrongDefinitions: string[]
): QuizQuestion {
  const options = [correctDefinition, ...wrongDefinitions.slice(0, 3)].sort(() => Math.random() - 0.5)

  return {
    type: 'MULTIPLE_CHOICE',
    question: `What is the definition of "${word}"?`,
    options,
    correctAnswer: correctDefinition,
  }
}

/**
 * Generate fill-in-the-blank quiz question
 */
export function generateFillBlankQuestion(word: string, exampleSentence: string, wordBank: string[]): QuizQuestion {
  const question = exampleSentence.replace(new RegExp(word, 'gi'), '______')
  const options = [word, ...wordBank.slice(0, 3)].sort(() => Math.random() - 0.5)

  return {
    type: 'FILL_BLANK',
    question: `Fill in the blank: ${question}`,
    options,
    correctAnswer: word,
  }
}

/**
 * Generate synonym/antonym quiz question
 */
export function generateSynonymAntonymQuestion(
  word: string,
  synonyms: string[],
  isAntonym: boolean = false
): QuizQuestion {
  const correctAnswer = synonyms[0] || word

  return {
    type: 'SYNONYM_ANTONYM',
    question: `Find a ${isAntonym ? 'antonym' : 'synonym'} for "${word}"`,
    options: [correctAnswer, ...synonyms.slice(1, 3)].sort(() => Math.random() - 0.5),
    correctAnswer,
  }
}

/**
 * Generate context usage quiz question
 */
export function generateContextQuestion(
  word: string,
  exampleSentence: string,
  definitions: string[]
): QuizQuestion {
  const correctDefinition = definitions[0] || 'Not available'

  return {
    type: 'CONTEXT',
    question: `What is the meaning of "${word}" in this context?\n\n"${exampleSentence}"`,
    options: definitions.slice(0, 4),
    correctAnswer: correctDefinition,
  }
}

/**
 * Create a quiz session
 */
export async function createQuizSession(
  userId: string,
  quizType: QuizType,
  limit: number = 10
): Promise<QuizSession> {
  const sessionId = `session_${Date.now()}`

  // Get flashcards for quiz
  const cards = await prisma.flashcard.findMany({
    where: { userId },
    include: { word: true },
    orderBy: { nextReviewAt: 'asc' },
    take: limit,
  })

  // Generate questions based on quiz type
  const questions = cards.map((card) => {
    const word = card.word.word
    const definition = card.backContent || 'No definition available'

    switch (quizType) {
      case 'MULTIPLE_CHOICE':
        return generateMultipleChoiceQuestion(
          word,
          definition,
          [`Wrong answer 1 for ${word}`, `Wrong answer 2 for ${word}`, `Wrong answer 3 for ${word}`]
        )
      case 'FILL_BLANK':
        return generateFillBlankQuestion(
          word,
          `The word "${word}" is important.`,
          ['example', 'test', 'word']
        )
      case 'SYNONYM_ANTONYM':
        return generateSynonymAntonymQuestion(word, ['similar', 'related', 'connected'])
      case 'CONTEXT':
        return generateContextQuestion(
          word,
          `The concept of "${word}" is fascinating.`,
          [definition, 'Alternative meaning 1', 'Alternative meaning 2', 'Alternative meaning 3']
        )
      default:
        return generateMultipleChoiceQuestion(word, definition, ['Wrong 1', 'Wrong 2', 'Wrong 3'])
    }
  })

  return {
    sessionId,
    userId,
    quizType,
    questions,
    currentIndex: 0,
    score: 0,
    answers: [],
  }
}

/**
 * Submit quiz answer
 */
export async function submitQuizAnswer(
  userId: string,
  flashcardId: string,
  question: string,
  userAnswer: string,
  correctAnswer: string,
  quizType: QuizType
) {
  const isCorrect = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()

  // Record quiz attempt
  const attempt = await prisma.quizAttempt.create({
    data: {
      userId,
      flashcardId,
      quizType,
      question,
      userAnswer,
      correctAnswer,
      isCorrect,
    },
  })

  // Update learning progress if correct
  if (isCorrect) {
    const progress = await prisma.learningProgress.findUnique({
      where: { userId },
    })

    if (progress) {
      await prisma.learningProgress.update({
        where: { userId },
        data: {
          totalQuizzesAttempted: progress.totalQuizzesAttempted + 1,
          totalQuizzesCorrect: progress.totalQuizzesCorrect + 1,
        },
      })
    }
  } else {
    const progress = await prisma.learningProgress.findUnique({
      where: { userId },
    })

    if (progress) {
      await prisma.learningProgress.update({
        where: { userId },
        data: {
          totalQuizzesAttempted: progress.totalQuizzesAttempted + 1,
        },
      })
    }
  }

  return attempt
}

/**
 * Get quiz statistics
 */
export async function getQuizStats(userId: string) {
  const attempts = await prisma.quizAttempt.findMany({
    where: { userId },
  })

  const byType = {
    MULTIPLE_CHOICE: { total: 0, correct: 0 },
    MATCHING: { total: 0, correct: 0 },
    FILL_BLANK: { total: 0, correct: 0 },
    SYNONYM_ANTONYM: { total: 0, correct: 0 },
    CONTEXT: { total: 0, correct: 0 },
  } as Record<QuizType, { total: number; correct: number }>

  attempts.forEach((attempt) => {
    if (byType[attempt.quizType as QuizType]) {
      byType[attempt.quizType as QuizType].total++
      if (attempt.isCorrect) {
        byType[attempt.quizType as QuizType].correct++
      }
    }
  })

  const totalCorrect = attempts.filter((a) => a.isCorrect).length
  const overallCorrectRate = attempts.length > 0 ? Math.round((totalCorrect / attempts.length) * 100) : 0

  return {
    totalAttempts: attempts.length,
    totalCorrect,
    overallCorrectRate,
    byType,
  }
}

/**
 * Get quiz history
 */
export async function getQuizHistory(userId: string, limit: number = 50) {
  return prisma.quizAttempt.findMany({
    where: { userId },
    include: {
      flashcard: {
        include: { word: true },
      },
    },
    orderBy: {
      attemptedAt: 'desc',
    },
    take: limit,
  })
}
