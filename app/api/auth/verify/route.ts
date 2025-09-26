import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Token verification error:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
