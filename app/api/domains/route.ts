import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Domain } from "@/lib/models"

export async function GET() {
  try {
    const db = await getDatabase()
    const domains = await db.collection<Domain>("domains").find({}).toArray()

    return NextResponse.json({ domains })
  } catch (error) {
    console.error("Database error:", error)

    // Return mock data if database fails
    const mockDomains: Domain[] = [
      {
        id: "1",
        url: "techreview.com",
        da: 45,
        traffic: 125000,
        niche: "Technology",
        status: "active",
        lastChecked: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        url: "cryptoinsights.net",
        da: 38,
        traffic: 89000,
        niche: "Cryptocurrency",
        status: "active",
        lastChecked: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
    ]

    return NextResponse.json({ domains: mockDomains })
  }
}

export async function POST(request: Request) {
  try {
    const { url, niche, targetDa } = await request.json()

    if (!url || !niche) {
      return NextResponse.json({ error: "URL and niche are required" }, { status: 400 })
    }

    const domain: Domain = {
      id: `domain-${Date.now()}`,
      url,
      da: Math.floor(Math.random() * 50) + 20,
      traffic: Math.floor(Math.random() * 200000) + 10000,
      niche,
      status: "pending",
      lastChecked: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }

    try {
      const db = await getDatabase()
      await db.collection<Domain>("domains").insertOne(domain)
    } catch (dbError) {
      console.error("Database insert error:", dbError)
      // Continue with mock response
    }

    return NextResponse.json({ success: true, domain })
  } catch (error) {
    console.error("Domain creation error:", error)
    return NextResponse.json({ error: "Failed to create domain" }, { status: 500 })
  }
}
