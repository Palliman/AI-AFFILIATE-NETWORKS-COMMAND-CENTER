import { type NextRequest, NextResponse } from "next/server"

interface Job {
  id: string
  type: "research" | "plan" | "content"
  status: "queued" | "running" | "completed" | "failed"
  progress: number
  result?: any
  error?: string
  createdAt: string
  updatedAt: string
  title: string
}

// In-memory job storage (in production, use Redis or database)
const jobs = new Map<string, Job>()

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const jobId = params.id
    const job = jobs.get(jobId)

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    return NextResponse.json(job)
  } catch (error) {
    console.error("Job status error:", error)
    return NextResponse.json({ error: "Failed to get job status" }, { status: 500 })
  }
}

// Helper function to create and track jobs
export function createJob(type: Job["type"], title: string): string {
  const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  const job: Job = {
    id: jobId,
    type,
    status: "queued",
    progress: 0,
    title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  jobs.set(jobId, job)
  return jobId
}

// Helper function to update job status
export function updateJob(jobId: string, updates: Partial<Job>) {
  const job = jobs.get(jobId)
  if (job) {
    const updatedJob = {
      ...job,
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    jobs.set(jobId, updatedJob)
  }
}
