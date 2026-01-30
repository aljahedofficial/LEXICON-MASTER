'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { Button } from '@/components/Button'
import { Progress } from '@/components/Progress'

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: string
  explanation?: string
}

interface QuizProps {
  questions: QuizQuestion[]
  onComplete?: (answers: Array<{ questionIndex: number; userAnswer: string; isCorrect: boolean }>) => void
  onQuit?: () => void
}

export function Quiz({ questions, onComplete, onQuit }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([])
  const [showResult, setShowResult] = useState(false)

  const currentQuestion = questions[currentIndex]
  const currentAnswer = selectedAnswers[currentIndex] || ''
  const isCorrect = currentAnswer === currentQuestion?.correctAnswer

  const handleSelectOption = (option: string) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentIndex] = option
    setSelectedAnswers(newAnswers)
    setShowResult(true)
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowResult(false)
    } else {
      handleComplete()
    }
  }

  const handleComplete = () => {
    const answers = selectedAnswers.map((answer, index) => ({
      questionIndex: index,
      userAnswer: answer,
      isCorrect: answer === questions[index].correctAnswer,
    }))

    onComplete?.(answers)
  }

  const correctCount = selectedAnswers.filter((ans, idx) => ans === questions[idx].correctAnswer).length
  const progressPercent = ((currentIndex + 1) / questions.length) * 100

  if (!currentQuestion) return null

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Question {currentIndex + 1} of {questions.length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {correctCount} correct
          </p>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Question Card */}
      <Card variant="elevated" className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = currentAnswer === option
              const isCorrectOption = option === currentQuestion.correctAnswer

              let bgColor = 'bg-gray-50 dark:bg-gray-700'
              let borderColor = 'border-gray-200 dark:border-gray-600'
              let textColor = 'text-gray-900 dark:text-white'

              if (showResult) {
                if (isCorrectOption) {
                  bgColor = 'bg-green-50 dark:bg-green-900/30'
                  borderColor = 'border-green-200 dark:border-green-800'
                  textColor = 'text-green-900 dark:text-green-100'
                } else if (isSelected && !isCorrect) {
                  bgColor = 'bg-red-50 dark:bg-red-900/30'
                  borderColor = 'border-red-200 dark:border-red-800'
                  textColor = 'text-red-900 dark:text-red-100'
                }
              } else if (isSelected) {
                bgColor = 'bg-blue-50 dark:bg-blue-900/30'
                borderColor = 'border-blue-200 dark:border-blue-800'
                textColor = 'text-blue-900 dark:text-blue-100'
              }

              return (
                <button
                  key={idx}
                  onClick={() => !showResult && handleSelectOption(option)}
                  disabled={showResult}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${bgColor} ${borderColor} ${textColor} disabled:cursor-not-allowed`}
                >
                  <div className="flex items-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border-2 mr-3 text-sm font-semibold">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                    {showResult && isCorrectOption && <span className="ml-auto">✓</span>}
                    {showResult && isSelected && !isCorrect && <span className="ml-auto">✗</span>}
                  </div>
                </button>
              )
            })}
          </div>

          {showResult && currentQuestion.explanation && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">Explanation:</p>
              <p className="text-sm text-blue-800 dark:text-blue-200">{currentQuestion.explanation}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={onQuit} className="flex-1">
          Quit Quiz
        </Button>
        {showResult && (
          <Button onClick={handleNext} className="flex-1">
            {currentIndex < questions.length - 1 ? 'Next Question' : 'Complete Quiz'}
          </Button>
        )}
      </div>
    </div>
  )
}

interface QuizResultsProps {
  questions: QuizQuestion[]
  answers: Array<{ questionIndex: number; userAnswer: string; isCorrect: boolean }>
  onRetry?: () => void
  onQuit?: () => void
}

export function QuizResults({ questions, answers, onRetry, onQuit }: QuizResultsProps) {
  const correctCount = answers.filter((a) => a.isCorrect).length
  const accuracy = Math.round((correctCount / answers.length) * 100)

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card variant="elevated" className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Quiz Completed!</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-8">
            <div className="text-5xl font-bold mb-2 text-gray-900 dark:text-white">
              {accuracy}%
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You got {correctCount} out of {questions.length} correct
            </p>
            {accuracy >= 90 && <p className="text-green-600 dark:text-green-400 font-semibold">Excellent work!</p>}
            {accuracy >= 70 && accuracy < 90 && <p className="text-blue-600 dark:text-blue-400 font-semibold">Good job!</p>}
            {accuracy < 70 && <p className="text-yellow-600 dark:text-yellow-400 font-semibold">Keep practicing!</p>}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Review Your Answers:</h3>
            {answers.map((answer, idx) => (
              <Card
                key={idx}
                variant="outlined"
                className={answer.isCorrect ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <span className={`text-2xl flex-shrink-0 ${answer.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {answer.isCorrect ? '✓' : '✗'}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white mb-1">
                        {questions[answer.questionIndex].question}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Your answer: <span className="font-semibold">{answer.userAnswer}</span>
                      </p>
                      {!answer.isCorrect && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Correct answer: <span className="font-semibold">{questions[answer.questionIndex].correctAnswer}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button variant="outline" onClick={onQuit} className="flex-1">
          Back to Dashboard
        </Button>
        {onRetry && (
          <Button onClick={onRetry} className="flex-1">
            Retry Quiz
          </Button>
        )}
      </div>
    </div>
  )
}
