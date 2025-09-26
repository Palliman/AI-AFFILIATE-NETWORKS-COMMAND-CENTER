"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { runKeywordIntake, getProjects, type Project, type KeywordIntakeResponse } from "@/lib/api"
import { Upload, Play, FileText, Zap, Target } from "lucide-react"
import { toast } from "sonner"
import ClusterCard from "@/components/cluster-card"
import MissionLog from "@/components/mission-log"

export default function IntakePage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)
  const [domain, setDomain] = useState("")
  const [keywords, setKeywords] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<KeywordIntakeResponse | null>(null)

  const [options, setOptions] = useState({
    num_competitors: 10,
    avg_link_strength: 0.25,
    kd_bucket: 40,
    posts_per_week: 3,
    links_per_month: 6,
  })

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const data = await getProjects()
      setProjects(data)
      if (data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(data[0].id)
        setDomain(data[0].domain)
      }
    } catch (error) {
      toast.error("Failed to load projects")
      console.error("Load projects error:", error)
    }
  }

  const parseKeywords = (input: string): string[] => {
    return input
      .split(/[\n,;|\t]+/)
      .map((k) => k.trim())
      .filter((k) => k.length > 0)
      .filter((k, i, arr) => arr.indexOf(k) === i) // Remove duplicates
  }

  const handleRunIntake = async () => {
    if (!selectedProjectId || !domain.trim() || !keywords.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    const parsedKeywords = parseKeywords(keywords)
    if (parsedKeywords.length === 0) {
      toast.error("Please enter at least one keyword")
      return
    }

    setIsProcessing(true)
    setResults(null)

    // Add to mission log
    if ((window as any).addMissionLog) {
      ;(window as any).addMissionLog(`Starting intake: ${parsedKeywords.length} keywords for ${domain}`, "info")
    }

    try {
      const response = await runKeywordIntake({
        project_id: selectedProjectId,
        domain: domain.trim(),
        keywords: parsedKeywords,
        options,
      })

      setResults(response)
      toast.success(`Intake complete: ${response.clusters.length} clusters, ${response.plans_created} plans created`)

      // Add detailed logs
      if ((window as any).addMissionLog) {
        response.clusters.forEach((cluster, idx) => {
          const planId = Object.values(response.details)[idx] || "N/A"
          ;(window as any).addMissionLog(
            `Cluster "${cluster.cluster}": ${cluster.keywords.length} keywords → Plan #${planId} created`,
            "success",
          )
        })
      }
    } catch (error) {
      toast.error("Intake failed")
      console.error("Intake error:", error)

      if ((window as any).addMissionLog) {
        ;(window as any).addMissionLog(`Intake failed: ${error}`, "error")
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setKeywords(content)
      toast.success("Keywords loaded from file")
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

    toast.success("Blueprint exported")

    if ((window as any).addMissionLog) {
      ;(window as any).addMissionLog(`Blueprint exported: ${results.clusters.length} clusters`, "success")
    }
  }

  const handleSerpSnapshot = () => {
    toast.info("SERP snapshot queued")

    if ((window as any).addMissionLog) {
      ;(window as any).addMissionLog("SERP snapshot queued for processing", "info")
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Panel - Research Parameters */}
      <div className="lg:col-span-4 space-y-6">
        <div className="card">
          <div className="card-header">
            <Target className="w-4 h-4 text-matrix mr-2" />
            Research Parameters
          </div>
          <div className="card-body space-y-4">
            <div>
              <label className="block text-sm text-zincsoft mb-2">Project</label>
              <select
                value={selectedProjectId || ""}
                onChange={(e) => {
                  const projectId = Number(e.target.value)
                  setSelectedProjectId(projectId)
                  const project = projects.find((p) => p.id === projectId)
                  if (project) setDomain(project.domain)
                }}
                className="input"
              >
                <option value="">Select project...</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.domain} (#{project.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-zincsoft mb-2">Domain</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm text-zincsoft mb-2">Keywords</label>
              <textarea
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Enter keywords (one per line, or comma/semicolon separated)&#10;running shoes&#10;best running shoes&#10;marathon training"
                rows={8}
                className="input resize-none"
              />
              <div className="text-xs text-zincsoft/60 mt-1">{parseKeywords(keywords).length} unique keywords</div>
            </div>

            <button
              onClick={handleRunIntake}
              disabled={isProcessing || !selectedProjectId || !domain.trim() || !keywords.trim()}
              className="btn w-full"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing Intake...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Intake
                </>
              )}
            </button>
          </div>
        </div>

        {/* Actions Panel */}
        <div className="card">
          <div className="card-header">
            <Zap className="w-4 h-4 text-matrix mr-2" />
            Actions
          </div>
          <div className="card-body space-y-3">
            <div>
              <label className="block text-sm text-zincsoft mb-2">Bulk Intake (CSV)</label>
              <input type="file" accept=".csv,.txt" onChange={handleBulkUpload} className="input" />
            </div>

            <button onClick={handleExportBlueprint} disabled={!results} className="btn-secondary w-full">
              <FileText className="w-4 h-4" />
              Export Cluster → Blueprint
            </button>

            <button onClick={handleSerpSnapshot} className="btn-secondary w-full">
              <Upload className="w-4 h-4" />
              Run SERP Snapshot
            </button>
          </div>
        </div>
      </div>

      {/* Center Panel - Live Research Results */}
      <div className="lg:col-span-5 space-y-6">
        <div className="card">
          <div className="card-header">
            <Target className="w-4 h-4 text-matrix mr-2" />
            Live Research Results
          </div>
          <div className="card-body">
            {!results ? (
              <div className="text-center py-12">
                <Target className="w-12 h-12 text-zincsoft/30 mx-auto mb-4" />
                <p className="text-zincsoft">Ready for keyword intake</p>
                <p className="text-zincsoft/60 text-sm">Configure parameters and run intake to see clusters</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-white">Cluster Results</h3>
                  <div className="badge bg-matrix/20 text-matrix border-matrix/30">
                    Plans created: {results.plans_created}
                  </div>
                </div>

                <div className="grid gap-4">
                  {results.clusters.map((cluster, idx) => {
                    const planId = Object.values(results.details)[idx]
                    return (
                      <ClusterCard
                        key={cluster.cluster}
                        cluster={cluster}
                        projectId={results.project_id}
                        domain={results.domain}
                        planStats={{
                          da_target: 40 + Math.floor(Math.random() * 40), // Mock data
                          links: 15 + Math.floor(Math.random() * 20),
                          articles: 5 + Math.floor(Math.random() * 10),
                          eta_weeks: 4 + Math.random() * 8,
                        }}
                        onPlanRecalculated={() => {
                          if ((window as any).addMissionLog) {
                            ;(window as any).addMissionLog(`Plan recalculated for "${cluster.cluster}"`, "success")
                          }
                        }}
                      />
                    )
                  })}
                </div>

                {/* Plans Created Summary */}
                <div className="border-t border-white/5 pt-4">
                  <h4 className="text-sm text-zincsoft mb-2">Plans Created</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(results.details).map(([cluster, planId]) => (
                      <div key={cluster} className="text-xs bg-white/5 rounded px-2 py-1 border border-white/10">
                        <span className="text-zincsoft">{cluster}</span>
                        <span className="text-matrix ml-1">• Plan #{planId}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Mission Log */}
      <div className="lg:col-span-3">
        <MissionLog isActive={isProcessing} />
      </div>
    </div>
  )
}
