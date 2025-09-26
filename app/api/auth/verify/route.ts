import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { getUserByUsername } from "@/lib/auth"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// Force dynamic rendering for this route
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any

    // Get fresh user data
    const user = await getUserByUsername(decoded.username)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        lastLogin: user.lastLogin,
      },
    })
  } catch (error) {
    console.error("Token verification error:", error)
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}
