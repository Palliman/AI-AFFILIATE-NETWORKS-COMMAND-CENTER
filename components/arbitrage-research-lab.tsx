"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Zap, Database, Clock, CheckCircle, AlertCircle, Loader2, BarChart3, Target } from "lucide-react"

interface Cluster {
  id: string
  name: string
  keywords: string[]
  difficulty: number
  volume: number
  intent: string
  color: string
}

interface Job {
  id: string
  type: string
  status: "pending" | "running" | "completed" | "failed"
  progress: number
  startedAt: string
  estimatedCompletion?: string
  logs: string[]
}

export default function ArbitrageResearchLab() {
  const [keywords, setKeywords] = useState("")
  const [clusters, setClusters] = useState<Cluster[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState("intake")

  // Simulate job updates
  useEffect(() => {
    const interval = setInterval(() => {
      setJobs((prevJobs) =>
        prevJobs.map((job) => {
          if (job.status === "running" && job.progress < 100) {
            const newProgress = Math.min(job.progress + Math.random() * 15, 100)
            const newStatus = newProgress >= 100 ? "completed" : "running"

            return {
              ...job,
              progress: newProgress,
              status: newStatus,
              logs: newProgress >= 100 ? [...job.logs, "✅ Analysis complete"] : job.logs,
            }
          }
          return job
        }),
      )
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const handleKeywordIntake = async () => {
    if (!keywords.trim()) return

    setIsProcessing(true)

    // Create a new job
    const newJob: Job = {
      id: `job-${Date.now()}`,
      type: "keyword_clustering",
      status: "running",
      progress: 0,
      startedAt: new Date().toISOString(),
      logs: ["🚀 Initializing keyword clustering...", "📊 Analyzing search patterns..."],
    }

    setJobs((prev) => [newJob, ...prev])

    try {
      const keywordList = keywords.split("\n").filter((k) => k.trim())

      const response = await fetch("/api/keywords/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: keywordList }),
      })

      if (response.ok) {
        const data = await response.json()
        setClusters(data.clusters)
        setActiveTab("clusters")
      }
    } catch (error) {
      console.error("Keyword intake failed:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCreateSEOPlan = async () => {
    if (clusters.length === 0) return

    const allKeywords = clusters.flatMap((c) => c.keywords)

    try {
      const response = await fetch("/api/plans/auto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywords: allKeywords,
          clusters: clusters.length,
          targetDa: 50,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("SEO Plan created:", data)
        setActiveTab("plans")
      }
    } catch (error) {
      console.error("Plan creation failed:", error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-matrix" />
      case "running":
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
      case "failed":
        return <AlertCircle className="w-4 h-4 text-ember" />
      default:
        return <Clock className="w-4 h-4 text-zincsoft" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Arbitrage Research Lab</h2>
          <p className="text-zincsoft">Advanced keyword clustering and SEO opportunity analysis</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-matrix border-matrix/30">
            RankForge Integration
          </Badge>
          <Badge variant="outline" className="text-blue-400 border-blue-400/30">
            Live Pipeline
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-gunmetal border-white/10">
          <TabsTrigger value="intake" className="data-[state=active]:bg-matrix data-[state=active]:text-black">
            Keyword Intake
          </TabsTrigger>
          <TabsTrigger value="clusters" className="data-[state=active]:bg-matrix data-[state=active]:text-black">
            Cluster Analysis
          </TabsTrigger>
          <TabsTrigger value="plans" className="data-[state=active]:bg-matrix data-[state=active]:text-black">
            SEO Plans
          </TabsTrigger>
          <TabsTrigger value="jobs" className="data-[state=active]:bg-matrix data-[state=active]:text-black">
            Job Pipeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="intake" className="space-y-4">
          <Card className="bg-panel border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Database className="w-5 h-5 text-matrix" />
                Keyword Intake & Clustering
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-zincsoft mb-2 block">Enter keywords (one per line):</label>
                <textarea
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="best laptops 2024&#10;gaming laptops&#10;budget laptops&#10;laptop reviews"
                  className="w-full h-32 p-3 bg-gunmetal border border-white/10 rounded-md text-white placeholder:text-zincsoft resize-none"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleKeywordIntake}
                  disabled={isProcessing || !keywords.trim()}
                  className="bg-matrix hover:bg-matrix/80 text-black"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Analyze Keywords
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setKeywords("")}
                  className="border-white/10 text-zincsoft hover:text-white"
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clusters" className="space-y-4">
          {clusters.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Keyword Clusters ({clusters.length})</h3>
                <Button onClick={handleCreateSEOPlan} className="bg-matrix hover:bg-matrix/80 text-black">
                  <Target className="w-4 h-4 mr-2" />
                  Create SEO Plan
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {clusters.map((cluster) => (
                  <Card key={cluster.id} className="bg-panel border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-white">{cluster.name}</h4>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cluster.color }} />
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-zincsoft">Difficulty:</span>
                          <Badge
                            variant="outline"
                            className={`${
                              cluster.difficulty > 70
                                ? "text-ember border-ember/30"
                                : cluster.difficulty > 40
                                  ? "text-yellow-400 border-yellow-400/30"
                                  : "text-matrix border-matrix/30"
                            }`}
                          >
                            {cluster.difficulty}/100
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-zincsoft">Volume:</span>
                          <span className="text-white">{cluster.volume.toLocaleString()}</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-zincsoft">Intent:</span>
                          <Badge variant="outline" className="text-blue-400 border-blue-400/30">
                            {cluster.intent}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-zincsoft mb-1">Keywords ({cluster.keywords.length}):</div>
                        <div className="flex flex-wrap gap-1">
                          {cluster.keywords.slice(0, 3).map((keyword, i) => (
                            <Badge key={i} variant="secondary" className="text-xs bg-gunmetal text-zincsoft">
                              {keyword}
                            </Badge>
                          ))}
                          {cluster.keywords.length > 3 && (
                            <Badge variant="secondary" className="text-xs bg-gunmetal text-zincsoft">
                              +{cluster.keywords.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card className="bg-panel border-white/10">
              <CardContent className="p-8 text-center">
                <BarChart3 className="w-12 h-12 text-zincsoft mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Clusters Yet</h3>
                <p className="text-zincsoft mb-4">Process keywords in the Intake tab to see cluster analysis</p>
                <Button
                  onClick={() => setActiveTab("intake")}
                  variant="outline"
                  className="border-white/10 text-zincsoft hover:text-white"
                >
                  Go to Intake
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <Card className="bg-panel border-white/10">
            <CardContent className="p-8 text-center">
              <Target className="w-12 h-12 text-zincsoft mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">SEO Plans</h3>
              <p className="text-zincsoft mb-4">Auto-generated SEO plans will appear here after cluster analysis</p>
              <Button
                onClick={() => setActiveTab("clusters")}
                variant="outline"
                className="border-white/10 text-zincsoft hover:text-white"
              >
                View Clusters
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Job Pipeline ({jobs.length})</h3>
            <Badge variant="outline" className="text-matrix border-matrix/30">
              Live Updates
            </Badge>
          </div>

          {jobs.length > 0 ? (
            <div className="space-y-3">
              {jobs.map((job) => (
                <Card key={job.id} className="bg-panel border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(job.status)}
                        <span className="font-medium text-white">{job.type.replace("_", " ").toUpperCase()}</span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            job.status === "completed"
                              ? "text-matrix border-matrix/30"
                              : job.status === "running"
                                ? "text-blue-400 border-blue-400/30"
                                : job.status === "failed"
                                  ? "text-ember border-ember/30"
                                  : "text-zincsoft border-white/10"
                          }`}
                        >
                          {job.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-zincsoft">{new Date(job.startedAt).toLocaleTimeString()}</div>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-zincsoft">Progress</span>
                        <span className="text-white">{Math.round(job.progress)}%</span>
                      </div>
                      <Progress value={job.progress} className="h-2 bg-gunmetal" />
                    </div>

                    <div className="space-y-1">
                      {job.logs.slice(-3).map((log, i) => (
                        <div key={i} className="text-xs text-zincsoft font-mono">
                          {log}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-panel border-white/10">
              <CardContent className="p-8 text-center">
                <Clock className="w-12 h-12 text-zincsoft mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Active Jobs</h3>
                <p className="text-zincsoft">Jobs will appear here when you start processing keywords</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
