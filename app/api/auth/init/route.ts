import { NextResponse } from "next/server"
import { createToken, defaultUser } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST() {
  try {
    // Auto-login for development
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
  } catch (error) {
    console.error("Init auth error:", error)
    return NextResponse.json({ error: "Init failed" }, { status: 500 })
  }
}
