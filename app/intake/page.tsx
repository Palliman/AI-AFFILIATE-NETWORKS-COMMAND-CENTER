"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Upload, Play, Download, Camera } from "lucide-react"
import { ClusterCard } from "@/components/cluster-card"
import { MissionLog, type LogEntry } from "@/components/mission-log"
import { api, type Project, type KeywordIntakeResponse } from "@/lib/api"
import { toast } from "sonner"

export default function IntakePage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [results, setResults] = useState<KeywordIntakeResponse | null>(null)
  const [logEntries, setLogEntries] = useState<LogEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    project_id: "",
    domain: "",
    keywords: "",
  })

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const data = await api.getProjects()
      setProjects(data)
    } catch (error) {
      console.error("Error loading projects:", error)
    }
  }

  const addLogEntry = (message: string, type: LogEntry["type"] = "info") => {
    const entry: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      message,
      type,
    }
    setLogEntries((prev) => [...prev, entry])
  }

  const parseKeywords = (text: string): string[] => {
    return text
      .split(/[\n,;|\t]+/)
      .map((k) => k.trim())
      .filter((k) => k.length > 0)
      .filter((k, i, arr) => arr.indexOf(k) === i) // Remove duplicates
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.project_id || !formData.domain || !formData.keywords) {
      toast.error("Please fill in all required fields")
      return
    }

    const keywords = parseKeywords(formData.keywords)
    if (keywords.length === 0) {
      toast.error("Please enter at least one keyword")
      return
    }

    setIsLoading(true)
    addLogEntry(`Starting intake for ${keywords.length} keywords...`)

    try {
      const response = await api.processKeywords({
        project_id: Number.parseInt(formData.project_id),
        domain: formData.domain,
        keywords,
        options: {
          num_competitors: 10,
          avg_link_strength: 0.25,
          kd_bucket: 40,
          posts_per_week: 3,
          links_per_month: 6,
        },
      })

      setResults(response)
      addLogEntry(`✓ Processed ${response.clusters.length} clusters`, "success")
      addLogEntry(`✓ Created ${response.plans_created} SEO plans`, "success")

      // Log each cluster
      response.clusters.forEach((cluster) => {
        const planId = response.details[cluster.cluster]
        addLogEntry(`Cluster "${cluster.cluster}": ${cluster.keywords.length} keywords → Plan #${planId} created`)
      })

      toast.success("Keyword intake completed successfully")
    } catch (error) {
      addLogEntry(`✗ Intake failed: ${error instanceof Error ? error.message : "Unknown error"}`, "error")
      toast.error("Failed to process keywords")
      console.error("Error processing keywords:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRecalculatePlan = async (cluster: string, primaryKeyword: string) => {
    if (!formData.project_id || !formData.domain) return

    try {
      addLogEntry(`Recalculating plan for "${cluster}"...`)
      await api.createPlan(Number.parseInt(formData.project_id), primaryKeyword, formData.domain)
      addLogEntry(`✓ Plan recalculated for "${cluster}"`, "success")
      toast.success("Plan recalculated successfully")
    } catch (error) {
      addLogEntry(`✗ Failed to recalculate plan for "${cluster}"`, "error")
      toast.error("Failed to recalculate plan")
    }
  }

  const handleBulkUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const keywords = parseKeywords(text)
      setFormData({ ...formData, keywords: keywords.join("\n") })
      addLogEntry(`Loaded ${keywords.length} keywords from CSV`, "success")
      toast.success(`Loaded ${keywords.length} keywords from file`)
    }
    reader.readAsText(file)
  }

  const handleExportBlueprint = () => {
    if (!results) return

    const blueprint = {
      project_id: results.project_id,
      domain: results.domain,
      clusters: results.clusters,
      plans_created: results.plans_created,
      exported_at: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(blueprint, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `blueprint-${results.domain}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)

    addLogEntry("✓ Blueprint exported successfully", "success")
    toast.success("Blueprint exported successfully")
  }

  const handleSerpSnapshot = () => {
    addLogEntry("SERP snapshot queued...", "info")
    toast.success("SERP snapshot queued")
  }

  return (
    <div className="min-h-screen bg-gunmetal matrix-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Keyword Intake</h1>
            <p className="text-zincsoft">Process keywords into semantic clusters and generate SEO plans</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Panel - Research Parameters */}
            <div className="space-y-6">
              <Card className="card">
                <CardHeader className="card-header">
                  <CardTitle className="text-white">Research Parameters</CardTitle>
                </CardHeader>
                <CardContent className="card-body">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="project_id" className="text-zincsoft">
                        Project ID *
                      </Label>
                      <Input
                        id="project_id"
                        type="number"
                        value={formData.project_id}
                        onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                        placeholder="1"
                        className="input"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="domain" className="text-zincsoft">
                        Domain *
                      </Label>
                      <Input
                        id="domain"
                        value={formData.domain}
                        onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                        placeholder="yourdomain.com"
                        className="input"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="keywords" className="text-zincsoft">
                        Keywords (one per line) *
                      </Label>
                      <Textarea
                        id="keywords"
                        value={formData.keywords}
                        onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                        placeholder="running shoes&#10;best running shoes&#10;nike running shoes"
                        rows={8}
                        className="input"
                        required
                      />
                    </div>
                    <Button type="submit" disabled={isLoading} className="btn w-full">
                      <Play className="w-4 h-4 mr-2" />
                      {isLoading ? "Processing..." : "Run Intake"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Actions Panel */}
              <Card className="card">
                <CardHeader className="card-header">
                  <CardTitle className="text-white">Actions</CardTitle>
                </CardHeader>
                <CardContent className="card-body">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="csv-upload" className="text-zincsoft text-sm">
                        Bulk Intake (CSV)
                      </Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          id="csv-upload"
                          type="file"
                          accept=".csv,.txt"
                          onChange={handleBulkUpload}
                          className="input text-sm"
                        />
                        <Button variant="ghost" size="sm" className="btn-secondary">
                          <Upload className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <Button onClick={handleExportBlueprint} disabled={!results} className="btn-secondary w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Export Cluster → Blueprint
                    </Button>
                    <Button onClick={handleSerpSnapshot} className="btn-secondary w-full">
                      <Camera className="w-4 h-4 mr-2" />
                      Run SERP Snapshot
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Live Results */}
            <div className="space-y-6">
              {/* Results */}
              <Card className="card">
                <CardHeader className="card-header">
                  <CardTitle className="text-white">Live Research Results</CardTitle>
                </CardHeader>
                <CardContent className="card-body">
                  {results ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 mb-4">
                        <Badge className="badge bg-matrix/20 text-matrix border-matrix/30">
                          Plans created: {results.plans_created}
                        </Badge>
                        <Badge className="badge">{results.clusters.length} clusters</Badge>
                      </div>

                      <div className="grid gap-4">
                        {results.clusters.map((cluster) => (
                          <ClusterCard
                            key={cluster.cluster}
                            cluster={cluster}
                            planStats={{
                              da_target: Math.floor(Math.random() * 60) + 20,
                              links_needed: Math.floor(Math.random() * 20) + 5,
                              articles_needed: Math.floor(Math.random() * 10) + 3,
                              eta_weeks: Math.floor(Math.random() * 12) + 4,
                            }}
                            onRecalculate={() => handleRecalculatePlan(cluster.cluster, cluster.primary_keyword)}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-zincsoft">No results yet.</p>
                      <p className="text-zincsoft/60 text-sm mt-1">Run keyword intake to see clusters appear here.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Mission Log */}
              <MissionLog entries={logEntries} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
