import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Mock active jobs
    const jobs = [
      {
        id: "job-1",
        type: "keyword_analysis",
        status: "running",
        progress: 65,
        startedAt: new Date(Date.now() - 300000).toISOString(),
        estimatedCompletion: new Date(Date.now() + 180000).toISOString(),
        logs: [
          "Initializing keyword analysis...",
          "Fetching search volume data...",
          "Analyzing competition metrics...",
        ],
      },
      {
        id: "job-2",
        type: "domain_research",
        status: "completed",
        progress: 100,
        startedAt: new Date(Date.now() - 600000).toISOString(),
        logs: ["Scanning domain metrics...", "Checking DA/PA scores...", "Analysis complete"],
      },
    ]

    return NextResponse.json({ jobs })
  } catch (error) {
    console.error("Jobs fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { type, data } = await request.json()

    if (!type) {
      return NextResponse.json({ error: "Job type is required" }, { status: 400 })
    }

    const job = {
      id: `job-${Date.now()}`,
      type,
      status: "pending",
      progress: 0,
      startedAt: new Date().toISOString(),
      data,
      logs: [`Initializing ${type}...`],
    }

    return NextResponse.json({ success: true, job })
  } catch (error) {
    console.error("Job creation error:", error)
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 })
  }
}
