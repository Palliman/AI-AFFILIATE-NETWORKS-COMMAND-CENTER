import { type NextRequest, NextResponse } from "next/server"

interface AutoPlanRequest {
  researchId: string
  country: string
  niche: string
  keywords: string[]
  totalScore: number
  clusters?: any[]
}

interface DATarget {
  domain: string
  da: number
  type: "guest_post" | "resource_page" | "directory" | "partnership"
  difficulty: "easy" | "medium" | "hard"
  estimatedCost: string
  contactInfo?: string
}

interface ContentRoadmap {
  week: number
  contentType: "pillar_page" | "blog_post" | "resource" | "landing_page"
  title: string
  targetKeywords: string[]
  wordCount: number
  priority: "high" | "medium" | "low"
}

interface LinkBuildingStrategy {
  phase: string
  duration: string
  targets: DATarget[]
  tactics: string[]
  expectedLinks: number
}

interface AutoSEOPlan {
  id: string
  title: string
  overview: {
    targetMarket: string
    primaryNiche: string
    opportunityLevel: string
    estimatedTimeframe: string
    totalBudget: string
  }
  daTargets: DATarget[]
  contentRoadmap: ContentRoadmap[]
  linkBuildingStrategy: LinkBuildingStrategy[]
  timeline: Array<{
    phase: string
    duration: string
    tasks: string[]
    deliverables: string[]
    budget: string
  }>
  kpis: Array<{
    metric: string
    target: string
    timeframe: string
  }>
  createdAt: string
}

// Generate DA targets based on niche and score
function generateDATargets(niche: string, totalScore: number, country: string): DATarget[] {
  const baseTargets = [
    { domain: "medium.com", da: 95, type: "guest_post" as const, difficulty: "hard" as const },
    { domain: "entrepreneur.com", da: 91, type: "guest_post" as const, difficulty: "hard" as const },
    { domain: "inc.com", da: 90, type: "guest_post" as const, difficulty: "hard" as const },
    { domain: "forbes.com", da: 94, type: "guest_post" as const, difficulty: "hard" as const },
    { domain: "huffpost.com", da: 92, type: "guest_post" as const, difficulty: "medium" as const },
  ]

  const nicheSpecificTargets: Record<string, DATarget[]> = {
    "Health & Wellness": [
      { domain: "healthline.com", da: 92, type: "resource_page" as const, difficulty: "medium" as const },
      { domain: "webmd.com", da: 91, type: "resource_page" as const, difficulty: "hard" as const },
      { domain: "medicalnewstoday.com", da: 85, type: "guest_post" as const, difficulty: "medium" as const },
    ],
    Technology: [
      { domain: "techcrunch.com", da: 93, type: "guest_post" as const, difficulty: "hard" as const },
      { domain: "wired.com", da: 90, type: "guest_post" as const, difficulty: "hard" as const },
      { domain: "arstechnica.com", da: 85, type: "guest_post" as const, difficulty: "medium" as const },
    ],
    Finance: [
      { domain: "investopedia.com", da: 88, type: "resource_page" as const, difficulty: "medium" as const },
      { domain: "fool.com", da: 82, type: "guest_post" as const, difficulty: "medium" as const },
      { domain: "marketwatch.com", da: 87, type: "guest_post" as const, difficulty: "hard" as const },
    ],
  }

  const targets = [...baseTargets, ...(nicheSpecificTargets[niche] || [])]

  // Add cost estimates based on DA and difficulty
  return targets.map((target) => ({
    ...target,
    estimatedCost:
      target.difficulty === "hard"
        ? `$${500 + target.da * 5}-${800 + target.da * 8}`
        : target.difficulty === "medium"
          ? `$${200 + target.da * 3}-${400 + target.da * 5}`
          : `$${50 + target.da}-${150 + target.da * 2}`,
    contactInfo: `outreach@${target.domain}`,
  }))
}

// Generate content roadmap based on keywords and clusters
function generateContentRoadmap(keywords: string[], clusters: any[], totalScore: number): ContentRoadmap[] {
  const roadmap: ContentRoadmap[] = []
  let week = 1

  // Pillar pages first (weeks 1-3)
  const pillarKeywords = keywords.slice(0, 3)
  pillarKeywords.forEach((keyword, index) => {
    roadmap.push({
      week: week + index,
      contentType: "pillar_page",
      title: `Ultimate Guide to ${keyword.charAt(0).toUpperCase() + keyword.slice(1)}`,
      targetKeywords: [keyword, ...keywords.slice(3, 6)],
      wordCount: 3000 + Math.floor(Math.random() * 2000),
      priority: "high",
    })
  })

  week = 4

  // Supporting blog posts (weeks 4-12)
  const supportingKeywords = keywords.slice(3, 15)
  supportingKeywords.forEach((keyword, index) => {
    roadmap.push({
      week: week + Math.floor(index / 2),
      contentType: "blog_post",
      title: `${keyword.charAt(0).toUpperCase() + keyword.slice(1)}: Complete Guide`,
      targetKeywords: [keyword],
      wordCount: 1500 + Math.floor(Math.random() * 1000),
      priority: index < 6 ? "high" : "medium",
    })
  })

  // Landing pages for high-value keywords
  const highValueKeywords = keywords.filter((_, index) => index % 3 === 0).slice(0, 3)
  highValueKeywords.forEach((keyword, index) => {
    roadmap.push({
      week: 8 + index * 2,
      contentType: "landing_page",
      title: `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} - Professional Services`,
      targetKeywords: [keyword],
      wordCount: 1000 + Math.floor(Math.random() * 500),
      priority: "high",
    })
  })

  return roadmap.sort((a, b) => a.week - b.week)
}

// Generate link building strategy
function generateLinkBuildingStrategy(daTargets: DATarget[], totalScore: number): LinkBuildingStrategy[] {
  const strategy: LinkBuildingStrategy[] = [
    {
      phase: "Foundation Building",
      duration: "Weeks 1-4",
      targets: daTargets.filter((t) => t.difficulty === "easy").slice(0, 5),
      tactics: ["Directory submissions", "Local citations", "Social profile creation", "Basic resource page outreach"],
      expectedLinks: 10,
    },
    {
      phase: "Authority Building",
      duration: "Weeks 5-12",
      targets: daTargets.filter((t) => t.difficulty === "medium").slice(0, 8),
      tactics: [
        "Guest posting outreach",
        "Broken link building",
        "Resource page submissions",
        "Industry partnership development",
      ],
      expectedLinks: 15,
    },
    {
      phase: "High-Authority Targeting",
      duration: "Weeks 13-24",
      targets: daTargets.filter((t) => t.difficulty === "hard").slice(0, 5),
      tactics: [
        "Premium guest posting",
        "Expert roundup participation",
        "Podcast appearances",
        "Industry conference networking",
      ],
      expectedLinks: 8,
    },
  ]

  return strategy
}

export async function POST(request: NextRequest) {
  try {
    const planRequest: AutoPlanRequest = await request.json()

    if (!planRequest.country || !planRequest.niche || !planRequest.keywords) {
      return NextResponse.json({ error: "Missing required fields: country, niche, keywords" }, { status: 400 })
    }

    console.log(`🚀 Generating auto SEO plan for ${planRequest.niche} in ${planRequest.country}`)

    // Generate plan components
    const daTargets = generateDATargets(planRequest.niche, planRequest.totalScore, planRequest.country)
    const contentRoadmap = generateContentRoadmap(
      planRequest.keywords,
      planRequest.clusters || [],
      planRequest.totalScore,
    )
    const linkBuildingStrategy = generateLinkBuildingStrategy(daTargets, planRequest.totalScore)

    // Determine opportunity level and timeframe
    const opportunityLevel =
      planRequest.totalScore >= 80
        ? "High"
        : planRequest.totalScore >= 60
          ? "Medium-High"
          : planRequest.totalScore >= 40
            ? "Medium"
            : "Low-Medium"

    const estimatedTimeframe =
      planRequest.totalScore >= 70 ? "6-9 months" : planRequest.totalScore >= 50 ? "9-12 months" : "12-18 months"

    // Calculate total budget
    const contentBudget = contentRoadmap.length * 200 // $200 per content piece
    const linkBudget = daTargets.reduce((sum, target) => {
      const avgCost = Number.parseInt(target.estimatedCost.split("-")[0].replace("$", ""))
      return sum + avgCost
    }, 0)
    const totalBudget = `$${(contentBudget + linkBudget).toLocaleString()}`

    const plan: AutoSEOPlan = {
      id: `auto-plan-${Date.now()}`,
      title: `RankForge Auto Plan: ${planRequest.niche} in ${planRequest.country}`,
      overview: {
        targetMarket: `${planRequest.niche} market in ${planRequest.country}`,
        primaryNiche: planRequest.niche,
        opportunityLevel,
        estimatedTimeframe,
        totalBudget,
      },
      daTargets,
      contentRoadmap,
      linkBuildingStrategy,
      timeline: [
        {
          phase: "Research & Planning",
          duration: "Week 1",
          tasks: ["Keyword research validation", "Competitor analysis", "Content calendar creation"],
          deliverables: ["SEO strategy document", "Content calendar", "Link target list"],
          budget: "$2,000",
        },
        {
          phase: "Content Creation",
          duration: "Weeks 2-12",
          tasks: ["Pillar page creation", "Blog post writing", "Landing page development"],
          deliverables: ["3 pillar pages", "12 blog posts", "3 landing pages"],
          budget: `$${contentBudget.toLocaleString()}`,
        },
        {
          phase: "Link Building",
          duration: "Weeks 4-24",
          tasks: ["Outreach campaigns", "Guest posting", "Partnership development"],
          deliverables: ["30+ high-quality backlinks", "Brand mentions", "Industry partnerships"],
          budget: `$${linkBudget.toLocaleString()}`,
        },
      ],
      kpis: [
        {
          metric: "Organic Traffic Growth",
          target: planRequest.totalScore >= 60 ? "300-500%" : "150-300%",
          timeframe: estimatedTimeframe,
        },
        {
          metric: "Keyword Rankings (Top 10)",
          target: `${Math.min(planRequest.keywords.length, 15)} keywords`,
          timeframe: estimatedTimeframe,
        },
        {
          metric: "Domain Authority Increase",
          target: planRequest.totalScore >= 60 ? "20-30 points" : "10-20 points",
          timeframe: estimatedTimeframe,
        },
        {
          metric: "High-Quality Backlinks",
          target: "30-50 links",
          timeframe: "6 months",
        },
      ],
      createdAt: new Date().toISOString(),
    }

    console.log(`✅ Auto SEO plan generated: ${plan.title}`)

    return NextResponse.json(plan)
  } catch (error) {
    console.error("Auto plan creation error:", error)
    return NextResponse.json({ error: "Failed to create auto SEO plan" }, { status: 500 })
  }
}
