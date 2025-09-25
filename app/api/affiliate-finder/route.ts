import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const openaiKey = process.env.OPENAI_API_KEY_AFFILIATE_FINDER
  const googleApiKey = process.env.GOOGLE_API_KEY
  const googleSearchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID

  // Check all required environment variables
  if (!openaiKey) {
    console.error("OpenAI API key for Affiliate Finder is not configured.")
    return NextResponse.json({ error: "OpenAI API key for Affiliate Finder is not configured." }, { status: 500 })
  }

  if (!googleApiKey) {
    console.error("Google API key is not configured.")
    return NextResponse.json({ error: "Google API key is not configured." }, { status: 500 })
  }

  if (!googleSearchEngineId) {
    console.error("Google Search Engine ID is not configured.")
    return NextResponse.json({ error: "Google Search Engine ID is not configured." }, { status: 500 })
  }

  console.log("Affiliate Finder API: All API keys configured successfully.")

  try {
    const { prompt: userPrompt } = await req.json()
    console.log("Affiliate Finder API: Received user prompt:", userPrompt)

    if (!userPrompt) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 })
    }

    // Step 1: Generate search query using OpenAI API directly
    console.log("Affiliate Finder API: Step 1 - Generating search query with OpenAI...")

    const searchQueryResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert at creating effective search queries for finding affiliate programs. 
Your goal is to create search terms that will find real affiliate programs, partner programs, or referral programs related to the user's input.
Focus on terms that would lead to actual sign-up pages or program descriptions.
Return only the search query, nothing else.`,
          },
          {
            role: "user",
            content: `Create an effective Google search query to find affiliate programs related to: "${userPrompt}"
Examples of good search queries:
- "pet CBD affiliate program"
- "eco-friendly products partner program" 
- "software affiliate program commission"
- "health supplements referral program"

Create a similar search query for: "${userPrompt}"`,
          },
        ],
        max_tokens: 100,
        temperature: 0.7,
      }),
    })

    if (!searchQueryResponse.ok) {
      throw new Error(`OpenAI API error: ${searchQueryResponse.status}`)
    }

    const searchQueryData = await searchQueryResponse.json()
    const searchQuery = searchQueryData.choices[0]?.message?.content?.trim() || userPrompt

    console.log("Affiliate Finder API: Generated search query:", searchQuery)

    // Step 2: Use Google Custom Search API to get real results
    console.log("Affiliate Finder API: Step 2 - Searching Google with query:", searchQuery)
    const googleSearchUrl = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${googleSearchEngineId}&q=${encodeURIComponent(searchQuery)}&num=10`

    const googleResponse = await fetch(googleSearchUrl)
    if (!googleResponse.ok) {
      const errorData = await googleResponse.json()
      console.error("Google Search API error:", errorData)
      return NextResponse.json(
        { error: `Google Search API error: ${errorData.error?.message || googleResponse.statusText}` },
        { status: googleResponse.status },
      )
    }

    const googleResults = await googleResponse.json()
    console.log("Affiliate Finder API: Google search returned", googleResults.items?.length || 0, "results")

    // Step 3: Use OpenAI to analyze search results and extract affiliate opportunities
    console.log("Affiliate Finder API: Step 3 - Analyzing search results with OpenAI...")

    // Prepare search results for analysis
    const searchResultsText =
      googleResults.items
        ?.slice(0, 8) // Limit to first 8 results to avoid token limits
        ?.map(
          (item: any, index: number) =>
            `Result ${index + 1}:
Title: ${item.title}
URL: ${item.link}
Snippet: ${item.snippet}
---`,
        )
        .join("\n") || "No search results found."

    const analysisResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert affiliate marketing researcher. Analyze the provided Google search results and extract real affiliate program opportunities.
Look for:
- Actual affiliate programs, partner programs, or referral programs
- Commission structures mentioned in the snippets
- Sign-up URLs or program pages
- Indicators of competition level based on the search results

Focus on real, actionable opportunities that the user can actually sign up for.
Return your response as a JSON array of opportunities with this structure:
[
  {
    "id": "unique-id",
    "programName": "Program Name",
    "category": "Category",
    "commission": "Commission info if available",
    "competition": "Low|Medium|High|Unknown",
    "url": "URL from search results",
    "notes": "Brief notes about the opportunity"
  }
]`,
          },
          {
            role: "user",
            content: `Analyze these Google search results for "${userPrompt}" and extract affiliate program opportunities:

${searchResultsText}

Based on these real search results, identify affiliate programs the user could join. For each opportunity, assess the competition level based on how many similar programs appeared in the results and the specificity of the programs found.`,
          },
        ],
        max_tokens: 1500,
        temperature: 0.3,
      }),
    })

    if (!analysisResponse.ok) {
      throw new Error(`OpenAI analysis API error: ${analysisResponse.status}`)
    }

    const analysisData = await analysisResponse.json()
    const analysisText = analysisData.choices[0]?.message?.content?.trim() || "[]"

    // Try to parse JSON response
    let opportunities = []
    try {
      opportunities = JSON.parse(analysisText)
    } catch (parseError) {
      console.error("Failed to parse OpenAI response as JSON:", parseError)
      // Fallback: create a simple opportunity from the search results
      opportunities = [
        {
          id: `opp-${Date.now()}`,
          programName: `${userPrompt} Affiliate Programs`,
          category: "General",
          commission: "Unknown",
          competition: "Medium",
          url: googleResults.items?.[0]?.link || `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`,
          notes: "Multiple opportunities found in search results. Click to explore further.",
        },
      ]
    }

    console.log("Affiliate Finder API: Successfully extracted opportunities:", opportunities)
    return NextResponse.json(opportunities)
  } catch (error: any) {
    console.error("Affiliate Finder API: Error in workflow:", error)

    let errorMessage = "An internal error occurred during affiliate opportunity search."

    if (error.message?.includes("OpenAI")) {
      errorMessage = "OpenAI API error. Please check your API key and try again."
    } else if (error.message?.includes("Google")) {
      errorMessage = "Google Search API error. Please check your API configuration."
    } else if (error.message) {
      errorMessage = error.message
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
