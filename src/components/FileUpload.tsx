'use client'

import { useCallback, useState, useRef } from 'react'
import { Button } from './Button'

interface FileWithPreview extends File {
  preview?: string
  id: string
}

interface FileUploadProps {
  onFilesSelected: (files: FileWithPreview[]) => void
  maxSize?: number // in bytes
  maxFiles?: number
  acceptedFormats?: string[]
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

const getFileIcon = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase()
  const icons: Record<string, string> = {
    pdf: '📄',
    txt: '📝',
    doc: '📘',
    docx: '📘',
    xlsx: '📊',
    xls: '📊',
    epub: '📕',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
  }
  return icons[ext || ''] || '📎'
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  maxSize = 50 * 1024 * 1024, // 50MB default
  maxFiles = 10,
  acceptedFormats = ['pdf', 'txt', 'docx', 'doc', 'xlsx', 'xls', 'epub'],
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFiles = useCallback(
    (files: File[]): { valid: FileWithPreview[]; errors: string[] } => {
      const validFiles: FileWithPreview[] = []
      const newErrors: string[] = []

      if (selectedFiles.length + files.length > maxFiles) {
        newErrors.push(`Cannot exceed ${maxFiles} files. You have ${selectedFiles.length} file(s) already.`)
        return { valid: [], errors: newErrors }
      }

      files.forEach((file) => {
        const ext = file.name.split('.').pop()?.toLowerCase() || ''

        if (!acceptedFormats.includes(ext)) {
          newErrors.push(`${file.name}: File type .${ext} is not supported. Accepted: ${acceptedFormats.join(', ')}`)
          return
        }

        if (file.size > maxSize) {
          newErrors.push(`${file.name}: File size (${formatFileSize(file.size)}) exceeds maximum (${formatFileSize(maxSize)})`)
          return
        }

        // Check for duplicates
        if (selectedFiles.some((f) => f.name === file.name && f.size === file.size)) {
          newErrors.push(`${file.name}: File already added`)
          return
        }

        const fileWithPreview: FileWithPreview = Object.assign(file, {
          id: `${file.name}-${file.size}-${Date.now()}`,
        })
        validFiles.push(fileWithPreview)
      })

      return { valid: validFiles, errors: newErrors }
    },
    [acceptedFormats, maxFiles, maxSize, selectedFiles]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const droppedFiles = Array.from(e.dataTransfer.files)
      const { valid, errors } = validateFiles(droppedFiles)

      if (errors.length > 0) {
        setErrors(errors)
      }

      if (valid.length > 0) {
        const newFiles = [...selectedFiles, ...valid]
        setSelectedFiles(newFiles)
        onFilesSelected(newFiles)
        setErrors([])
      }
    },
    [onFilesSelected, selectedFiles, validateFiles]
  )

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const { valid, errors } = validateFiles(files)

    if (errors.length > 0) {
      setErrors(errors)
    }

    if (valid.length > 0) {
      const newFiles = [...selectedFiles, ...valid]
      setSelectedFiles(newFiles)
      onFilesSelected(newFiles)
      setErrors([])
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeFile = (fileId: string) => {
    const newFiles = selectedFiles.filter((f) => f.id !== fileId)
    setSelectedFiles(newFiles)
    onFilesSelected(newFiles)
  }

  const clearAll = () => {
    setSelectedFiles([])
    setErrors([])
    onFilesSelected([])
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-lg border-2 border-dashed transition-all ${
          isDragging
            ? 'border-primary bg-primary/5 dark:bg-primary/10'
            : 'border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800'
        } p-12 text-center cursor-pointer`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInput}
          className="hidden"
          accept={acceptedFormats.map((f) => `.${f}`).join(',')}
        />

        <div className="flex flex-col items-center justify-center gap-4">
          <div className="text-5xl">📤</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Drag and drop files here
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              or click to browse from your computer
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
              Supported formats: {acceptedFormats.join(', ').toUpperCase()}
              <br />
              Maximum size: {formatFileSize(maxSize)} per file
            </p>
          </div>
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="pointer-events-auto"
          >
            Browse Files
          </Button>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4">
          <h4 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">
            ⚠️ Validation Errors
          </h4>
          <ul className="space-y-1">
            {errors.map((error, i) => (
              <li key={i} className="text-sm text-red-700 dark:text-red-400">
                • {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Files List */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              Selected Files ({selectedFiles.length}/{maxFiles})
            </h4>
            {selectedFiles.length > 0 && (
              <button
                onClick={clearAll}
                className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="space-y-2">
            {selectedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 rounded-lg bg-gray-50 dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700"
              >
                <div className="text-2xl">{getFileIcon(file.name)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  onClick={() => removeFile(file.id)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label="Remove file"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
