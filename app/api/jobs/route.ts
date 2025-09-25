import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Job } from "@/lib/models"

export async function GET() {
  try {
    const db = await getDatabase()
    const jobs = await db.collection<Job>("jobs").find({}).sort({ createdAt: -1 }).limit(20).toArray()

    return NextResponse.json(jobs)
  } catch (error) {
    console.error("Error fetching jobs:", error)
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const db = await getDatabase()

    const newJob: Job = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const result = await db.collection<Job>("jobs").insertOne(newJob)

    return NextResponse.json({ ...newJob, _id: result.insertedId })
  } catch (error) {
    console.error("Error creating job:", error)
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 })
  }
}
