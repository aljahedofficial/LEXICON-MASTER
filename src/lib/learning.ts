/**
 * Learning progress and achievement tracking
 */

import { prisma } from './prisma'

export type AchievementBadge =
  | 'FIRST_CARD'
  | 'FIRST_10'
  | 'FIRST_50'
  | 'FIRST_100'
  | 'PERFECT_DAY'
  | 'WEEK_WARRIOR'
  | 'MONTH_MASTER'
  | 'DAILY_STREAK_7'
  | 'DAILY_STREAK_30'
  | 'QUIZ_MASTER'

export const ACHIEVEMENT_DEFINITIONS: Record<AchievementBadge, { title: string; description: string }> = {
  FIRST_CARD: {
    title: 'First Step',
    description: 'Created your first flashcard',
  },
  FIRST_10: {
    title: 'Beginner',
    description: 'Created 10 flashcards',
  },
  FIRST_50: {
    title: 'Enthusiast',
    description: 'Created 50 flashcards',
  },
  FIRST_100: {
    title: 'Committed Learner',
    description: 'Created 100 flashcards',
  },
  PERFECT_DAY: {
    title: 'Perfect Day',
    description: 'Achieved 100% quiz accuracy in a day',
  },
  WEEK_WARRIOR: {
    title: 'Week Warrior',
    description: 'Maintained 7-day study streak',
  },
  MONTH_MASTER: {
    title: 'Month Master',
    description: 'Maintained 30-day study streak',
  },
  DAILY_STREAK_7: {
    title: 'On Fire',
    description: 'Studied for 7 consecutive days',
  },
  DAILY_STREAK_30: {
    title: 'Unstoppable',
    description: 'Studied for 30 consecutive days',
  },
  QUIZ_MASTER: {
    title: 'Quiz Master',
    description: 'Answered 100 quiz questions correctly',
  },
}

/**
 * Get or create learning progress for user
 */
export async function getOrCreateLearningProgress(userId: string) {
  let progress = await prisma.learningProgress.findUnique({
    where: { userId },
  })

  if (!progress) {
    progress = await prisma.learningProgress.create({
      data: { userId },
    })
  }

  return progress
}

/**
 * Update study streak
 */
export async function updateStudyStreak(userId: string) {
  const progress = await getOrCreateLearningProgress(userId)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const lastStudy = progress.lastStudyDate
  const lastStudyDate = lastStudy ? new Date(lastStudy) : null
  lastStudyDate?.setHours(0, 0, 0, 0)

  let currentStreak = progress.currentStreak
  let longestStreak = progress.longestStreak

  if (!lastStudyDate) {
    // First study
    currentStreak = 1
  } else if (lastStudyDate.getTime() === today.getTime()) {
    // Same day, don't increase
  } else if (lastStudyDate.getTime() === today.getTime() - 86400000) {
    // Yesterday, increase streak
    currentStreak = progress.currentStreak + 1
  } else {
    // Gap in streak, reset
    currentStreak = 1
  }

  longestStreak = Math.max(longestStreak, currentStreak)

  return prisma.learningProgress.update({
    where: { userId },
    data: {
      currentStreak,
      longestStreak,
      lastStudyDate: new Date(),
    },
  })
}

/**
 * Update daily study stats
 */
export async function updateDailyStats(
  userId: string,
  cardsReviewed: number,
  studyTimeSeconds: number,
  quizzesAttempted: number,
  quizzesCorrect: number
) {
  const progress = await getOrCreateLearningProgress(userId)

  return prisma.learningProgress.update({
    where: { userId },
    data: {
      todayStudied: progress.todayStudied + cardsReviewed,
      totalStudyTime: progress.totalStudyTime + studyTimeSeconds,
      totalQuizzesAttempted: progress.totalQuizzesAttempted + quizzesAttempted,
      totalQuizzesCorrect: progress.totalQuizzesCorrect + quizzesCorrect,
    },
  })
}

/**
 * Check and unlock achievements
 */
export async function checkAndUnlockAchievements(userId: string) {
  const progress = await getOrCreateLearningProgress(userId)
  const flashcards = await prisma.flashcard.findMany({
    where: { userId },
  })

  const existingAchievements = await prisma.achievement.findMany({
    where: { progressId: progress.id },
  })

  const achievedBadges = existingAchievements.map((a) => a.badge as AchievementBadge)
  const newAchievements: AchievementBadge[] = []

  // Check for achievements
  if (flashcards.length >= 1 && !achievedBadges.includes('FIRST_CARD')) {
    newAchievements.push('FIRST_CARD')
  }
  if (flashcards.length >= 10 && !achievedBadges.includes('FIRST_10')) {
    newAchievements.push('FIRST_10')
  }
  if (flashcards.length >= 50 && !achievedBadges.includes('FIRST_50')) {
    newAchievements.push('FIRST_50')
  }
  if (flashcards.length >= 100 && !achievedBadges.includes('FIRST_100')) {
    newAchievements.push('FIRST_100')
  }
  if (progress.currentStreak >= 7 && !achievedBadges.includes('DAILY_STREAK_7')) {
    newAchievements.push('DAILY_STREAK_7')
  }
  if (progress.currentStreak >= 30 && !achievedBadges.includes('DAILY_STREAK_30')) {
    newAchievements.push('DAILY_STREAK_30')
  }
  if (progress.totalQuizzesCorrect >= 100 && !achievedBadges.includes('QUIZ_MASTER')) {
    newAchievements.push('QUIZ_MASTER')
  }

  // Create new achievements
  for (const badge of newAchievements) {
    const def = ACHIEVEMENT_DEFINITIONS[badge]
    await prisma.achievement.create({
      data: {
        progressId: progress.id,
        badge,
        title: def.title,
        description: def.description,
      },
    })
  }

  return newAchievements
}

/**
 * Get user achievements
 */
export async function getUserAchievements(userId: string) {
  const progress = await getOrCreateLearningProgress(userId)

  return prisma.achievement.findMany({
    where: { progressId: progress.id },
    orderBy: { unlockedAt: 'desc' },
  })
}

/**
 * Get learning dashboard data
 */
export async function getLearningDashboard(userId: string) {
  const progress = await getOrCreateLearningProgress(userId)
  const flashcards = await prisma.flashcard.findMany({
    where: { userId },
  })
  const achievements = await getUserAchievements(userId)
  const quizAttempts = await prisma.quizAttempt.findMany({
    where: { userId },
  })

  const cardsStats = {
    total: flashcards.length,
    new: flashcards.filter((c) => c.status === 'NEW').length,
    learning: flashcards.filter((c) => c.status === 'LEARNING').length,
    reviewing: flashcards.filter((c) => c.status === 'REVIEWING').length,
    mastered: flashcards.filter((c) => c.status === 'MASTERED').length,
  }

  const quizStats = {
    total: quizAttempts.length,
    correct: quizAttempts.filter((a) => a.isCorrect).length,
    correctRate: quizAttempts.length > 0 ? Math.round((quizAttempts.filter((a) => a.isCorrect).length / quizAttempts.length) * 100) : 0,
  }

  const progressStats = {
    cardsMastered: progress.cardsMastered,
    cardsInProgress: progress.cardsInProgress,
    currentStreak: progress.currentStreak,
    longestStreak: progress.longestStreak,
    totalStudyTime: progress.totalStudyTime,
    todayStudied: progress.todayStudied,
    dailyGoal: progress.dailyGoal,
  }

  return {
    cardsStats,
    quizStats,
    progressStats,
    achievements,
    masteryDistribution: flashcards.reduce(
      (acc, card) => {
        const bucket = Math.floor(card.masteryLevel / 10) * 10
        acc[bucket] = (acc[bucket] || 0) + 1
        return acc
      },
      {} as Record<number, number>
    ),
  }
}

/**
 * Reset daily stats
 */
export async function resetDailyStats(userId: string) {
  return prisma.learningProgress.update({
    where: { userId },
    data: {
      todayStudied: 0,
    },
  })
}

/**
 * Update daily goal
 */
export async function updateDailyGoal(userId: string, newGoal: number) {
  return prisma.learningProgress.update({
    where: { userId },
    data: {
      dailyGoal: Math.max(1, newGoal),
    },
  })
}
