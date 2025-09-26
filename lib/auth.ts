import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-this-in-production")

export interface User {
  id: string
  username: string
  role: "admin" | "user"
}

export async function createToken(user: User): Promise<string> {
  return await new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret)
}

export async function verifyToken(token: string): Promise<User | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload.user as User
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return null
    }

    return await verifyToken(token)
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}

export const defaultUser: User = {
  id: "admin",
  username: "admin",
  role: "admin",
}
