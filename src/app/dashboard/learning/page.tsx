'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/Card'
import { Button } from '@/components/Button'
import { Spinner } from '@/components/Loading'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Flashcard, FlashcardGrid } from '@/components/Flashcard'
import { Quiz, QuizResults, type QuizQuestion } from '@/components/Quiz'
import { LearningDashboard } from '@/components/LearningDashboard'

type PageView = 'dashboard' | 'study' | 'quiz' | 'flashcards'

interface FlashcardData {
  id: string
  word: {
    word: string
  }
  frontContent: string
  backContent: string
  status: string
  masteryLevel: number
  isFlagged: boolean
}

interface DashboardData {
  cardsStats: {
    total: number
    new: number
    learning: number
    reviewing: number
    mastered: number
  }
  quizStats: {
    total: number
    correct: number
    correctRate: number
  }
  progressStats: {
    cardsMastered: number
    cardsInProgress: number
    currentStreak: number
    longestStreak: number
    totalStudyTime: number
    todayStudied: number
    dailyGoal: number
  }
  achievements: Array<{
    id: string
    badge: string
    title: string
    description: string
    unlockedAt: Date
  }>
  masteryDistribution: Record<number, number>
}

export default function LearningPage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [view, setView] = useState<PageView>('dashboard')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Data states
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [flashcards, setFlashcards] = useState<FlashcardData[]>([])
  const [currentStudyCard, setCurrentStudyCard] = useState<FlashcardData | null>(null)
  const [studyCardIndex, setStudyCardIndex] = useState(0)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [quizResults, setQuizResults] = useState<
    Array<{ questionIndex: number; userAnswer: string; isCorrect: boolean }> | null
  >(null)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (!storedToken) {
      router.push('/auth/login')
      return
    }
    setToken(storedToken)
    loadDashboardData(storedToken)
  }, [router])

  const loadDashboardData = async (authToken: string) => {
    try {
      setLoading(true)
      const res = await fetch('/api/learning/dashboard', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (!res.ok) throw new Error('Failed to load learning data')

      const data = await res.json()
      setDashboardData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleStartReview = async () => {
    if (!token) return

    try {
      const res = await fetch('/api/learning/flashcards?dueOnly=true', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error('Failed to load flashcards')

      const data = await res.json()
      setFlashcards(data)
      setStudyCardIndex(0)
      setCurrentStudyCard(data[0] || null)
      setView('study')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load flashcards')
    }
  }

  const handleStartQuiz = async () => {
    if (!token) return

    try {
      const res = await fetch('/api/learning/quiz/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quizType: 'MULTIPLE_CHOICE' }),
      })

      if (!res.ok) throw new Error('Failed to start quiz')

      const data = await res.json()
      setQuizQuestions(data.questions)
      setQuizResults(null)
      setView('quiz')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start quiz')
    }
  }

  const handleFlashcardMark = async (correct: boolean) => {
    if (!currentStudyCard || !token) return

    try {
      const res = await fetch('/api/learning/flashcards/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          flashcardId: currentStudyCard.id,
          wasCorrect: correct,
          qualityScore: correct ? 5 : 0,
        }),
      })

      if (!res.ok) throw new Error('Failed to record review')

      // Move to next card
      if (studyCardIndex < flashcards.length - 1) {
        setStudyCardIndex(studyCardIndex + 1)
        setCurrentStudyCard(flashcards[studyCardIndex + 1])
      } else {
        // Review session complete
        await loadDashboardData(token)
        setView('dashboard')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record review')
    }
  }

  const handleQuizSubmit = async (answers: Array<{ questionIndex: number; userAnswer: string; isCorrect: boolean }>) => {
    if (!token) return

    try {
      // Save quiz results
      for (const answer of answers) {
        const question = quizQuestions[answer.questionIndex]
        await fetch('/api/learning/quiz/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            question: question.question,
            userAnswer: answer.userAnswer,
            correctAnswer: question.correctAnswer,
            isCorrect: answer.isCorrect,
          }),
        })
      }

      setQuizResults(answers)
      await loadDashboardData(token)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save quiz results')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <DashboardLayout
      rightContent={
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4">
            <p className="text-sm text-red-700 dark:text-red-300">❌ {error}</p>
          </div>
        )}

        {view === 'dashboard' && dashboardData && (
          <>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Learning Dashboard</h2>
              <p className="text-gray-600 dark:text-gray-400">Master your vocabulary with flashcards and quizzes</p>
            </div>

            <LearningDashboard
              cardsStats={dashboardData.cardsStats}
              quizStats={dashboardData.quizStats}
              progressStats={dashboardData.progressStats}
              achievements={dashboardData.achievements}
              _masteryDistribution={dashboardData.masteryDistribution}
              onStartReview={handleStartReview}
              onStartQuiz={handleStartQuiz}
              onViewFlashcards={() => setView('flashcards')}
            />
          </>
        )}

        {view === 'study' && currentStudyCard && (
          <>
            <Button variant="outline" onClick={() => setView('dashboard')}>
              ← Back to Dashboard
            </Button>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Review Session
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Card {studyCardIndex + 1} of {flashcards.length}
              </p>
            </div>
            <Flashcard
              frontContent={currentStudyCard.frontContent}
              backContent={currentStudyCard.backContent}
              onMark={handleFlashcardMark}
              onFlag={() => {}} // TODO: implement flag
              isFlagged={currentStudyCard.isFlagged}
            />
          </>
        )}

        {view === 'quiz' && !quizResults && quizQuestions.length > 0 && (
          <>
            <Button variant="outline" onClick={() => setView('dashboard')}>
              ← Back to Dashboard
            </Button>
            <Quiz
              questions={quizQuestions}
              onComplete={handleQuizSubmit}
              onQuit={() => setView('dashboard')}
            />
          </>
        )}

        {view === 'quiz' && quizResults && (
          <>
            <QuizResults
              questions={quizQuestions}
              answers={quizResults}
              onQuit={() => setView('dashboard')}
              onRetry={handleStartQuiz}
            />
          </>
        )}

        {view === 'flashcards' && (
          <>
            <Button variant="outline" onClick={() => setView('dashboard')}>
              ← Back to Dashboard
            </Button>
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>All Flashcards</CardTitle>
                <CardDescription>Click any card to study it individually</CardDescription>
              </CardHeader>
              <CardContent>
                {flashcards.length === 0 ? (
                  <p className="text-center text-gray-600 dark:text-gray-400">No flashcards yet. Create some from your projects!</p>
                ) : (
                  <FlashcardGrid
                    cards={flashcards.map((c) => ({
                      id: c.id,
                      frontContent: c.frontContent,
                      backContent: c.backContent,
                    }))}
                  />
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
