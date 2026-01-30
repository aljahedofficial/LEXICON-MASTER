'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/Card'
import { Button } from '@/components/Button'

interface FlashcardProps {
  frontContent: string
  backContent: string
  onMark?: (correct: boolean) => void
  onFlag?: () => void
  isFlagged?: boolean
  showAnswer?: boolean
}

export function Flashcard({
  frontContent,
  backContent,
  onMark,
  onFlag,
  isFlagged = false,
  showAnswer: initialShowAnswer = false,
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(initialShowAnswer)

  return (
    <div className="flex flex-col items-center justify-center min-h-96">
      <Card
        variant="elevated"
        className="w-full max-w-2xl cursor-pointer mb-6 transition-all duration-300 hover:shadow-2xl"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <CardContent className="p-12 min-h-80 flex flex-col items-center justify-center text-center">
          {!isFlipped ? (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">FRONT</p>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white break-words">
                {frontContent}
              </h2>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-8">Click to reveal answer</p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">BACK</p>
              <div className="text-lg text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words prose dark:prose-invert max-w-none">
                {backContent}
              </div>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-8">Click to flip back</p>
            </div>
          )}
        </CardContent>
      </Card>

      {isFlipped && onMark && (
        <div className="flex gap-4 mb-6">
          <Button
            variant="outline"
            size="lg"
            onClick={() => onMark(false)}
            className="bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
          >
            ✗ Forgot
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => onMark(true)}
            className="bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
          >
            ✓ Remember
          </Button>
        </div>
      )}

      {onFlag && (
        <Button
          variant="outline"
          onClick={onFlag}
          className={isFlagged ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-600 dark:text-gray-400'}
        >
          {isFlagged ? '⭐ Flagged' : '☆ Flag This Card'}
        </Button>
      )}
    </div>
  )
}

interface FlashcardGridProps {
  cards: Array<{
    id: string
    frontContent: string
    backContent: string
  }>
  onSelect?: (cardId: string) => void
}

export function FlashcardGrid({ cards, onSelect }: FlashcardGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => (
        <Card
          key={card.id}
          variant="outlined"
          className="cursor-pointer hover:shadow-lg transition-all"
          onClick={() => onSelect?.(card.id)}
        >
          <CardContent className="p-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">FRONT</p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 truncate">
              {card.frontContent}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
              {card.backContent}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
