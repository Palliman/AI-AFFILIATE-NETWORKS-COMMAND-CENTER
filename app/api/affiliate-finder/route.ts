import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY_AFFILIATE_FINDER) {
      return NextResponse.json({ error: "OpenAI API key not configured for affiliate finder" }, { status: 500 })
    }

    const prompt = `You are an expert affiliate marketing researcher. Analyze the query "${query}" and provide 3-5 relevant affiliate opportunities.

For each opportunity, provide:
- Program name
- Commission structure (percentage or flat rate)
- Category
- Brief description
- 3 pros
- 3 cons  
- Difficulty level (Easy/Medium/Hard)
- Earning potential (Low/Medium/High)

Format as JSON array with this structure:
[
  {
    "program": "Program Name",
    "commission": "Commission details",
    "category": "Category",
    "description": "Brief description",
    "pros": ["Pro 1", "Pro 2", "Pro 3"],
    "cons": ["Con 1", "Con 2", "Con 3"],
    "difficulty": "Easy|Medium|Hard",
    "potential": "Low|Medium|High"
  }
]

Focus on legitimate, well-known affiliate programs. Be realistic about earning potential and difficulty.`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.7,
    })

    try {
      const opportunities = JSON.parse(text)

      return NextResponse.json({
        success: true,
        opportunities,
        query,
      })
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      return NextResponse.json({ error: "Failed to parse affiliate opportunities" }, { status: 500 })
    }
  } catch (error) {
    console.error("Affiliate finder error:", error)
    return NextResponse.json({ error: "Failed to find affiliate opportunities" }, { status: 500 })
  }
}
