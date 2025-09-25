import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { ResearchResult } from "@/lib/models"

export async function GET() {
  try {
    const db = await getDatabase()
    const results = await db.collection<ResearchResult>("research_results").find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error fetching research results:", error)
    return NextResponse.json({ error: "Failed to fetch research results" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const db = await getDatabase()

    const newResult: ResearchResult = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const result = await db.collection<ResearchResult>("research_results").insertOne(newResult)

    return NextResponse.json({ ...newResult, _id: result.insertedId })
  } catch (error) {
    console.error("Error saving research result:", error)
    return NextResponse.json({ error: "Failed to save research result" }, { status: 500 })
  }
}
