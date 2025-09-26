"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { RefreshCw } from "lucide-react"
import { api, type Plan } from "@/lib/api"
import { toast } from "sonner"

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [projectIdFilter, setProjectIdFilter] = useState("")

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async (projectId?: number) => {
    try {
      setIsRefreshing(true)
      const data = await api.getPlans(projectId)
      setPlans(data)
    } catch (error) {
      toast.error("Failed to load plans")
      console.error("Error loading plans:", error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = () => {
    const projectId = projectIdFilter ? Number.parseInt(projectIdFilter) : undefined
    loadPlans(projectId)
  }

  const getDifficultyColor = (daTarget: number) => {
    if (daTarget <= 30) return "text-matrix" // Easy - green
    if (daTarget <= 50) return "text-yellow-400" // Medium - yellow
    return "text-ember" // Hard - red
  }

  const getDifficultyBadge = (daTarget: number) => {
    if (daTarget <= 30) return { text: "Easy", class: "bg-matrix/20 text-matrix border-matrix/30" }
    if (daTarget <= 50) return { text: "Medium", class: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" }
    return { text: "Hard", class: "bg-ember/20 text-ember border-ember/30" }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gunmetal matrix-bg">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-matrix mx-auto"></div>
            <p className="text-zincsoft mt-2">Loading plans...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gunmetal matrix-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">SEO Plans</h1>
            <p className="text-zincsoft">View and manage your generated SEO plans</p>
          </div>

          {/* Filter Row */}
          <Card className="card">
            <CardContent className="card-body">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="project-filter" className="text-zincsoft">
                    Filter by Project ID (optional)
                  </Label>
                  <Input
                    id="project-filter"
                    type="number"
                    value={projectIdFilter}
                    onChange={(e) => setProjectIdFilter(e.target.value)}
                    placeholder="Enter project ID"
                    className="input"
                  />
                </div>
                <Button onClick={handleRefresh} disabled={isRefreshing} className="btn mt-6">
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Plans Table */}
          <Card className="card">
            <CardHeader className="card-header">
              <CardTitle className="text-white">Generated Plans ({plans.length})</CardTitle>
            </CardHeader>
            <CardContent className="card-body">
              {plans.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-zincsoft">No plans found.</p>
                  <p className="text-zincsoft/60 text-sm mt-1">
                    {projectIdFilter
                      ? "Try a different project ID or clear the filter."
                      : "Create some projects and run keyword intake to generate plans."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {plans.map((plan) => {
                    const difficulty = getDifficultyBadge(plan.da_target)
                    return (
                      <div key={plan.id} className="p-4 bg-panelAlt rounded-lg border border-white/10">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-medium text-white mb-1">{plan.keyword}</h3>
                            <p className="text-sm text-zincsoft">{plan.domain}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="badge">ID: {plan.id}</Badge>
                            <Badge className="badge">Project: {plan.project_id}</Badge>
                            <Badge className={`badge ${difficulty.class}`}>{difficulty.text}</Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-panel rounded border border-white/5">
                            <p className="text-xs text-zincsoft/70 mb-1">DA Target</p>
                            <p className={`text-lg font-bold ${getDifficultyColor(plan.da_target)}`}>
                              {plan.da_target}
                            </p>
                          </div>
                          <div className="text-center p-3 bg-panel rounded border border-white/5">
                            <p className="text-xs text-zincsoft/70 mb-1">Links Needed</p>
                            <p className="text-lg font-bold text-white">{plan.links_needed}</p>
                          </div>
                          <div className="text-center p-3 bg-panel rounded border border-white/5">
                            <p className="text-xs text-zincsoft/70 mb-1">Articles</p>
                            <p className="text-lg font-bold text-white">{plan.articles_needed}</p>
                          </div>
                          <div className="text-center p-3 bg-panel rounded border border-white/5">
                            <p className="text-xs text-zincsoft/70 mb-1">ETA (weeks)</p>
                            <p className="text-lg font-bold text-white">{plan.eta_weeks.toFixed(1)}</p>
                          </div>
                        </div>

                        <div className="mt-3 text-xs text-zincsoft/60">
                          Created: {new Date(plan.created_at).toLocaleString()}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
