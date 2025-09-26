import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { ResearchResult } from "@/lib/models"

export async function GET() {
  try {
    const db = await getDatabase()
    const results = await db.collection<ResearchResult>("research_results").find({}).toArray()

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Database error:", error)

    // Return mock data if database fails
    const mockResults: ResearchResult[] = [
      {
        id: "1",
        query: "best laptops 2024",
        results: {
          domains: [],
          keywords: ["best laptops", "laptop reviews", "2024 laptops"],
          competition: 75,
          opportunity: 65,
        },
        createdAt: new Date().toISOString(),
      },
    ]

    return NextResponse.json({ results: mockResults })
  }
}

export async function POST(request: Request) {
  try {
    const { query, domains, keywords } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    const result: ResearchResult = {
      id: `result-${Date.now()}`,
      query,
      results: {
        domains: domains || [],
        keywords: keywords || [],
        competition: Math.floor(Math.random() * 100),
        opportunity: Math.floor(Math.random() * 100),
      },
      createdAt: new Date().toISOString(),
    }

    try {
      const db = await getDatabase()
      await db.collection<ResearchResult>("research_results").insertOne(result)
    } catch (dbError) {
      console.error("Database insert error:", dbError)
      // Continue with mock response
    }

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("Research result creation error:", error)
    return NextResponse.json({ error: "Failed to create research result" }, { status: 500 })
  }
}
