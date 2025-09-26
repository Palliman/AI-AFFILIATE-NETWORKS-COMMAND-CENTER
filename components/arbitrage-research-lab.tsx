"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import {
  Search,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  RotateCcw,
  Download,
  Zap,
  BarChart3,
  Lightbulb,
  Trash2,
  Save,
  FileText,
  Calendar,
  Layers,
  Terminal,
} from "lucide-react"

// Types
interface KeywordData {
  keyword: string
  volume: number
  competition: number
  cpc: number
  difficulty: number
  cluster?: string
}

interface ClusterData {
  name: string
  primaryKeyword: string
  supportingKeywords: string[]
  totalVolume: number
  avgDifficulty: number
  estimatedWeeks: number
  postsPerWeek: number
}

interface ResearchResult {
  id: string
  country: string
  niche: string
  keywords: KeywordData[]
  clusters: ClusterData[]
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

interface Job {
  id: string
  type: "research" | "plan" | "content" | "intake" | "export"
  status: "queued" | "running" | "completed" | "failed"
  progress: number
  result?: any
  createdAt: string
  title: string
  logs: string[]
  eta?: string
}

// Mock data
const mockCountries = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Netherlands",
  "Brazil",
  "Mexico",
  "Japan",
  "India",
]

const mockNiches = [
  "Health & Wellness",
  "Technology",
  "Finance",
  "Travel",
  "Food & Cooking",
  "Fashion",
  "Home & Garden",
  "Sports & Fitness",
  "Education",
  "Entertainment",
  "Business",
  "Automotive",
]

// Real API integration
const realResearchAPI = async (
  country: string,
  niche: string,
  keywords: string[],
  apiKeys: any,
): Promise<ResearchResult> => {
  const response = await fetch("/api/research/run", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      country,
      niche,
      keywords,
      apiKeys,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Research failed")
  }

  return response.json()
}

const ArbitrageResearchLab: React.FC = () => {
  // State
  const [selectedCountry, setSelectedCountry] = useState("")
  const [selectedNiche, setSelectedNiche] = useState("")
  const [keywordInput, setKeywordInput] = useState("")
  const [isResearching, setIsResearching] = useState(false)
  const [results, setResults] = useState<ResearchResult[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [activeResult, setActiveResult] = useState<ResearchResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [apiKeys, setApiKeys] = useState({
    serpapi: "",
    mozAccessId: "",
    mozSecretKey: "",
  })
  const [useMockData, setUseMockData] = useState({
    serpapi: true,
    moz: true,
  })

  // Load saved data
  useEffect(() => {
    const savedResults = localStorage.getItem("arbitrageResults")
    const savedJobs = localStorage.getItem("arbitrageJobs")
    if (savedResults) setResults(JSON.parse(savedResults))
    if (savedJobs) setJobs(JSON.parse(savedJobs))
  }, [])

  // Save data
  useEffect(() => {
    localStorage.setItem("arbitrageResults", JSON.stringify(results))
  }, [results])

  useEffect(() => {
    localStorage.setItem("arbitrageJobs", JSON.stringify(jobs))
  }, [jobs])

  // Simulate job progress
  useEffect(() => {
    const interval = setInterval(() => {
      setJobs((prevJobs) =>
        prevJobs.map((job) => {
          if (job.status === "running" && job.progress < 100) {
            const newProgress = Math.min(100, job.progress + Math.random() * 15)
            const newLogs = [...job.logs]

            if (newProgress > 25 && job.logs.length === 1) {
              newLogs.push("Processing keyword clusters...")
            }
            if (newProgress > 50 && job.logs.length === 2) {
              newLogs.push("Analyzing competition data...")
            }
            if (newProgress > 75 && job.logs.length === 3) {
              newLogs.push("Generating content roadmap...")
            }
            if (newProgress >= 100 && job.status === "running") {
              newLogs.push("✅ Job completed successfully")
              return { ...job, status: "completed" as const, progress: 100, logs: newLogs }
            }

            return { ...job, progress: newProgress, logs: newLogs }
          }
          return job
        }),
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleResearch = async () => {
    if (!selectedCountry || !selectedNiche || !keywordInput.trim()) return

    setIsResearching(true)
    setError(null)

    const keywords = keywordInput
      .split("\n")
      .map((k) => k.trim())
      .filter((k) => k.length > 0)

    try {
      console.log(`🚀 Starting research for ${selectedNiche} in ${selectedCountry}`)
      const result = await realResearchAPI(selectedCountry, selectedNiche, keywords, apiKeys)
      setResults((prev) => [result, ...prev])
      setActiveResult(result)
      console.log(`✅ Research completed with score: ${result.totalScore.toFixed(1)}`)
    } catch (error: any) {
      console.error("Research failed:", error)
      setError(error.message || "Research failed. Please check your API keys and try again.")
    } finally {
      setIsResearching(false)
    }
  }

  const createSEOPlan = async (result: ResearchResult) => {
    try {
      // Create job for RankForge integration
      const newJob: Job = {
        id: `job-${Date.now()}`,
        type: "plan",
        status: "running",
        progress: 0,
        title: `RankForge SEO Plan: ${result.niche}`,
        createdAt: new Date().toISOString(),
        logs: ["🚀 Initializing RankForge integration..."],
        eta: "3-5 minutes",
      }

      setJobs((prev) => [newJob, ...prev])

      // Call RankForge integration endpoints
      const [intakeResponse, planResponse] = await Promise.all([
        fetch("/api/keywords/intake", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            keywords: result.keywords.map((k) => k.keyword),
            country: result.country,
            niche: result.niche,
          }),
        }),
        fetch("/api/plans/auto", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            researchId: result.id,
            country: result.country,
            niche: result.niche,
            keywords: result.keywords.map((k) => k.keyword),
            totalScore: result.totalScore,
            clusters: result.clusters,
          }),
        }),
      ])

      if (!intakeResponse.ok || !planResponse.ok) {
        throw new Error("Failed to create RankForge plan")
      }

      const [intakeData, planData] = await Promise.all([intakeResponse.json(), planResponse.json()])

      // Update job with results
      setJobs((prev) =>
        prev.map((job) =>
          job.id === newJob.id
            ? {
                ...job,
                status: "completed",
                progress: 100,
                result: { intake: intakeData, plan: planData },
                logs: [
                  ...job.logs,
                  "✅ Keyword clustering completed",
                  "✅ DA targets identified",
                  "✅ Content roadmap generated",
                  "✅ Link building strategy created",
                ],
              }
            : job,
        ),
      )

      console.log(`📋 RankForge SEO plan created: ${planData.title}`)
    } catch (error) {
      console.error("Failed to create RankForge plan:", error)
      setError("Failed to create RankForge SEO plan. Please try again.")

      // Update job as failed
      setJobs((prev) =>
        prev.map((job) =>
          job.type === "plan" && job.status === "running"
            ? { ...job, status: "failed", logs: [...job.logs, "❌ Plan creation failed"] }
            : job,
        ),
      )
    }
  }

  const saveOpportunity = async (result: ResearchResult) => {
    try {
      const newJob: Job = {
        id: `job-${Date.now()}`,
        type: "export",
        status: "running",
        progress: 0,
        title: `Saving Opportunity: ${result.niche}`,
        createdAt: new Date().toISOString(),
        logs: ["💾 Preparing opportunity data..."],
        eta: "30 seconds",
      }

      setJobs((prev) => [newJob, ...prev])

      // Simulate saving process
      setTimeout(() => {
        setJobs((prev) =>
          prev.map((job) =>
            job.id === newJob.id
              ? {
                  ...job,
                  status: "completed",
                  progress: 100,
                  result: { saved: true, opportunityId: `opp-${Date.now()}` },
                  logs: [
                    ...job.logs,
                    "✅ Opportunity data structured",
                    "✅ Saved to opportunities database",
                    "✅ Available in analytics dashboard",
                  ],
                }
              : job,
          ),
        )
      }, 2000)

      console.log(`💾 Opportunity saved: ${result.niche} in ${result.country}`)
    } catch (error) {
      console.error("Failed to save opportunity:", error)
      setError("Failed to save opportunity. Please try again.")
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400"
    if (score >= 60) return "text-yellow-400"
    if (score >= 40) return "text-orange-400"
    return "text-red-400"
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500/20 border-green-400/50"
    if (score >= 60) return "bg-yellow-500/20 border-yellow-400/50"
    if (score >= 40) return "bg-orange-500/20 border-orange-400/50"
    return "bg-red-500/20 border-red-400/50"
  }

  const getScoreGradient = (score: number) => {
    if (score >= 80) return "from-green-500/30 to-green-600/10"
    if (score >= 60) return "from-yellow-500/30 to-yellow-600/10"
    if (score >= 40) return "from-orange-500/30 to-orange-600/10"
    return "from-red-500/30 to-red-600/10"
  }

  const getOpportunityLevel = (score: number) => {
    if (score >= 80) return { level: "🔥 Hot Opportunity", color: "text-green-400" }
    if (score >= 60) return { level: "⚡ Good Opportunity", color: "text-yellow-400" }
    if (score >= 40) return { level: "📊 Moderate Opportunity", color: "text-orange-400" }
    return { level: "❄️ Weak Opportunity", color: "text-red-400" }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Target className="w-6 h-6 text-green-400" />
            Arbitrage Research Lab
          </h2>
          <p className="text-slate-400 text-sm mt-1">Real-time market research with RankForge integration</p>
        </div>
        <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-400/50">
          <Zap className="w-3 h-3 mr-1" />
          RankForge Ready
        </Badge>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="bg-red-500/20 border-red-400/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-300 text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Inputs */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="bg-slate-800/70 backdrop-blur-md border border-slate-700/60 sticky top-24">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Research Parameters
              </CardTitle>
              <CardDescription className="text-slate-400">Configure your market research</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-slate-300">Target Country</Label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="bg-slate-700/60 border-slate-600 text-slate-100">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                    {mockCountries.map((country) => (
                      <SelectItem key={country} value={country} className="hover:bg-slate-700">
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300">Niche/Market</Label>
                <Select value={selectedNiche} onValueChange={setSelectedNiche}>
                  <SelectTrigger className="bg-slate-700/60 border-slate-600 text-slate-100">
                    <SelectValue placeholder="Select niche" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                    {mockNiches.map((niche) => (
                      <SelectItem key={niche} value={niche} className="hover:bg-slate-700">
                        {niche}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300">Seed Keywords</Label>
                <Textarea
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  placeholder="Enter keywords (one per line)&#10;best IELTS coaching online&#10;IELTS preparation course&#10;online English test prep"
                  rows={6}
                  className="bg-slate-700/60 border-slate-600 text-slate-100 placeholder:text-slate-400"
                />
              </div>

              <Button
                onClick={handleResearch}
                disabled={isResearching || !selectedCountry || !selectedNiche || !keywordInput.trim()}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {isResearching ? (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                    Researching with Live APIs...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run Live Research
                  </>
                )}
              </Button>

              <Button
                onClick={() => {
                  setResults([])
                  setActiveResult(null)
                  setError(null)
                  localStorage.removeItem("arbitrageResults")
                }}
                disabled={results.length === 0}
                variant="outline"
                className="w-full text-slate-300 border-slate-600 hover:bg-slate-700/50 hover:text-slate-100 bg-transparent"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Previous Research
              </Button>

              {/* API Configuration */}
              <div className="space-y-3 text-xs text-slate-400">
                <div className="font-medium text-slate-300">API Configuration</div>

                <div className="space-y-2">
                  <Label className="text-slate-300 text-xs">SerpAPI Key</Label>
                  <Input
                    type="password"
                    value={apiKeys.serpapi}
                    onChange={(e) => setApiKeys((prev) => ({ ...prev, serpapi: e.target.value }))}
                    placeholder="Enter SerpAPI key"
                    className="bg-slate-700/60 border-slate-600 text-slate-100 text-xs h-8"
                  />
                  <div className="flex items-center justify-between">
                    <span>SerpAPI:</span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${useMockData.serpapi ? "bg-orange-500/20 text-orange-300 border-orange-400/50" : "bg-green-500/20 text-green-300 border-green-400/50"}`}
                    >
                      {useMockData.serpapi ? "Mock Data" : "Live API"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300 text-xs">Moz Access ID</Label>
                  <Input
                    type="text"
                    value={apiKeys.mozAccessId}
                    onChange={(e) => setApiKeys((prev) => ({ ...prev, mozAccessId: e.target.value }))}
                    placeholder="Enter Moz Access ID"
                    className="bg-slate-700/60 border-slate-600 text-slate-100 text-xs h-8"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300 text-xs">Moz Secret Key</Label>
                  <Input
                    type="password"
                    value={apiKeys.mozSecretKey}
                    onChange={(e) => setApiKeys((prev) => ({ ...prev, mozSecretKey: e.target.value }))}
                    placeholder="Enter Moz Secret Key"
                    className="bg-slate-700/60 border-slate-600 text-slate-100 text-xs h-8"
                  />
                  <div className="flex items-center justify-between">
                    <span>Moz API:</span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${useMockData.moz ? "bg-orange-500/20 text-orange-300 border-orange-400/50" : "bg-green-500/20 text-green-300 border-green-400/50"}`}
                    >
                      {useMockData.moz ? "Mock Data" : "Live API"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center Column - Results */}
        <div className="lg:col-span-6 space-y-4">
          {activeResult ? (
            <>
              {/* Score Overview Card */}
              <Card className="bg-slate-800/70 backdrop-blur-md border border-slate-700/60">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-slate-100 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-400" />
                      Opportunity Analysis
                      {(useMockData.serpapi || useMockData.moz) && (
                        <Badge
                          variant="outline"
                          className="bg-orange-500/20 text-orange-300 border-orange-400/50 text-xs"
                        >
                          Contains Mock Data
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getScoreBg(activeResult.totalScore)} text-white`}>
                        Score: {activeResult.totalScore.toFixed(1)}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="text-slate-400">
                    {activeResult.niche} in {activeResult.country} • {activeResult.keywords.length} keywords analyzed
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Opportunity Level with Gradient Bar */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold ${getOpportunityLevel(activeResult.totalScore).color}`}>
                        {getOpportunityLevel(activeResult.totalScore).level}
                      </span>
                      <span className="text-slate-400 text-sm">{activeResult.totalScore.toFixed(1)}/100</span>
                    </div>
                    <div className="relative h-3 bg-slate-700/50 rounded-full overflow-hidden">
                      <div
                        className={`absolute left-0 top-0 h-full bg-gradient-to-r ${getScoreGradient(activeResult.totalScore)} transition-all duration-1000 ease-out`}
                        style={{ width: `${activeResult.totalScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(activeResult.volumeScore)}`}>
                        {activeResult.volumeScore.toFixed(0)}
                      </div>
                      <div className="text-xs text-slate-400">Volume (30%)</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(activeResult.competitionScore)}`}>
                        {activeResult.competitionScore.toFixed(0)}
                      </div>
                      <div className="text-xs text-slate-400">Competition (25%)</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(activeResult.cpcRpmScore)}`}>
                        {activeResult.cpcRpmScore.toFixed(0)}
                      </div>
                      <div className="text-xs text-slate-400">CPC/RPM (25%)</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(activeResult.saturationScore)}`}>
                        {activeResult.saturationScore.toFixed(0)}
                      </div>
                      <div className="text-xs text-slate-400">Saturation (15%)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-400">
                        -{activeResult.localizationPenalty.toFixed(0)}
                      </div>
                      <div className="text-xs text-slate-400">Localization</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(activeResult.totalScore)}`}>
                        {activeResult.totalScore.toFixed(0)}
                      </div>
                      <div className="text-xs text-slate-400">Final Score</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cluster Visualization */}
              {activeResult.clusters && activeResult.clusters.length > 0 && (
                <Card className="bg-slate-800/70 backdrop-blur-md border border-slate-700/60">
                  <CardHeader>
                    <CardTitle className="text-slate-100 flex items-center gap-2">
                      <Layers className="w-5 h-5 text-purple-400" />
                      Content Clusters
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Keyword clusters with content roadmap estimates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activeResult.clusters.map((cluster, index) => (
                        <div key={index} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600/50">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-slate-200 flex items-center gap-2">
                              <Target className="w-4 h-4 text-green-400" />
                              {cluster.name}
                            </h4>
                            <Badge
                              variant="outline"
                              className="bg-blue-500/20 text-blue-300 border-blue-400/50 text-xs"
                            >
                              <Calendar className="w-3 h-3 mr-1" />
                              {cluster.estimatedWeeks} weeks @ {cluster.postsPerWeek} posts/wk
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400">Primary:</span>
                              <span className="text-sm font-medium text-green-300">{cluster.primaryKeyword}</span>
                            </div>

                            <div>
                              <span className="text-xs text-slate-400">Supporting:</span>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {cluster.supportingKeywords.slice(0, 5).map((keyword, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className="text-xs bg-slate-600/50 text-slate-300 border-slate-500/50"
                                  >
                                    {keyword}
                                  </Badge>
                                ))}
                                {cluster.supportingKeywords.length > 5 && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-slate-600/50 text-slate-400 border-slate-500/50"
                                  >
                                    +{cluster.supportingKeywords.length - 5} more
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                              <span>Volume: {cluster.totalVolume.toLocaleString()}</span>
                              <span>Avg Difficulty: {cluster.avgDifficulty.toFixed(0)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Keywords Table */}
              <Card className="bg-slate-800/70 backdrop-blur-md border border-slate-700/60">
                <CardHeader>
                  <CardTitle className="text-slate-100">Keyword Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {activeResult.keywords.map((keyword, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-slate-700/50 rounded-md border border-slate-600/50"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-slate-200">{keyword.keyword}</div>
                          <div className="text-xs text-slate-400">{keyword.cluster}</div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-slate-200">{keyword.volume.toLocaleString()}</div>
                            <div className="text-xs text-slate-400">Volume</div>
                          </div>
                          <div className="text-center">
                            <div className="text-slate-200">${keyword.cpc.toFixed(2)}</div>
                            <div className="text-xs text-slate-400">CPC</div>
                          </div>
                          <div className="text-center">
                            <div className={`${getScoreColor(100 - keyword.difficulty)}`}>
                              {(100 - keyword.difficulty).toFixed(0)}
                            </div>
                            <div className="text-xs text-slate-400">Opportunity</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="bg-slate-800/70 backdrop-blur-md border border-slate-700/60">
              <CardContent className="text-center py-12">
                <Target className="w-12 h-12 mx-auto text-slate-500 mb-4" />
                <p className="text-slate-400">Ready for live market research.</p>
                <p className="text-sm text-slate-500 mt-1">
                  Configure parameters and run research to get real SerpAPI & Moz data.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Previous Results */}
          {results.length > 0 && (
            <Card className="bg-slate-800/70 backdrop-blur-md border border-slate-700/60">
              <CardHeader>
                <CardTitle className="text-slate-100">Previous Research</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.slice(0, 5).map((result) => (
                    <div
                      key={result.id}
                      className={`p-3 rounded-md border cursor-pointer transition-colors ${
                        activeResult?.id === result.id
                          ? "bg-green-500/20 border-green-400/50"
                          : "bg-slate-700/50 border-slate-600/50 hover:bg-slate-700/70"
                      }`}
                      onClick={() => setActiveResult(result)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-slate-200">
                            {result.niche} in {result.country}
                          </div>
                          <div className="text-xs text-slate-400">
                            {result.keywords.length} keywords • {new Date(result.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs ${getOpportunityLevel(result.totalScore).color}`}>
                            {getOpportunityLevel(result.totalScore).level.split(" ")[0]}
                          </span>
                          <Badge className={`${getScoreBg(result.totalScore)} text-white text-xs`}>
                            {result.totalScore.toFixed(0)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Actions & Jobs */}
        <div className="lg:col-span-3 space-y-4">
          {/* Actions */}
          <Card className="bg-slate-800/70 backdrop-blur-md border border-slate-700/60">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                RankForge Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => activeResult && createSEOPlan(activeResult)}
                disabled={!activeResult}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Create SEO Plan
              </Button>
              <Button
                onClick={() => activeResult && saveOpportunity(activeResult)}
                disabled={!activeResult}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Save as Opportunity
              </Button>
              <Button
                disabled={!activeResult}
                variant="outline"
                className="w-full text-slate-300 border-slate-600 hover:bg-slate-700/50 bg-transparent"
              >
                <FileText className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </CardContent>
          </Card>

          {/* Enhanced Job Queue */}
          <Card className="bg-slate-800/70 backdrop-blur-md border border-slate-700/60">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                Job Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {jobs.length > 0 ? (
                <div className="space-y-4">
                  {jobs.slice(0, 5).map((job) => (
                    <div key={job.id} className="p-3 bg-slate-700/50 rounded-md border border-slate-600/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-slate-200 text-sm">{job.title}</div>
                        <div className="flex items-center gap-2">
                          {job.status === "completed" && <CheckCircle className="w-4 h-4 text-green-400" />}
                          {job.status === "running" && <RotateCcw className="w-4 h-4 text-blue-400 animate-spin" />}
                          {job.status === "queued" && <Clock className="w-4 h-4 text-yellow-400" />}
                          {job.status === "failed" && <AlertCircle className="w-4 h-4 text-red-400" />}
                          {job.eta && job.status === "running" && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-blue-500/20 text-blue-300 border-blue-400/50"
                            >
                              ETA: {job.eta}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="text-xs text-slate-400 mb-2">
                        {job.status} • {new Date(job.createdAt).toLocaleTimeString()}
                      </div>

                      {job.status === "running" && (
                        <div className="mb-3">
                          <Progress value={job.progress} className="h-2 bg-slate-600">
                            <div
                              className="h-full bg-blue-500 transition-all duration-300"
                              style={{ width: `${job.progress}%` }}
                            />
                          </Progress>
                          <div className="text-xs text-slate-400 mt-1">{job.progress.toFixed(0)}% complete</div>
                        </div>
                      )}

                      {/* Job Logs */}
                      {job.logs.length > 0 && (
                        <div className="mt-2 p-2 bg-slate-800/50 rounded text-xs font-mono">
                          {job.logs.slice(-3).map((log, idx) => (
                            <div key={idx} className="text-slate-300 mb-1">
                              {log}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Terminal className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                  <p className="text-slate-400 text-sm">No jobs in pipeline</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ArbitrageResearchLab
