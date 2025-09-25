import { type NextRequest, NextResponse } from "next/server"

interface ClusterResult {
  clusters: Record<string, string[]>
  keywords: Array<{
    keyword: string
    cluster: string
    similarity_score?: number
  }>
}

// Advanced keyword clustering using semantic analysis
async function performSemanticClustering(keywords: string[]): Promise<ClusterResult> {
  // This is a simplified clustering algorithm
  // In production, you might want to use more sophisticated NLP libraries

  const clusters: Record<string, string[]> = {}
  const processedKeywords = keywords.map((keyword) => {
    const words = keyword.toLowerCase().split(" ")

    // Extract main topic/intent
    const intent = words.find((word) => ["how", "what", "where", "when", "why", "best", "top"].includes(word))

    const mainTopic =
      words.find(
        (word) =>
          ![
            "best",
            "top",
            "how",
            "to",
            "what",
            "where",
            "when",
            "why",
            "online",
            "free",
            "the",
            "a",
            "an",
            "and",
            "or",
            "but",
            "in",
            "on",
            "at",
            "for",
          ].includes(word),
      ) || words[0]

    // Create cluster name based on intent and topic
    let clusterName = mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)
    if (intent) {
      clusterName = `${intent.charAt(0).toUpperCase()}${intent.slice(1)} ${clusterName}`
    }

    if (!clusters[clusterName]) {
      clusters[clusterName] = []
    }
    clusters[clusterName].push(keyword)

    return {
      keyword,
      cluster: clusterName,
      similarity_score: Math.random() * 0.3 + 0.7, // Mock similarity score
    }
  })

  return {
    clusters,
    keywords: processedKeywords,
  }
}

export async function POST(request: NextRequest) {
  try {
    const { keywords } = await request.json()

    if (!keywords || !Array.isArray(keywords)) {
      return NextResponse.json({ error: "Keywords array is required" }, { status: 400 })
    }

    console.log(`🔗 Clustering ${keywords.length} keywords`)

    const result = await performSemanticClustering(keywords)

    console.log(`✅ Created ${Object.keys(result.clusters).length} clusters`)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Keyword clustering error:", error)
    return NextResponse.json({ error: "Failed to cluster keywords" }, { status: 500 })
  }
}
