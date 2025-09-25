import { NextResponse } from "next/server"
import type { NewsItem } from "@/app/page" // Assuming NewsItem type is exported

export async function GET() {
  const apiKey = process.env.NEWS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "News API key is not configured." }, { status: 500 })
  }

  // Example: Fetching news with keywords 'crypto' OR 'bitcoin' OR 'ethereum' from NewsAPI.org
  // Adjust the URL and parameters based on your specific news API provider and needs.
  const newsApiUrl = `https://newsapi.org/v2/everything?q=crypto%20OR%20bitcoin%20OR%20ethereum&language=en&sortBy=publishedAt&pageSize=20&apiKey=${apiKey}`

  try {
    const response = await fetch(newsApiUrl, {
      next: { revalidate: 3600 }, // Revalidate data every hour
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("News API error (Crypto):", errorData)
      return NextResponse.json(
        { error: `Failed to fetch crypto news: ${errorData.message || response.statusText}` },
        { status: response.status },
      )
    }

    const data = await response.json()

    // Transform articles to NewsItem format
    const articles: NewsItem[] = data.articles
      .map((article: any) => ({
        id: article.source?.id || article.title.slice(0, 20).replace(/\s/g, "-"),
        title: article.title || "No title",
        category: "crypto",
        source: article.source?.name || "Unknown Source",
        url: article.url,
        timestamp: new Date(article.publishedAt).toLocaleString(),
      }))
      .slice(0, 10) // Take top 10

    return NextResponse.json(articles)
  } catch (error) {
    console.error("Error fetching crypto news:", error)
    return NextResponse.json({ error: "An internal error occurred while fetching crypto news." }, { status: 500 })
  }
}
