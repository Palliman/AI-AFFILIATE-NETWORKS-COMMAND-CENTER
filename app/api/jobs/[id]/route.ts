import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const jobId = params.id

    // Mock job data
    const job = {
      id: jobId,
      type: "keyword_analysis",
      status: Math.random() > 0.3 ? "completed" : "running",
      progress: Math.floor(Math.random() * 100),
      startedAt: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      estimatedCompletion: new Date(Date.now() + Math.random() * 1800000).toISOString(),
      logs: [
        "Initializing keyword analysis...",
        "Fetching search volume data...",
        "Analyzing competition metrics...",
        "Generating difficulty scores...",
        "Clustering related keywords...",
        "Finalizing results...",
      ].slice(0, Math.floor(Math.random() * 6) + 1),
    }

    return NextResponse.json(job)
  } catch (error) {
    console.error("Job fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 })
  }
}
