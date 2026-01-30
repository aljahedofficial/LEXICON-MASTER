'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/DashboardLayout'
import { ExportSelector } from '@/components/ExportSelector'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { Toast } from '@/components/Toast'

interface Project {
  id: string
  name: string
  totalWords: number
  uniqueWords: number
  sourceCount: number
}

export default function ExportPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    if (projectId) {
      fetchProject()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch project')
      }

      const data = await response.json()
      setProject(data)
    } catch (error) {
      console.error('Error fetching project:', error)
      setToast({ message: 'Failed to load project', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleExportStart = () => {
    setToast({ message: 'Preparing export...', type: 'success' })
  }

  const handleExportComplete = () => {
    setToast({ message: 'Export downloaded successfully!', type: 'success' })
  }

  const handleExportError = (error: string) => {
    setToast({ message: error, type: 'error' })
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading project...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Card>
            <div className="p-8 text-center">
              <h2 className="text-xl font-semibold text-foreground mb-2">Project Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The project you&apos;re looking for doesn&apos;t exist.
              </p>
              <Button onClick={() => router.push('/dashboard/projects')}>
                Back to Projects
              </Button>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push(`/dashboard/projects/${projectId}`)}
            >
              ← Back to Project
            </Button>
            <h1 className="text-3xl font-bold text-foreground mt-4">Export</h1>
            <p className="text-muted-foreground mt-1">Export {project.name} in various formats</p>
          </div>
        </div>

        {/* Project Summary */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">{project.name}</h2>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Total Words</p>
                <p className="text-2xl font-bold text-foreground">
                  {project.totalWords.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unique Words</p>
                <p className="text-2xl font-bold text-foreground">
                  {project.uniqueWords.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sources</p>
                <p className="text-2xl font-bold text-foreground">{project.sourceCount}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Export Formats */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Select Export Format</h2>
          <ExportSelector
            projectId={projectId}
            projectName={project.name}
            onExportStart={handleExportStart}
            onExportComplete={handleExportComplete}
            onExportError={handleExportError}
          />
        </div>

        {/* Export Guide */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-3">Export Guide</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div>
                <strong className="text-foreground">CSV:</strong> Best for spreadsheet applications
                like Excel, Google Sheets, or data analysis tools.
              </div>
              <div>
                <strong className="text-foreground">Excel:</strong> Multi-sheet workbook with
                organized data, perfect for detailed analysis and sharing.
              </div>
              <div>
                <strong className="text-foreground">PDF Report:</strong> Professional report with
                statistics and visualizations, ideal for presentations.
              </div>
              <div>
                <strong className="text-foreground">Study Guide (PDF):</strong> Learning-focused
                format with definitions, examples, and synonyms for studying.
              </div>
              <div>
                <strong className="text-foreground">JSON:</strong> Raw data format for developers
                and custom integrations.
              </div>
              <div>
                <strong className="text-foreground">Learning Package:</strong> Complete package with
                flashcards, quizzes, and Anki-compatible import file.
              </div>
            </div>
          </div>
        </Card>
      </div>

      {toast && (
        <Toast
          id="export-toast"
          message={toast.message}
          variant={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </DashboardLayout>
  )
}
