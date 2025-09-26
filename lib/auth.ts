import { getDatabase } from "@/lib/mongodb"
import bcrypt from "bcryptjs"

export interface User {
  _id?: string
  id: string
  username: string
  password: string
  role: "admin" | "user"
  createdAt: string
  updatedAt: string
  lastLogin?: string
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Create user
export async function createUser(username: string, password: string, role: "admin" | "user" = "user"): Promise<User> {
  const db = await getDatabase()

  // Check if user already exists
  const existingUser = await db.collection<User>("users").findOne({ username })
  if (existingUser) {
    throw new Error("User already exists")
  }

  const hashedPassword = await hashPassword(password)
  const newUser: User = {
    id: `user-${Date.now()}`,
    username,
    password: hashedPassword,
    role,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const result = await db.collection<User>("users").insertOne(newUser)
  return { ...newUser, _id: result.insertedId }
}

// Authenticate user
export async function authenticateUser(username: string, password: string): Promise<User | null> {
  const db = await getDatabase()

  const user = await db.collection<User>("users").findOne({ username })
  if (!user) {
    return null
  }

  const isValid = await verifyPassword(password, user.password)
  if (!isValid) {
    return null
  }

  // Update last login
  await db.collection<User>("users").updateOne(
    { username },
    {
      $set: {
        lastLogin: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
  )

  return user
}

// Get user by username
export async function getUserByUsername(username: string): Promise<User | null> {
  const db = await getDatabase()
  return db.collection<User>("users").findOne({ username })
}

// Initialize default users
export async function initializeUsers(): Promise<void> {
  const db = await getDatabase()

  // Check if users collection is empty
  const userCount = await db.collection<User>("users").countDocuments()
  if (userCount > 0) {
    console.log("Users already exist in database")
    return
  }

  console.log("Initializing default users...")

  const defaultUsers = [
    { username: "Palliman", password: "Megaman$", role: "admin" as const },
    { username: "Signull", password: "Megaman$", role: "user" as const },
    { username: "1llw1ll", password: "Megaman$", role: "user" as const },
  ]

  for (const userData of defaultUsers) {
    try {
      await createUser(userData.username, userData.password, userData.role)
      console.log(`✅ Created user: ${userData.username}`)
    } catch (error) {
      console.error(`❌ Failed to create user ${userData.username}:`, error)
    }
  }

  console.log("Default users initialization complete")
}
