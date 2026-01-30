/**
 * Spaced Repetition Algorithm (SM-2 variant)
 * Implements the SuperMemo 2 algorithm for optimal learning
 */

import { prisma } from './prisma'

export interface RepetitionReview {
  flashcardId: string
  wasCorrect: boolean
  qualityScore: number // 0-5 scale
}

export interface RepetitionSchedule {
  nextReviewDate: Date
  difficultyFactor: number
  reviewCount: number
}

/**
 * SM-2 Algorithm Implementation
 * Quality score: 0-5
 * - 0: Complete blackout, wrong answer
 * - 1: Incorrect answer but remembered something
 * - 2: Incorrect answer but felt familiar
 * - 3: Correct answer with serious difficulty
 * - 4: Correct answer with some difficulty
 * - 5: Perfect answer with instant recognition
 */
export function calculateSM2(
  previousDifficulty: number = 2.5,
  previousInterval: number = 0,
  previousRepetitions: number = 0,
  qualityScore: number
): RepetitionSchedule {
  // Calculate new difficulty factor
  let newDifficulty = previousDifficulty + 0.1 - (5 - qualityScore) * (0.08 + (5 - qualityScore) * 0.02)

  // Clamp between 1.3 and 2.5
  newDifficulty = Math.max(1.3, Math.min(2.5, newDifficulty))

  // Calculate interval
  let newInterval: number
  let newRepetitions: number

  if (qualityScore < 3) {
    // Wrong answer - reset
    newRepetitions = 0
    newInterval = 1
  } else {
    newRepetitions = previousRepetitions + 1

    if (newRepetitions === 1) {
      newInterval = 1
    } else if (newRepetitions === 2) {
      newInterval = 3
    } else {
      newInterval = Math.round(previousInterval * newDifficulty)
    }
  }

  const nextReviewDate = new Date()
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval)

  return {
    nextReviewDate,
    difficultyFactor: newDifficulty,
    reviewCount: newRepetitions,
  }
}

/**
 * Record a spaced repetition review
 */
export async function recordReview(flashcardId: string, wasCorrect: boolean, qualityScore: number) {
  const card = await prisma.flashcard.findUnique({
    where: { id: flashcardId },
  })

  if (!card) throw new Error('Flashcard not found')

  // Calculate new schedule
  const schedule = calculateSM2(
    card.difficultyFactor,
    card.reviewCount > 0 ? Math.floor((card.nextReviewAt?.getTime() ?? Date.now() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0,
    card.reviewCount,
    qualityScore
  )

  // Record the review
  const review = await prisma.spacedRepetitionReview.create({
    data: {
      flashcardId,
      wasCorrect,
      qualityScore,
      nextReviewAt: schedule.nextReviewDate,
    },
  })

  // Update flashcard
  const newMastery = Math.min(100, Math.max(0, card.masteryLevel + (wasCorrect ? 10 : -5)))

  const updatedCard = await prisma.flashcard.update({
    where: { id: flashcardId },
    data: {
      reviewCount: schedule.reviewCount,
      difficultyFactor: schedule.difficultyFactor,
      nextReviewAt: schedule.nextReviewDate,
      lastReviewedAt: new Date(),
      masteryLevel: newMastery,
      status: getStatusByMastery(newMastery),
    },
  })

  return { review, updatedCard }
}

/**
 * Get flashcards due for review
 */
export async function getFlashcardsDueForReview(userId: string, limit: number = 20) {
  const now = new Date()

  return prisma.flashcard.findMany({
    where: {
      userId,
      nextReviewAt: {
        lte: now,
      },
    },
    include: {
      word: true,
    },
    orderBy: {
      nextReviewAt: 'asc',
    },
    take: limit,
  })
}

/**
 * Get new flashcards to start learning
 */
export async function getNewFlashcards(userId: string, limit: number = 20) {
  return prisma.flashcard.findMany({
    where: {
      userId,
      status: 'NEW',
    },
    include: {
      word: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
    take: limit,
  })
}

/**
 * Determine status based on mastery level
 */
export function getStatusByMastery(masteryLevel: number): string {
  if (masteryLevel >= 80) return 'MASTERED'
  if (masteryLevel >= 50) return 'REVIEWING'
  if (masteryLevel >= 20) return 'LEARNING'
  return 'NEW'
}

/**
 * Get review statistics for user
 */
export async function getReviewStats(userId: string) {
  const reviews = await prisma.spacedRepetitionReview.findMany({
    where: {
      flashcard: {
        userId,
      },
    },
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayReviews = reviews.filter((r) => {
    const reviewDate = new Date(r.reviewedAt)
    reviewDate.setHours(0, 0, 0, 0)
    return reviewDate.getTime() === today.getTime()
  })

  const correctToday = todayReviews.filter((r) => r.wasCorrect).length
  const totalToday = todayReviews.length
  const correctRate = totalToday > 0 ? Math.round((correctToday / totalToday) * 100) : 0

  const totalCorrect = reviews.filter((r) => r.wasCorrect).length
  const overallRate = reviews.length > 0 ? Math.round((totalCorrect / reviews.length) * 100) : 0

  return {
    todayReviewed: totalToday,
    todayCorrect: correctToday,
    todayCorrectRate: correctRate,
    totalReviewed: reviews.length,
    totalCorrect,
    overallCorrectRate: overallRate,
  }
}

/**
 * Calculate next review dates distribution
 */
export async function getUpcomingReviews(userId: string) {
  const cards = await prisma.flashcard.findMany({
    where: { userId },
    select: { nextReviewAt: true },
  })

  const now = new Date()
  const upcoming = {
    due: 0,
    today: 0,
    tomorrow: 0,
    thisWeek: 0,
    nextWeek: 0,
    later: 0,
  }

  cards.forEach((card) => {
    if (!card.nextReviewAt) return

    const diffMs = card.nextReviewAt.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays <= 0) upcoming.due++
    else if (diffDays === 1) upcoming.today++
    else if (diffDays === 2) upcoming.tomorrow++
    else if (diffDays <= 7) upcoming.thisWeek++
    else if (diffDays <= 14) upcoming.nextWeek++
    else upcoming.later++
  })

  return upcoming
}
