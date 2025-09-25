import { openai } from "@ai-sdk/openai"
import { generateText, tool } from "ai"
import { z } from "zod"
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

    // Step 1: Use OpenAI to generate an effective search query
    console.log("Affiliate Finder API: Step 1 - Generating search query with OpenAI...")
    const searchQueryResult = await generateText({
      model: openai("gpt-4o", { apiKey: openaiKey }),
      system: `You are an expert at creating effective search queries for finding affiliate programs. 
Your goal is to create search terms that will find real affiliate programs, partner programs, or referral programs related to the user's input.
Focus on terms that would lead to actual sign-up pages or program descriptions.
Return only the search query, nothing else.`,
      prompt: `Create an effective Google search query to find affiliate programs related to: "${userPrompt}"
Examples of good search queries:
- "pet CBD affiliate program"
- "eco-friendly products partner program" 
- "software affiliate program commission"
- "health supplements referral program"

Create a similar search query for: "${userPrompt}"`,
    })

    const searchQuery = searchQueryResult.text.trim()
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

    const analysisResult = await generateText({
      model: openai("gpt-4o", { apiKey: openaiKey }),
      system: `You are an expert affiliate marketing researcher. Analyze the provided Google search results and extract real affiliate program opportunities.
Look for:
- Actual affiliate programs, partner programs, or referral programs
- Commission structures mentioned in the snippets
- Sign-up URLs or program pages
- Indicators of competition level based on the search results

Focus on real, actionable opportunities that the user can actually sign up for.`,
      prompt: `Analyze these Google search results for "${userPrompt}" and extract affiliate program opportunities:

${searchResultsText}

Based on these real search results, identify affiliate programs the user could join. For each opportunity, assess the competition level based on how many similar programs appeared in the results and the specificity of the programs found.`,
      tools: {
        extractAffiliateOpportunities: tool({
          description: "Extract affiliate program opportunities from search results.",
          parameters: z.object({
            opportunities: z.array(
              z.object({
                id: z.string().describe("A unique ID for the opportunity"),
                programName: z.string().describe("The name of the affiliate program or company"),
                category: z.string().describe("The category (e.g., Health, Software, E-commerce)"),
                commission: z.string().optional().describe("Commission structure if mentioned in search results"),
                competition: z
                  .enum(["Low", "Medium", "High", "Unknown"])
                  .describe("Estimated competition level based on search results"),
                url: z.string().describe("The actual URL from search results or the company domain"),
                notes: z
                  .string()
                  .describe("Brief notes about the opportunity, why it might be good, or how to find more info"),
              }),
            ),
          }),
          execute: async ({ opportunities }) => {
            console.log("Affiliate Finder API: Extracted", opportunities.length, "opportunities from search results")
            return opportunities
          },
        }),
      },
    })

    // Wait for the tool to be called and get the results
    const toolCalls = await analysisResult.toolCalls
    if (toolCalls && toolCalls.length > 0) {
      const opportunities = toolCalls[0].result
      console.log("Affiliate Finder API: Successfully extracted opportunities:", opportunities)
      return NextResponse.json(opportunities)
    } else {
      console.log("Affiliate Finder API: No opportunities extracted from search results")
      return NextResponse.json([])
    }
  } catch (error: any) {
    console.error("Affiliate Finder API: Error in workflow:", error)

    let errorMessage = "An internal error occurred during affiliate opportunity search."

    // Handle specific API errors
    if (error.name === "AI_APICallError" || (error.cause && error.cause.name === "AI_APICallError")) {
      const apiCallError = error.name === "AI_APICallError" ? error : error.cause
      console.error("Affiliate Finder API: OpenAI API Error:", {
        message: apiCallError.message,
        statusCode: apiCallError.statusCode,
      })

      if (apiCallError.statusCode === 401) {
        errorMessage = "OpenAI API authentication failed. Please check your API key."
      } else if (apiCallError.statusCode === 429) {
        errorMessage = "OpenAI API rate limit exceeded. Please try again later."
      } else {
        errorMessage = `OpenAI API Error: ${apiCallError.message || "Unknown error"}`
      }
    } else if (error.message) {
      errorMessage = error.message
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
