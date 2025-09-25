import { type NextRequest, NextResponse } from "next/server"

interface KeywordData {
  keyword: string
  volume: number
  competition: number
  cpc: number
  difficulty: number
  cluster?: string
}

interface ResearchResult {
  id: string
  country: string
  niche: string
  keywords: KeywordData[]
  opportunityScore: number
  competitionScore: number
  volumeScore: number
  cpcRpmScore: number
  saturationScore: number
  localizationPenalty: number
  totalScore: number
  status: "pending" | "running" | "completed" | "failed"
  createdAt: string
}

// SerpAPI Integration
async function getSerpAPIData(keyword: string, country: string) {
  const serpApiKey = process.env.SERPAPI_KEY
  if (!serpApiKey) {
    throw new Error("SERPAPI_KEY environment variable is not set")
  }

  const countryCode = getCountryCode(country)
  const url = `https://serpapi.com/search.json?engine=google_keyword&q=${encodeURIComponent(keyword)}&gl=${countryCode}&api_key=${serpApiKey}`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`SerpAPI error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Extract keyword metrics from SerpAPI response
    const keywordData = data.keyword_info || {}

    return {
      volume: keywordData.monthly_searches?.[0]?.search_volume || 0,
      cpc: keywordData.cpc || 0,
      competition: keywordData.competition || 0,
      relatedKeywords: data.related_keywords || [],
    }
  } catch (error) {
    console.error(`SerpAPI error for keyword "${keyword}":`, error)
    throw error
  }
}

// Moz API Integration
async function getMozData(keyword: string) {
  const mozAccessId = process.env.MOZ_ACCESS_ID
  const mozSecretKey = process.env.MOZ_SECRET_KEY

  if (!mozAccessId || !mozSecretKey) {
    throw new Error("MOZ_ACCESS_ID and MOZ_SECRET_KEY environment variables are required")
  }

  // Moz API requires authentication
  const expires = Math.floor(Date.now() / 1000) + 300 // 5 minutes from now
  const stringToSign = `${mozAccessId}\n${expires}`

  // Create HMAC signature (you'll need to install crypto if not available)
  const crypto = require("crypto")
  const signature = crypto.createHmac("sha1", mozSecretKey).update(stringToSign).digest("base64")

  const authString = `${mozAccessId}:${signature}:${expires}`

  try {
    // Moz Keyword Explorer API
    const response = await fetch("https://lsapi.seomoz.com/v2/keywords", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(authString).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        keywords: [keyword],
        metrics: ["volume", "difficulty", "cpc"],
      }),
    })

    if (!response.ok) {
      throw new Error(`Moz API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const keywordMetrics = data.results?.[0] || {}

    return {
      difficulty: keywordMetrics.difficulty || 50,
      volume: keywordMetrics.volume || 0,
      cpc: keywordMetrics.cpc || 0,
    }
  } catch (error) {
    console.error(`Moz API error for keyword "${keyword}":`, error)
    throw error
  }
}

// Keyword clustering using semantic similarity
async function clusterKeywords(keywords: string[]): Promise<Record<string, string[]>> {
  // Simple clustering based on word similarity
  // In production, you might want to use more sophisticated NLP
  const clusters: Record<string, string[]> = {}

  keywords.forEach((keyword, index) => {
    const words = keyword.toLowerCase().split(" ")
    const mainTopic =
      words.find(
        (word) => !["best", "top", "how", "to", "what", "where", "when", "why", "online", "free"].includes(word),
      ) || words[0]

    const clusterName = `${mainTopic.charAt(0).toUpperCase()}${mainTopic.slice(1)} Cluster`

    if (!clusters[clusterName]) {
      clusters[clusterName] = []
    }
    clusters[clusterName].push(keyword)
  })

  return clusters
}

// Country code mapping
function getCountryCode(country: string): string {
  const countryMap: Record<string, string> = {
    "United States": "us",
    "United Kingdom": "gb",
    Canada: "ca",
    Australia: "au",
    Germany: "de",
    France: "fr",
    Spain: "es",
    Italy: "it",
    Netherlands: "nl",
    Brazil: "br",
    Mexico: "mx",
    Japan: "jp",
    India: "in",
  }
  return countryMap[country] || "us"
}

// Scoring algorithm
function calculateScores(keywords: KeywordData[], country: string) {
  if (keywords.length === 0) {
    return {
      volumeScore: 0,
      competitionScore: 0,
      cpcRpmScore: 0,
      saturationScore: 0,
      localizationPenalty: 0,
      totalScore: 0,
    }
  }

  // Calculate averages
  const avgVolume = keywords.reduce((sum, k) => sum + k.volume, 0) / keywords.length
  const avgCPC = keywords.reduce((sum, k) => sum + k.cpc, 0) / keywords.length
  const avgCompetition = keywords.reduce((sum, k) => sum + k.competition, 0) / keywords.length
  const avgDifficulty = keywords.reduce((sum, k) => sum + k.difficulty, 0) / keywords.length

  // Volume Score (30% weight) - Higher volume = better score
  const volumeScore = Math.min(100, (avgVolume / 10000) * 100)

  // Competition Score (25% weight) - Lower competition = better score
  const competitionScore = Math.max(0, 100 - avgCompetition)

  // CPC/RPM Score (25% weight) - Higher CPC = better monetization
  const cpcRpmScore = Math.min(100, (avgCPC / 5) * 100)

  // Saturation Score (15% weight) - Lower difficulty = less saturated
  const saturationScore = Math.max(0, 100 - avgDifficulty)

  // Localization Penalty (15% deduction)
  const localizationPenalty =
    country === "United States"
      ? 0
      : ["United Kingdom", "Canada", "Australia"].includes(country)
        ? 5
        : ["Germany", "France", "Netherlands"].includes(country)
          ? 10
          : 15

  // Final score calculation
  const totalScore = Math.max(
    0,
    volumeScore * 0.3 + competitionScore * 0.25 + cpcRpmScore * 0.25 + saturationScore * 0.15 - localizationPenalty,
  )

  return {
    volumeScore,
    competitionScore,
    cpcRpmScore,
    saturationScore,
    localizationPenalty,
    totalScore,
  }
}

export async function POST(request: NextRequest) {
  try {
    const { country, niche, keywords } = await request.json()

    if (!country || !niche || !keywords || !Array.isArray(keywords)) {
      return NextResponse.json({ error: "Missing required fields: country, niche, keywords" }, { status: 400 })
    }

    console.log(`🔍 Starting research for ${niche} in ${country} with ${keywords.length} keywords`)

    // Process keywords in parallel with rate limiting
    const keywordData: KeywordData[] = []
    const batchSize = 5 // Process 5 keywords at a time to avoid rate limits

    for (let i = 0; i < keywords.length; i += batchSize) {
      const batch = keywords.slice(i, i + batchSize)

      const batchPromises = batch.map(async (keyword: string) => {
        try {
          // Get data from both APIs
          const [serpData, mozData] = await Promise.allSettled([getSerpAPIData(keyword, country), getMozData(keyword)])

          // Combine data from both sources
          const volume =
            serpData.status === "fulfilled"
              ? serpData.value.volume
              : mozData.status === "fulfilled"
                ? mozData.value.volume
                : 0

          const cpc =
            serpData.status === "fulfilled"
              ? serpData.value.cpc
              : mozData.status === "fulfilled"
                ? mozData.value.cpc
                : 0

          const competition = serpData.status === "fulfilled" ? serpData.value.competition : 50

          const difficulty = mozData.status === "fulfilled" ? mozData.value.difficulty : 50

          return {
            keyword,
            volume,
            competition,
            cpc,
            difficulty,
            cluster: "", // Will be assigned during clustering
          }
        } catch (error) {
          console.error(`Error processing keyword "${keyword}":`, error)
          // Return default values if API calls fail
          return {
            keyword,
            volume: 0,
            competition: 50,
            cpc: 0,
            difficulty: 50,
            cluster: "",
          }
        }
      })

      const batchResults = await Promise.all(batchPromises)
      keywordData.push(...batchResults)

      // Add delay between batches to respect rate limits
      if (i + batchSize < keywords.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    // Cluster keywords
    const clusters = await clusterKeywords(keywords)

    // Assign cluster names to keywords
    Object.entries(clusters).forEach(([clusterName, clusterKeywords]) => {
      clusterKeywords.forEach((keyword) => {
        const keywordObj = keywordData.find((k) => k.keyword === keyword)
        if (keywordObj) {
          keywordObj.cluster = clusterName
        }
      })
    })

    // Calculate scores
    const scores = calculateScores(keywordData, country)

    const result: ResearchResult = {
      id: `research-${Date.now()}`,
      country,
      niche,
      keywords: keywordData,
      opportunityScore: scores.volumeScore,
      competitionScore: scores.competitionScore,
      volumeScore: scores.volumeScore,
      cpcRpmScore: scores.cpcRpmScore,
      saturationScore: scores.saturationScore,
      localizationPenalty: scores.localizationPenalty,
      totalScore: scores.totalScore,
      status: "completed",
      createdAt: new Date().toISOString(),
    }

    console.log(`✅ Research completed with score: ${scores.totalScore.toFixed(1)}`)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Research API error:", error)
    return NextResponse.json(
      { error: "Failed to complete research. Please check your API keys and try again." },
      { status: 500 },
    )
  }
}
