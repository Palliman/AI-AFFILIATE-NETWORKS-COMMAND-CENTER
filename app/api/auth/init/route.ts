import { NextResponse } from "next/server"
import { initializeUsers } from "@/lib/auth"

export async function POST() {
  try {
    await initializeUsers()
    return NextResponse.json({ success: true, message: "Users initialized successfully" })
  } catch (error) {
    console.error("User initialization error:", error)
    return NextResponse.json({ error: "Failed to initialize users" }, { status: 500 })
  }
}
