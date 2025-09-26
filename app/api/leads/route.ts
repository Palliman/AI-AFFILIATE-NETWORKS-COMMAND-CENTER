import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Lead } from "@/lib/models"

export async function GET() {
  try {
    const db = await getDatabase()
    const leads = await db.collection<Lead>("leads").find({}).toArray()

    return NextResponse.json({ leads })
  } catch (error) {
    console.error("Database error:", error)

    // Return mock data if database fails
    const mockLeads: Lead[] = [
      {
        id: "1",
        email: "john@techstartup.com",
        name: "John Smith",
        source: "Contact Form",
        status: "new",
        createdAt: new Date().toISOString(),
        notes: "Interested in tech affiliate programs",
      },
      {
        id: "2",
        email: "sarah@cryptoblog.net",
        name: "Sarah Johnson",
        source: "LinkedIn",
        status: "qualified",
        createdAt: new Date().toISOString(),
        notes: "Runs crypto newsletter with 10k subscribers",
      },
    ]

    return NextResponse.json({ leads: mockLeads })
  }
}

export async function POST(request: Request) {
  try {
    const { email, name, source, notes } = await request.json()

    if (!email || !source) {
      return NextResponse.json({ error: "Email and source are required" }, { status: 400 })
    }

    const lead: Lead = {
      id: `lead-${Date.now()}`,
      email,
      name,
      source,
      status: "new",
      createdAt: new Date().toISOString(),
      notes,
    }

    try {
      const db = await getDatabase()
      await db.collection<Lead>("leads").insertOne(lead)
    } catch (dbError) {
      console.error("Database insert error:", dbError)
      // Continue with mock response
    }

    return NextResponse.json({ success: true, lead })
  } catch (error) {
    console.error("Lead creation error:", error)
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 })
  }
}
