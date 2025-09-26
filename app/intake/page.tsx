"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Upload, Zap, BarChart3, Target, Clock } from "lucide-react"
import ClusterCard from "@/components/cluster-card"

interface Cluster {
  id: string
  name: string
  keywords: string[]
  difficulty: number
  volume: number
  intent: string
  color: string
}

export default function IntakePage() {
  const [keywords, setKeywords] = useState("")
  const [clusters, setClusters] = useState<Cluster[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleProcess = async () => {
    if (!keywords.trim()) return

    setIsProcessing(true)
    setProgress(0)
    setClusters([])

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + Math.random() * 15
      })
    }, 500)

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
        setProgress(100)
      }
    } catch (error) {
      console.error("Processing failed:", error)
    } finally {
      clearInterval(progressInterval)
      setTimeout(() => {
        setIsProcessing(false)
        setProgress(0)
      }, 1000)
    }
  }

  const handleCreatePlan = async () => {
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
      }
    } catch (error) {
      console.error("Plan creation failed:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Keyword Intake</h1>
          <p className="text-zincsoft">Process and cluster keywords for SEO analysis</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-matrix border-matrix/30">
            AI Clustering
          </Badge>
          <Badge variant="outline" className="text-blue-400 border-blue-400/30">
            Real-time Analysis
          </Badge>
        </div>
      </div>

      {/* Input Section */}
      <Card className="bg-panel border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Upload className="w-5 h-5 text-matrix" />
            Keyword Input
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-zincsoft mb-2 block">Enter keywords (one per line):</label>
            <Textarea
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="best laptops 2024&#10;gaming laptops&#10;budget laptops&#10;laptop reviews&#10;laptop buying guide"
              className="h-40 bg-gunmetal border-white/10 text-white placeholder:text-zincsoft resize-none font-mono"
            />
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={handleProcess}
              disabled={isProcessing || !keywords.trim()}
              className="bg-matrix hover:bg-matrix/80 text-black"
            >
              <Zap className="w-4 h-4 mr-2" />
              {isProcessing ? "Processing..." : "Process Keywords"}
            </Button>

            <div className="text-sm text-zincsoft">
              {keywords.split("\n").filter((k) => k.trim()).length} keywords ready
            </div>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zincsoft">Processing keywords...</span>
                <span className="text-white">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2 bg-gunmetal" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {clusters.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-white">Cluster Analysis Results</h2>
              <Badge variant="outline" className="text-matrix border-matrix/30">
                {clusters.length} clusters found
              </Badge>
            </div>

            <Button onClick={handleCreatePlan} className="bg-matrix hover:bg-matrix/80 text-black">
              <Target className="w-4 h-4 mr-2" />
              Create SEO Plan
            </Button>
          </div>

          {/* Cluster Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-panel border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-matrix" />
                  <span className="text-sm text-zincsoft">Total Keywords</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {clusters.reduce((sum, c) => sum + c.keywords.length, 0)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-panel border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-zincsoft">Avg Difficulty</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {Math.round(clusters.reduce((sum, c) => sum + c.difficulty, 0) / clusters.length)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-panel border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-zincsoft">Est. Timeline</span>
                </div>
                <div className="text-2xl font-bold text-white">{Math.ceil(clusters.length * 2)}w</div>
              </CardContent>
            </Card>
          </div>

          {/* Cluster Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clusters.map((cluster, index) => (
              <ClusterCard key={cluster.id} cluster={cluster} estimatedDays={14 + index * 7} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {clusters.length === 0 && !isProcessing && (
        <Card className="bg-panel border-white/10">
          <CardContent className="p-12 text-center">
            <BarChart3 className="w-16 h-16 text-zincsoft mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Ready for Analysis</h3>
            <p className="text-zincsoft mb-6">
              Enter your keywords above and click "Process Keywords" to see cluster analysis
            </p>
            <div className="text-sm text-zincsoft">
              💡 Tip: Include a mix of head terms and long-tail keywords for best results
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
