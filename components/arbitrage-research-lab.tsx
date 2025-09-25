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
import {
  Search,
  Target,
  Globe,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  RotateCcw,
  Download,
  Zap,
  BarChart3,
  Lightbulb,
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

interface Job {
  id: string
  type: "research" | "plan" | "content"
  status: "queued" | "running" | "completed" | "failed"
  progress: number
  result?: any
  createdAt: string
  title: string
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
const realResearchAPI = async (country: string, niche: string, keywords: string[]): Promise<ResearchResult> => {
  const response = await fetch("/api/research/run", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      country,
      niche,
      keywords,
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

  const handleResearch = async () => {
    if (!selectedCountry || !selectedNiche || !keywordInput.trim()) return

    setIsResearching(true)
    setError(null)

    const keywords = keywordInput
      .split("\n")
      .map((k) => k.trim())
      .filter((k) => k.length > 0)

    try {
      console.log(`🚀 Starting real research for ${selectedNiche} in ${selectedCountry}`)
      const result = await realResearchAPI(selectedCountry, selectedNiche, keywords)
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

  const createPlan = async (result: ResearchResult) => {
    try {
      const response = await fetch("/api/plans/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          researchId: result.id,
          country: result.country,
          niche: result.niche,
          keywords: result.keywords.map((k) => k.keyword),
          totalScore: result.totalScore,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create plan")
      }

      const plan = await response.json()

      const newJob: Job = {
        id: `job-${Date.now()}`,
        type: "plan",
        status: "completed",
        progress: 100,
        title: `SEO Plan: ${result.niche} in ${result.country}`,
        createdAt: new Date().toISOString(),
        result: plan,
      }

      setJobs((prev) => [newJob, ...prev])
      console.log(`📋 SEO plan created: ${plan.title}`)
    } catch (error) {
      console.error("Failed to create plan:", error)
      setError("Failed to create SEO plan. Please try again.")
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Target className="w-6 h-6 text-green-400" />
            Arbitrage Research Lab
          </h2>
          <p className="text-slate-400 text-sm mt-1">Real-time market research using SerpAPI and Moz data</p>
        </div>
        <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-400/50">
          <Zap className="w-3 h-3 mr-1" />
          Live Data Engine
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

              {/* API Status */}
              <div className="text-xs text-slate-400 space-y-1">
                <div className="flex items-center justify-between">
                  <span>SerpAPI:</span>
                  <Badge variant="outline" className="text-xs bg-green-500/20 text-green-300 border-green-400/50">
                    Connected
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Moz API:</span>
                  <Badge variant="outline" className="text-xs bg-green-500/20 text-green-300 border-green-400/50">
                    Connected
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center Column - Results */}
        <div className="lg:col-span-6 space-y-4">
          {activeResult ? (
            <Card className="bg-slate-800/70 backdrop-blur-md border border-slate-700/60">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-slate-100 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    Live Research Results
                  </CardTitle>
                  <Badge className={`${getScoreBg(activeResult.totalScore)} text-white`}>
                    Score: {activeResult.totalScore.toFixed(1)}
                  </Badge>
                </div>
                <CardDescription className="text-slate-400">
                  {activeResult.niche} in {activeResult.country} • Real SerpAPI & Moz data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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

                {/* Keywords Table */}
                <div>
                  <h4 className="font-medium text-slate-300 mb-3">Live Keyword Analysis</h4>
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
                </div>
              </CardContent>
            </Card>
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
                        <Badge className={`${getScoreBg(result.totalScore)} text-white text-xs`}>
                          {result.totalScore.toFixed(0)}
                        </Badge>
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
                Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => activeResult && createPlan(activeResult)}
                disabled={!activeResult}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Create SEO Plan
              </Button>
              <Button
                disabled={!activeResult}
                variant="outline"
                className="w-full text-slate-300 border-slate-600 hover:bg-slate-700/50 bg-transparent"
              >
                <Globe className="w-4 h-4 mr-2" />
                Generate Site Blueprint
              </Button>
              <Button
                disabled={!activeResult}
                variant="outline"
                className="w-full text-slate-300 border-slate-600 hover:bg-slate-700/50 bg-transparent"
              >
                <Users className="w-4 h-4 mr-2" />
                Content Pack
              </Button>
            </CardContent>
          </Card>

          {/* Job Queue */}
          <Card className="bg-slate-800/70 backdrop-blur-md border border-slate-700/60">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Job Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              {jobs.length > 0 ? (
                <div className="space-y-3">
                  {jobs.slice(0, 5).map((job) => (
                    <div key={job.id} className="p-3 bg-slate-700/50 rounded-md border border-slate-600/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-slate-200 text-sm">{job.title}</div>
                        <div className="flex items-center gap-1">
                          {job.status === "completed" && <CheckCircle className="w-4 h-4 text-green-400" />}
                          {job.status === "running" && <RotateCcw className="w-4 h-4 text-blue-400 animate-spin" />}
                          {job.status === "queued" && <Clock className="w-4 h-4 text-yellow-400" />}
                          {job.status === "failed" && <AlertCircle className="w-4 h-4 text-red-400" />}
                        </div>
                      </div>
                      <div className="text-xs text-slate-400 mb-2">
                        {job.status} • {new Date(job.createdAt).toLocaleTimeString()}
                      </div>
                      {job.status === "running" && (
                        <Progress value={job.progress} className="h-2 bg-slate-600">
                          <div
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${job.progress}%` }}
                          />
                        </Progress>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Clock className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                  <p className="text-slate-400 text-sm">No jobs in queue</p>
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
