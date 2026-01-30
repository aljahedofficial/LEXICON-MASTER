'use client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/Card'
import { Button } from '@/components/Button'
import { KPICard, KPIGrid } from '@/components/KPICard'
import { Progress } from '@/components/Progress'

interface LearningDashboardProps {
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
  _masteryDistribution?: Record<number, number>
  onStartReview?: () => void
  onStartQuiz?: () => void
  onViewFlashcards?: () => void
}

export function LearningDashboard({
  cardsStats,
  quizStats,
  progressStats,
  achievements,
  onStartReview,
  onStartQuiz,
  onViewFlashcards,
}: LearningDashboardProps) {
  const progressPercent = Math.round((progressStats.todayStudied / progressStats.dailyGoal) * 100)
  const masteryPercent = cardsStats.total > 0 ? Math.round((cardsStats.mastered / cardsStats.total) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Daily Goal Progress */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Today&apos;s Progress</CardTitle>
          <CardDescription>Cards reviewed toward your daily goal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {progressStats.todayStudied} / {progressStats.dailyGoal} cards
                </p>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{progressPercent}%</p>
              </div>
              <Progress value={progressPercent} className="h-3" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Study Time Today</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.floor(progressStats.totalStudyTime / 60)}m
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Current Streak</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {progressStats.currentStreak}
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">days</span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <KPIGrid>
        <KPICard
          title="Cards Mastered"
          value={cardsStats.mastered}
          subtitle={`${masteryPercent}% complete`}
          icon="🎯"
          variant="success"
        />
        <KPICard
          title="Quiz Accuracy"
          value={`${quizStats.correctRate}%`}
          subtitle={`${quizStats.correct}/${quizStats.total} correct`}
          icon="✓"
          variant="primary"
        />
        <KPICard
          title="Cards in Review"
          value={cardsStats.reviewing + cardsStats.learning}
          subtitle={`${cardsStats.learning} learning, ${cardsStats.reviewing} reviewing`}
          icon="📚"
          variant="secondary"
        />
        <KPICard
          title="Longest Streak"
          value={progressStats.longestStreak}
          subtitle="days of practice"
          icon="🔥"
          variant="warning"
        />
      </KPIGrid>

      {/* Card Status Distribution */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Flashcard Status</CardTitle>
          <CardDescription>Distribution of cards across learning stages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700 dark:text-gray-300">Mastered</span>
                <span className="font-semibold text-green-600 dark:text-green-400">{cardsStats.mastered}</span>
              </div>
              <Progress value={(cardsStats.mastered / cardsStats.total) * 100} />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700 dark:text-gray-300">Reviewing</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">{cardsStats.reviewing}</span>
              </div>
              <Progress value={(cardsStats.reviewing / cardsStats.total) * 100} />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700 dark:text-gray-300">Learning</span>
                <span className="font-semibold text-yellow-600 dark:text-yellow-400">{cardsStats.learning}</span>
              </div>
              <Progress value={(cardsStats.learning / cardsStats.total) * 100} />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700 dark:text-gray-300">New</span>
                <span className="font-semibold text-gray-600 dark:text-gray-400">{cardsStats.new}</span>
              </div>
              <Progress value={(cardsStats.new / cardsStats.total) * 100} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button onClick={onStartReview} className="w-full h-12 text-lg">
          📖 Start Review Session
        </Button>
        <Button onClick={onStartQuiz} variant="outline" className="w-full h-12 text-lg">
          ✓ Take a Quiz
        </Button>
      </div>

      {/* Achievements */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
          <CardDescription>Unlock badges by reaching milestones</CardDescription>
        </CardHeader>
        <CardContent>
          {achievements.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Start studying to unlock your first achievement! 🚀
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-lg border border-yellow-200 dark:border-yellow-800"
                >
                  <p className="text-3xl mb-2">🏆</p>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white mb-1">{achievement.title}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{achievement.description}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View All Flashcards */}
      <Button onClick={onViewFlashcards} variant="outline" className="w-full">
        View All Flashcards
      </Button>
    </div>
  )
}
