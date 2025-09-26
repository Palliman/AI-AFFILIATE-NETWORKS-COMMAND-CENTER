import { NextResponse } from "next/server"

export async function GET() {
  try {
    if (!process.env.NEWS_API_KEY) {
      return NextResponse.json({ error: "News API key not configured" }, { status: 500 })
    }

    const response = await fetch(
      `https://newsapi.org/v2/everything?q=cryptocurrency OR bitcoin OR ethereum&sortBy=publishedAt&pageSize=10&apiKey=${process.env.NEWS_API_KEY}`,
      { next: { revalidate: 300 } }, // Cache for 5 minutes
    )

    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({
      articles:
        data.articles?.map((article: any) => ({
          title: article.title,
          description: article.description,
          url: article.url,
          publishedAt: article.publishedAt,
          source: article.source?.name,
        })) || [],
    })
  } catch (error) {
    console.error("Crypto news fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch crypto news" }, { status: 500 })
  }
}
