import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { name, description, keywords, targetDa } = await request.json()

    if (!name || !keywords || !Array.isArray(keywords)) {
      return NextResponse.json({ error: "Name and keywords array are required" }, { status: 400 })
    }

    // Simulate plan creation
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const plan = {
      id: `plan-${Date.now()}`,
      name,
      description: description || `SEO plan for ${keywords.length} keywords`,
      keywords,
      targetDa: targetDa || 50,
      status: "active",
      progress: 0,
      estimatedCompletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      metrics: {
        totalKeywords: keywords.length,
        difficulty: Math.floor(Math.random() * 40) + 30,
        estimatedTraffic: Math.floor(Math.random() * 100000) + 10000,
        budget: Math.floor(Math.random() * 5000) + 1000,
      },
    }

    return NextResponse.json({
      success: true,
      plan,
    })
  } catch (error) {
    console.error("Plan creation error:", error)
    return NextResponse.json({ error: "Failed to create plan" }, { status: 500 })
  }
}
