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
