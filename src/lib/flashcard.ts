/**
 * Flashcard generation and management
 */

import { prisma } from './prisma'

export interface FlashcardData {
  id: string
  userId: string
  wordId: string
  word: string
  frontContent: string
  backContent: string
  status: 'NEW' | 'LEARNING' | 'REVIEWING' | 'MASTERED'
  masteryLevel: number
  reviewCount: number
  lastReviewedAt?: Date
  nextReviewAt?: Date
  isFlagged: boolean
}

export interface FlashcardCreateInput {
  userId: string
  wordId: string
  frontContent: string
  backContent: string
}

/**
 * Generate a flashcard from a word with definition
 */
export function generateFlashcardContent(
  word: string,
  definition?: string,
  synonyms?: string[],
  antonyms?: string[]
) {
  const frontContent = word.toUpperCase()

  const backParts = [definition ? `**Definition**: ${definition}` : 'No definition available']

  if (synonyms && synonyms.length > 0) {
    backParts.push(`**Synonyms**: ${synonyms.join(', ')}`)
  }

  if (antonyms && antonyms.length > 0) {
    backParts.push(`**Antonyms**: ${antonyms.join(', ')}`)
  }

  const backContent = backParts.join('\n\n')

  return { frontContent, backContent }
}

/**
 * Create flashcard for a word
 */
export async function createFlashcard(input: FlashcardCreateInput) {
  const existing = await prisma.flashcard.findUnique({
    where: {
      userId_wordId: {
        userId: input.userId,
        wordId: input.wordId,
      },
    },
  })

  if (existing) {
    return existing
  }

  return prisma.flashcard.create({
    data: input,
  })
}

/**
 * Get flashcards for user with filtering
 */
export async function getFlashcards(
  userId: string,
  filters?: {
    status?: string
    flaggedOnly?: boolean
    dueOnly?: boolean
  }
) {
  const where: Record<string, unknown> = { userId }

  if (filters?.status) {
    where.status = filters.status
  }

  if (filters?.flaggedOnly) {
    where.isFlagged = true
  }

  if (filters?.dueOnly) {
    where.nextReviewAt = {
      lte: new Date(),
    }
  }

  return prisma.flashcard.findMany({
    where,
    include: {
      word: true,
    },
    orderBy: {
      nextReviewAt: 'asc',
    },
  })
}

/**
 * Get flashcard by ID
 */
export async function getFlashcardById(id: string) {
  return prisma.flashcard.findUnique({
    where: { id },
    include: {
      word: true,
      reviews: {
        orderBy: { reviewedAt: 'desc' },
        take: 10,
      },
    },
  })
}

/**
 * Update flashcard status
 */
export async function updateFlashcardStatus(
  id: string,
  status: 'NEW' | 'LEARNING' | 'REVIEWING' | 'MASTERED',
  masteryLevel?: number
) {
  return prisma.flashcard.update({
    where: { id },
    data: {
      status,
      ...(masteryLevel !== undefined && { masteryLevel }),
      updatedAt: new Date(),
    },
  })
}

/**
 * Toggle flashcard flag
 */
export async function toggleFlashcardFlag(id: string) {
  const card = await prisma.flashcard.findUnique({
    where: { id },
  })

  if (!card) throw new Error('Flashcard not found')

  return prisma.flashcard.update({
    where: { id },
    data: {
      isFlagged: !card.isFlagged,
    },
  })
}

/**
 * Get flashcard statistics
 */
export async function getFlashcardStats(userId: string) {
  const cards = await prisma.flashcard.findMany({
    where: { userId },
  })

  const stats = {
    total: cards.length,
    new: cards.filter((c) => c.status === 'NEW').length,
    learning: cards.filter((c) => c.status === 'LEARNING').length,
    reviewing: cards.filter((c) => c.status === 'REVIEWING').length,
    mastered: cards.filter((c) => c.status === 'MASTERED').length,
    flagged: cards.filter((c) => c.isFlagged).length,
    averageMastery: cards.length > 0 ? Math.round(cards.reduce((sum, c) => sum + c.masteryLevel, 0) / cards.length) : 0,
  }

  return stats
}

/**
 * Bulk create flashcards from words
 */
export async function createFlashcardsFromWords(
  userId: string,
  words: Array<{
    id: string
    word: string
    definition?: string
  }>
) {
  const flashcards = await Promise.all(
    words.map(async (w) => {
      const content = generateFlashcardContent(w.word, w.definition)
      return createFlashcard({
        userId,
        wordId: w.id,
        frontContent: content.frontContent,
        backContent: content.backContent,
      })
    })
  )

  return flashcards
}
