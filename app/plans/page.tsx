"use client"

import { useState, useEffect } from "react"
import { getPlans, getProjects, type Plan, type Project } from "@/lib/api"
import { Filter, Calendar, Target, Link, FileText, Clock } from "lucide-react"
import { toast } from "sonner"

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterProjectId, setFilterProjectId] = useState<number | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [plansData, projectsData] = await Promise.all([getPlans(), getProjects()])
      setPlans(plansData)
      setProjects(projectsData)
    } catch (error) {
      toast.error("Failed to load data")
      console.error("Load data error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      const plansData = await getPlans(filterProjectId || undefined)
      setPlans(plansData)
      toast.success("Plans refreshed")
    } catch (error) {
      toast.error("Failed to refresh plans")
      console.error("Refresh error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getProjectDomain = (projectId: number) => {
    const project = projects.find((p) => p.id === projectId)
    return project?.domain || `Project #${projectId}`
  }

  const getDifficultyColor = (daTarget: number) => {
    if (daTarget >= 70) return "text-ember"
    if (daTarget >= 50) return "text-yellow-400"
    return "text-matrix"
  }

  const filteredPlans = filterProjectId ? plans.filter((plan) => plan.project_id === filterProjectId) : plans

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">SEO Plans</h1>
          <p className="text-zincsoft">Generated plans with DA targets and execution timelines</p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="card">
        <div className="card-body">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-matrix" />
              <span className="text-sm text-zincsoft">Filter by project:</span>
            </div>

            <select
              value={filterProjectId || ""}
              onChange={(e) => setFilterProjectId(e.target.value ? Number(e.target.value) : null)}
              className="input w-64"
            >
              <option value="">All projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.domain} (#{project.id})
                </option>
              ))}
            </select>

            <button onClick={handleRefresh} disabled={isLoading} className="btn-secondary">
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-matrix/30 border-t-matrix rounded-full animate-spin" />
              ) : (
                "Refresh"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Plans Table */}
      <div className="card">
        <div className="card-header">
          <FileText className="w-4 h-4 text-matrix mr-2" />
          Plans ({filteredPlans.length})
        </div>
        <div className="card-body">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-matrix/30 border-t-matrix rounded-full animate-spin mx-auto mb-2" />
              <p className="text-zincsoft">Loading plans...</p>
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-zincsoft/30 mx-auto mb-4" />
              <p className="text-zincsoft">No plans found</p>
              <p className="text-zincsoft/60 text-sm">
                {filterProjectId ? "Try selecting a different project" : "Run keyword intake to generate plans"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left py-3 px-4 text-sm text-zincsoft font-medium">ID</th>
                    <th className="text-left py-3 px-4 text-sm text-zincsoft font-medium">Project</th>
                    <th className="text-left py-3 px-4 text-sm text-zincsoft font-medium">DA Target</th>
                    <th className="text-left py-3 px-4 text-sm text-zincsoft font-medium">Links</th>
                    <th className="text-left py-3 px-4 text-sm text-zincsoft font-medium">Articles</th>
                    <th className="text-left py-3 px-4 text-sm text-zincsoft font-medium">ETA (weeks)</th>
                    <th className="text-left py-3 px-4 text-sm text-zincsoft font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlans.map((plan) => (
                    <tr key={plan.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-sm font-mono text-matrix">{plan.id}</td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Target className="w-3 h-3 text-zincsoft" />
                          <span className="font-medium text-white">{getProjectDomain(plan.project_id)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className={`font-medium ${getDifficultyColor(plan.da_target)}`}>{plan.da_target}</span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Link className="w-3 h-3 text-zincsoft" />
                          <span className="text-white">{plan.links}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3 text-zincsoft" />
                          <span className="text-white">{plan.articles}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-matrix" />
                          <span className="text-matrix font-medium">{plan.eta_weeks.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-zincsoft">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(plan.created_at).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
