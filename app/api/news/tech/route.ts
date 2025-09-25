import { NextResponse } from "next/server"
import type { NewsItem } from "@/app/page" // Assuming NewsItem type is exported from page.tsx or a types file

export async function GET() {
  const apiKey = process.env.NEWS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "News API key is not configured." }, { status: 500 })
  }

  // Example: Fetching top headlines in the 'technology' category from NewsAPI.org
  // Adjust the URL and parameters based on your specific news API provider and needs.
  // Common parameters: category, country, q (keywords)
  const newsApiUrl = `https://newsapi.org/v2/top-headlines?category=technology&language=en&pageSize=20&apiKey=${apiKey}`

  try {
    const response = await fetch(newsApiUrl, {
      next: { revalidate: 3600 }, // Revalidate data every hour
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("News API error (Tech):", errorData)
      return NextResponse.json(
        { error: `Failed to fetch tech news: ${errorData.message || response.statusText}` },
        { status: response.status },
      )
    }

    const data = await response.json()

    // Transform articles to NewsItem format if necessary
    const articles: NewsItem[] = data.articles
      .map((article: any) => ({
        id: article.source?.id || article.title.slice(0, 20).replace(/\s/g, "-"), // Ensure unique ID
        title: article.title || "No title",
        category: "general_tech", // Or more specific if available
        source: article.source?.name || "Unknown Source",
        url: article.url,
        timestamp: new Date(article.publishedAt).toLocaleString(), // Format timestamp
      }))
      .slice(0, 10) // Take top 10 or so for the ticker

    return NextResponse.json(articles)
  } catch (error) {
    console.error("Error fetching tech news:", error)
    return NextResponse.json({ error: "An internal error occurred while fetching tech news." }, { status: 500 })
  }
}
