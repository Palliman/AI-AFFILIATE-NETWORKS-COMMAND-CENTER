import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { AffiliateEntry } from "@/lib/models"

export async function GET() {
  try {
    const db = await getDatabase()
    const domains = await db.collection<AffiliateEntry>("domains").find({}).toArray()

    return NextResponse.json(domains)
  } catch (error) {
    console.error("Error fetching domains:", error)
    return NextResponse.json({ error: "Failed to fetch domains" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const db = await getDatabase()

    const newDomain: AffiliateEntry = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const result = await db.collection<AffiliateEntry>("domains").insertOne(newDomain)

    return NextResponse.json({ ...newDomain, _id: result.insertedId })
  } catch (error) {
    console.error("Error creating domain:", error)
    return NextResponse.json({ error: "Failed to create domain" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data
    const db = await getDatabase()

    const updatedDomain = {
      ...updateData,
      updatedAt: new Date().toISOString(),
    }

    await db.collection<AffiliateEntry>("domains").updateOne({ id }, { $set: updatedDomain })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating domain:", error)
    return NextResponse.json({ error: "Failed to update domain" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Domain ID is required" }, { status: 400 })
    }

    const db = await getDatabase()
    await db.collection<AffiliateEntry>("domains").deleteOne({ id })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting domain:", error)
    return NextResponse.json({ error: "Failed to delete domain" }, { status: 500 })
  }
}
