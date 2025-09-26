import { NextResponse } from "next/server"
import { createToken, defaultUser } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // Simple auth check (replace with real authentication)
    if (username === "admin" && password === "admin") {
      const token = await createToken(defaultUser)

      const cookieStore = await cookies()
      cookieStore.set("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 hours
      })

      return NextResponse.json({
        success: true,
        user: defaultUser,
      })
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
