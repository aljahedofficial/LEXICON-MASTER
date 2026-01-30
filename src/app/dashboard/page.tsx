'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { Button } from '@/components/Button'
import { Spinner } from '@/components/Loading'
import { ThemeToggle } from '@/components/ThemeToggle'

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
}

interface StatCard {
  label: string
  value: string | number
  icon: string
  color: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/auth/login')
      return
    }
    try {
      setUser(JSON.parse(userStr))
    } catch {
      router.push('/auth/login')
    }
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  const stats: StatCard[] = [
    { label: 'Total Projects', value: '0', icon: '📁', color: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' },
    { label: 'Words Extracted', value: '0', icon: '📚', color: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' },
    { label: 'Flashcards', value: '0', icon: '📝', color: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400' },
    { label: 'Study Streak', value: '0', icon: '🔥', color: 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400' },
  ]

  return (
    <DashboardLayout
      rightContent={
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button variant="danger" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      }
    >
      {/* Header */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-primary via-secondary/60 to-primary p-6 text-white shadow-lg">
        <h2 className="text-3xl font-bold mb-2">
          Welcome back, {user?.firstName || user?.email}! 👋
        </h2>
        <p className="text-white/90">
          Here&apos;s what&apos;s happening with your vocabulary journey today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} variant="elevated">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} rounded-lg p-3 text-xl`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card variant="elevated" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Get started with Lexicon Master
              </p>
              <div className="flex flex-wrap gap-3">
                <Button>
                  ➕ New Project
                </Button>
                <Button variant="outline">
                  📤 Upload Document
                </Button>
                <Button variant="outline">
                  🎓 Start Learning
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-lg">Daily Goal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">0/20</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full w-0 bg-primary transition-all duration-300"></div>
                </div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Complete 20 flashcard reviews today
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              No activity yet. Create your first project to get started! 🚀
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {[1, 2, 3].map((idx) => (
          <Card key={idx} variant="outlined" className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Project #{idx}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Create your first extraction to populate real project data.
              </p>
              <Button variant="outline" size="sm">
                View Project
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  )
}
