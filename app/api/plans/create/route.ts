import { type NextRequest, NextResponse } from "next/server"

interface PlanRequest {
  researchId: string
  country: string
  niche: string
  keywords: string[]
  totalScore: number
}

interface SEOPlan {
  id: string
  title: string
  overview: {
    targetMarket: string
    primaryNiche: string
    opportunityLevel: string
    estimatedTimeframe: string
  }
  keywordStrategy: {
    primaryKeywords: string[]
    secondaryKeywords: string[]
    longTailKeywords: string[]
  }
  contentStrategy: {
    pillarPages: Array<{
      title: string
      targetKeywords: string[]
      contentType: string
    }>
    supportingContent: Array<{
      title: string
      contentType: string
      targetKeywords: string[]
    }>
  }
  technicalSEO: {
    siteStructure: string[]
    technicalRequirements: string[]
    performanceOptimizations: string[]
  }
  linkBuilding: {
    strategy: string
    targetDomains: string[]
    tactics: string[]
  }
  timeline: Array<{
    phase: string
    duration: string
    tasks: string[]
    deliverables: string[]
  }>
  kpis: Array<{
    metric: string
    target: string
    timeframe: string
  }>
  createdAt: string
}

// Generate comprehensive SEO plan
function generateSEOPlan(request: PlanRequest): SEOPlan {
  const { country, niche, keywords, totalScore } = request

  // Determine opportunity level based on score
  const opportunityLevel =
    totalScore >= 80
      ? "High"
      : totalScore >= 60
        ? "Medium-High"
        : totalScore >= 40
          ? "Medium"
          : totalScore >= 20
            ? "Low-Medium"
            : "Low"

  // Estimate timeframe based on competition and opportunity
  const estimatedTimeframe =
    totalScore >= 70
      ? "6-9 months"
      : totalScore >= 50
        ? "9-12 months"
        : totalScore >= 30
          ? "12-18 months"
          : "18+ months"

  // Categorize keywords
  const primaryKeywords = keywords.slice(0, 3)
  const secondaryKeywords = keywords.slice(3, 8)
  const longTailKeywords = keywords.slice(8)

  // Generate content strategy based on niche
  const pillarPages = primaryKeywords.map((keyword, index) => ({
    title: `Ultimate Guide to ${keyword.charAt(0).toUpperCase() + keyword.slice(1)}`,
    targetKeywords: [keyword, ...secondaryKeywords.slice(index * 2, (index + 1) * 2)],
    contentType: "Comprehensive Guide",
  }))

  const supportingContent = secondaryKeywords.map((keyword) => ({
    title: `${keyword.charAt(0).toUpperCase() + keyword.slice(1)}: Complete Analysis`,
    contentType: Math.random() > 0.5 ? "Blog Post" : "Tutorial",
    targetKeywords: [keyword],
  }))

  // Technical SEO recommendations
  const technicalRequirements = [
    "Mobile-first responsive design",
    "Core Web Vitals optimization",
    "SSL certificate implementation",
    "XML sitemap generation",
    "Schema markup implementation",
    "Page speed optimization (target: <3s load time)",
    "Clean URL structure",
    "Internal linking strategy",
  ]

  // Link building strategy based on niche and country
  const linkBuildingTactics = [
    "Guest posting on industry blogs",
    "Resource page link building",
    "Broken link building",
    "Digital PR and outreach",
    "Industry directory submissions",
    "Local citations (if applicable)",
    "Content partnerships",
    "Influencer collaborations",
  ]

  // Timeline phases
  const timeline = [
    {
      phase: "Foundation & Research",
      duration: "Month 1-2",
      tasks: [
        "Technical SEO audit and fixes",
        "Keyword research expansion",
        "Competitor analysis",
        "Site architecture planning",
      ],
      deliverables: [
        "Technical SEO report",
        "Expanded keyword list",
        "Competitor analysis report",
        "Site structure wireframes",
      ],
    },
    {
      phase: "Content Creation",
      duration: "Month 2-4",
      tasks: [
        "Pillar page content creation",
        "Supporting blog posts",
        "On-page optimization",
        "Internal linking implementation",
      ],
      deliverables: ["Pillar pages (3-5)", "Blog posts (10-15)", "Optimized meta tags", "Internal link structure"],
    },
    {
      phase: "Authority Building",
      duration: "Month 4-8",
      tasks: ["Link building campaign", "Content promotion", "Social media integration", "Local SEO (if applicable)"],
      deliverables: ["High-quality backlinks", "Social media presence", "Local listings", "Brand mentions"],
    },
    {
      phase: "Optimization & Scaling",
      duration: "Month 8+",
      tasks: [
        "Performance monitoring",
        "Content updates and expansion",
        "Advanced link building",
        "Conversion optimization",
      ],
      deliverables: [
        "Monthly performance reports",
        "Updated content",
        "Improved rankings",
        "Increased organic traffic",
      ],
    },
  ]

  // KPIs based on opportunity level
  const kpis = [
    {
      metric: "Organic Traffic Growth",
      target: totalScore >= 60 ? "200-500%" : totalScore >= 40 ? "100-200%" : "50-100%",
      timeframe: estimatedTimeframe,
    },
    {
      metric: "Keyword Rankings (Top 10)",
      target: `${Math.min(keywords.length, totalScore >= 60 ? 15 : totalScore >= 40 ? 10 : 5)} keywords`,
      timeframe: estimatedTimeframe,
    },
    {
      metric: "Domain Authority Increase",
      target: totalScore >= 60 ? "15-25 points" : totalScore >= 40 ? "10-15 points" : "5-10 points",
      timeframe: estimatedTimeframe,
    },
    {
      metric: "Conversion Rate",
      target: "2-5% from organic traffic",
      timeframe: "Month 6+",
    },
  ]

  return {
    id: `plan-${Date.now()}`,
    title: `SEO Strategy: ${niche} in ${country}`,
    overview: {
      targetMarket: `${niche} market in ${country}`,
      primaryNiche: niche,
      opportunityLevel,
      estimatedTimeframe,
    },
    keywordStrategy: {
      primaryKeywords,
      secondaryKeywords,
      longTailKeywords,
    },
    contentStrategy: {
      pillarPages,
      supportingContent,
    },
    technicalSEO: {
      siteStructure: [
        "Homepage → Category Pages → Product/Service Pages",
        "Blog section with topic clusters",
        "Resource/Tools section",
        "About/Contact pages",
      ],
      technicalRequirements,
      performanceOptimizations: [
        "Image optimization and WebP format",
        "CSS and JavaScript minification",
        "CDN implementation",
        "Caching strategy",
        "Database optimization",
      ],
    },
    linkBuilding: {
      strategy: `Focus on ${country}-specific and ${niche} industry websites`,
      targetDomains: [
        `Industry blogs in ${niche}`,
        `${country} business directories`,
        "Educational institutions",
        "Government resources",
        "Industry associations",
      ],
      tactics: linkBuildingTactics,
    },
    timeline,
    kpis,
    createdAt: new Date().toISOString(),
  }
}

export async function POST(request: NextRequest) {
  try {
    const planRequest = await request.json()

    if (!planRequest.country || !planRequest.niche || !planRequest.keywords) {
      return NextResponse.json({ error: "Missing required fields: country, niche, keywords" }, { status: 400 })
    }

    console.log(`📋 Generating SEO plan for ${planRequest.niche} in ${planRequest.country}`)

    const plan = generateSEOPlan(planRequest)

    console.log(`✅ SEO plan generated: ${plan.title}`)

    return NextResponse.json(plan)
  } catch (error) {
    console.error("Plan creation error:", error)
    return NextResponse.json({ error: "Failed to create SEO plan" }, { status: 500 })
  }
}
