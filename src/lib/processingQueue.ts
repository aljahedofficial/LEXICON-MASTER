import { randomUUID } from 'crypto'

export type JobItemStatus = {
  fileId: string
  fileName: string
  status: 'queued' | 'processing' | 'success' | 'error'
  progress: number
  wordsExtracted?: number
  wordCount?: number
  uniqueWords?: number
  error?: string
}

export type JobStatus = {
  jobId: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  totalFiles: number
  completedFiles: number
  failedFiles: number
  items: JobItemStatus[]
  createdAt: string
  updatedAt: string
}

type QueueTask = () => Promise<void>

const jobs = new Map<string, JobStatus>()

const queue = {
  running: 0,
  concurrency: 3,
  tasks: [] as QueueTask[],
}

const runNext = () => {
  while (queue.running < queue.concurrency && queue.tasks.length > 0) {
    const task = queue.tasks.shift()
    if (!task) return
    queue.running += 1
    task()
      .catch(() => undefined)
      .finally(() => {
        queue.running -= 1
        runNext()
      })
  }
}

export const createExtractionJob = (files: Array<{ id: string; name: string }>): JobStatus => {
  const jobId = randomUUID()
  const now = new Date().toISOString()
  const job: JobStatus = {
    jobId,
    status: 'queued',
    totalFiles: files.length,
    completedFiles: 0,
    failedFiles: 0,
    items: files.map((file) => ({
      fileId: file.id,
      fileName: file.name,
      status: 'queued',
      progress: 0,
    })),
    createdAt: now,
    updatedAt: now,
  }

  jobs.set(jobId, job)
  return job
}

export const getExtractionJob = (jobId: string): JobStatus | undefined => jobs.get(jobId)

export const enqueueExtractionTask = (
  jobId: string,
  fileId: string,
  task: () => Promise<{ wordsExtracted?: number; wordCount?: number; uniqueWords?: number }>
) => {
  queue.tasks.push(async () => {
    const job = jobs.get(jobId)
    if (!job) return

    const item = job.items.find((i) => i.fileId === fileId)
    if (!item) return

    job.status = 'processing'
    item.status = 'processing'
    item.progress = 50
    job.updatedAt = new Date().toISOString()

    try {
      const result = await task()
      item.status = 'success'
      item.progress = 100
      item.wordsExtracted = result.wordsExtracted
      item.wordCount = result.wordCount
      item.uniqueWords = result.uniqueWords
      job.completedFiles += 1
    } catch (error) {
      item.status = 'error'
      item.progress = 100
      item.error = error instanceof Error ? error.message : 'Processing failed'
      job.failedFiles += 1
    }

    job.updatedAt = new Date().toISOString()
    if (job.completedFiles + job.failedFiles >= job.totalFiles) {
      job.status = job.failedFiles > 0 ? 'failed' : 'completed'
    }
  })

  runNext()
}
