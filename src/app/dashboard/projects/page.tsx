'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { Button } from '@/components/Button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/Table'
import { Spinner } from '@/components/Loading'
import { ThemeToggle } from '@/components/ThemeToggle'

interface ProjectSummary {
  id: string
  name: string
  description?: string
  status: string
  createdAt: string
  _count: {
    files: number
    words: number
  }
}

export default function ProjectsPage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (!storedToken) {
      router.push('/auth/login')
      return
    }
    setToken(storedToken)
  }, [router])

  useEffect(() => {
    if (!token) return

    const fetchProjects = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/projects', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          throw new Error('Failed to fetch projects')
        }

        const data = await res.json()
        setProjects(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch projects')
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [token])

  return (
    <DashboardLayout
      rightContent={
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button onClick={() => router.push('/dashboard/extraction')}>New Extraction</Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Projects
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your vocabulary extraction projects
            </p>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" />
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4">
            <p className="text-sm text-red-700 dark:text-red-300">❌ {error}</p>
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <Card variant="elevated">
            <CardContent>
              <div className="text-center py-10">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No projects yet. Start your first extraction!
                </p>
                <Button onClick={() => router.push('/dashboard/extraction')}>
                  Create Your First Project
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && !error && projects.length > 0 && (
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Files</TableHead>
                    <TableHead>Words</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {project.name}
                          </p>
                          {project.description && (
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {project.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{project._count.files}</TableCell>
                      <TableCell>{project._count.words}</TableCell>
                      <TableCell>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {project.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(project.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
