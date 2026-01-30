'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/Card'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { FileUpload } from '@/components/FileUpload'
import { Spinner } from '@/components/Loading'
import { ThemeToggle } from '@/components/ThemeToggle'

interface FileWithPreview extends File {
  id: string
  preview?: string
}

interface ExtractionProgress {
  fileId: string
  fileName: string
  status: 'uploading' | 'queued' | 'pending' | 'processing' | 'success' | 'error'
  progress?: number
  wordsExtracted?: number
  error?: string
}

export default function NewExtractionPage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([])
  const [uploading, setUploading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [progress, setProgress] = useState<ExtractionProgress[]>([])
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (!storedToken) {
      router.push('/auth/login')
      return
    }
    setToken(storedToken)
  }, [router])

  const handleUploadFiles = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file')
      return
    }

    if (!token) {
      setError('Please log in again')
      return
    }

    const authToken = token

    setUploading(true)
    setError('')
    setSuccess('')

    try {
      // First, create the project
      const projectRes = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: projectName || `Project ${new Date().toLocaleDateString()}`,
          description: projectDescription,
        }),
      })

      if (!projectRes.ok) {
        throw new Error('Failed to create project')
      }

      const projectData = await projectRes.json()
      const projectId = projectData.id

      // Initialize progress list
      setProgress(
        selectedFiles.map((file) => ({
          fileId: file.id,
          fileName: file.name,
          status: 'uploading' as const,
          progress: 0,
        }))
      )

      const uploadedFiles: { id: string; name: string }[] = []

      const uploadSingleFile = (file: FileWithPreview) =>
        new Promise<{ id: string; name: string }>((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.open('POST', '/api/upload')
          xhr.setRequestHeader('Authorization', `Bearer ${authToken}`)

          xhr.upload.onprogress = (event) => {
            if (!event.lengthComputable) return
            const percent = Math.round((event.loaded / event.total) * 100)
            setProgress((prev) =>
              prev.map((p) =>
                p.fileId === file.id
                  ? { ...p, progress: percent, status: 'uploading' as const }
                  : p
              )
            )
          }

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const data = JSON.parse(xhr.responseText)
              const uploaded = data.files?.[0]
              if (!uploaded) {
                reject(new Error('Upload response missing file info'))
                return
              }
              resolve({ id: uploaded.id, name: uploaded.name })
            } else {
              reject(new Error('File upload failed'))
            }
          }

          xhr.onerror = () => reject(new Error('File upload failed'))

          const formData = new FormData()
          formData.append('files', file)
          formData.append('projectId', projectId)
          xhr.send(formData)
        })

      for (const file of selectedFiles) {
        const uploaded = await uploadSingleFile(file)
        uploadedFiles.push(uploaded)
        setProgress((prev) =>
          prev.map((p) =>
            p.fileId === file.id
              ? { ...p, status: 'pending' as const, progress: 100 }
              : p
          )
        )
      }

      const fileIds = uploadedFiles.map((f) => f.id)
      setSuccess(`${uploadedFiles.length} file(s) uploaded successfully!`)

      // Auto-start extraction
      await extractText(fileIds, projectId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const extractText = async (fileIds: string[], projectId: string) => {
    setExtracting(true)
    setError('')

    if (!token) {
      setError('Please log in again')
      setExtracting(false)
      return
    }

    const authToken = token

    try {
      // Update progress to processing
      setProgress((prev) =>
        prev.map((p) => ({
          ...p,
          status: 'processing' as const,
        }))
      )

      const extractRes = await fetch('/api/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          projectId: projectId,
          fileIds: fileIds,
        }),
      })

      if (!extractRes.ok) {
        throw new Error('Text extraction failed')
      }

      const extractData = await extractRes.json()

      // Update progress with results
      setProgress(
        extractData.results.map(
          (result: {
            fileId: string
            fileName: string
            success: boolean
            wordsExtracted?: number
            error?: string
          }) => ({
            fileId: result.fileId,
            fileName: result.fileName,
            status: result.success ? ('success' as const) : ('error' as const),
            wordsExtracted: result.wordsExtracted,
            error: result.error,
          })
        )
      )

      setSuccess(
        `Extraction complete! ${extractData.summary.totalWords} unique words extracted.`
      )

      // Redirect to project page after 2 seconds
      setTimeout(() => {
        router.push(`/dashboard/projects/${projectId}`)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Extraction failed')
      setProgress((prev) =>
        prev.map((p) => ({
          ...p,
          status: 'error' as const,
          error: 'Extraction failed',
        }))
      )
    } finally {
      setExtracting(false)
    }
  }

  return (
    <DashboardLayout
      rightContent={
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            New Extraction
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Upload documents and extract vocabulary for your learning project
          </p>
        </div>

        {/* Project Info Section */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Create a new project to organize your extracted vocabulary
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Project Name (Optional)"
              placeholder="e.g., Spanish Medical Terminology"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
            <Input
              label="Description (Optional)"
              placeholder="Add notes about this project..."
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* File Upload Section */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Upload Documents</CardTitle>
            <CardDescription>
              Supported formats: PDF, TXT, DOCX, XLSX, EPUB (Max 50MB per file)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload onFilesSelected={setSelectedFiles} />
          </CardContent>
        </Card>

        {/* Alerts */}
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4">
            <p className="text-sm text-red-700 dark:text-red-300">❌ {error}</p>
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 p-4">
            <p className="text-sm text-green-700 dark:text-green-300">✅ {success}</p>
          </div>
        )}

        {/* Progress Section */}
        {progress.length > 0 && (
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Processing Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {progress.map((item) => (
                  <div
                    key={item.fileId}
                    className="flex items-center gap-3 rounded-lg bg-gray-50 dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.fileName}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {item.status === 'uploading' && `📤 Uploading... ${item.progress ?? 0}%`}
                        {item.status === 'processing' && '⏳ Processing...'}
                        {item.status === 'success' && `✅ ${item.wordsExtracted} words extracted`}
                        {item.status === 'error' && `❌ ${item.error}`}
                        {item.status === 'pending' && '⏸️ Pending'}
                      </p>
                      {item.status === 'uploading' && (
                        <div className="mt-2 h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${item.progress ?? 0}%` }}
                          />
                        </div>
                      )}
                    </div>
                    {item.status === 'processing' && <Spinner size="sm" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleUploadFiles}
            disabled={selectedFiles.length === 0 || uploading || extracting}
          >
            {uploading || extracting ? (
              <>
                <Spinner size="sm" /> Processing...
              </>
            ) : (
              '📤 Upload & Extract'
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
            disabled={uploading || extracting}
          >
            Cancel
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
