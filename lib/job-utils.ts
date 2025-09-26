export interface Job {
  id: string
  type: string
  status: "pending" | "running" | "completed" | "failed"
  progress: number
  startedAt: string
  estimatedCompletion?: string
  logs: string[]
}

export function createJob(type: string): Job {
  return {
    id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    status: "pending",
    progress: 0,
    startedAt: new Date().toISOString(),
    logs: [`Initializing ${type}...`],
  }
}

export function updateJobProgress(job: Job, progress: number, log?: string): Job {
  const updatedJob = { ...job, progress }

  if (log) {
    updatedJob.logs = [...job.logs, log]
  }

  if (progress >= 100) {
    updatedJob.status = "completed"
  } else if (progress > 0) {
    updatedJob.status = "running"
  }

  return updatedJob
}

export function estimateCompletion(job: Job): string {
  const elapsed = Date.now() - new Date(job.startedAt).getTime()
  const rate = job.progress / elapsed
  const remaining = (100 - job.progress) / rate

  return new Date(Date.now() + remaining).toISOString()
}
