"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createProject, getProjects, type Project } from "@/lib/api"
import { Plus, Database, Calendar } from "lucide-react"
import { toast } from "sonner"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    domain: "",
    industry: "",
  })

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const data = await getProjects()
      setProjects(data)
    } catch (error) {
      toast.error("Failed to load projects")
      console.error("Load projects error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.domain.trim()) return

    setIsCreating(true)
    try {
      const newProject = await createProject({
        domain: formData.domain.trim(),
        industry: formData.industry.trim() || undefined,
      })

      setProjects((prev) => [newProject, ...prev])
      setFormData({ domain: "", industry: "" })
      toast.success("Project created successfully")

      // Add to mission log
      if ((window as any).addMissionLog) {
        ;(window as any).addMissionLog(`Project created: ${newProject.domain}`, "success")
      }
    } catch (error) {
      toast.error("Failed to create project")
      console.error("Create project error:", error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-zincsoft">Manage your SEO projects and domains</p>
        </div>
      </div>

      {/* Create Project Form */}
      <div className="card">
        <div className="card-header">
          <Plus className="w-4 h-4 text-matrix mr-2" />
          Create New Project
        </div>
        <div className="card-body">
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zincsoft mb-2">Domain *</label>
                <input
                  type="text"
                  value={formData.domain}
                  onChange={(e) => setFormData((prev) => ({ ...prev, domain: e.target.value }))}
                  placeholder="example.com"
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-zincsoft mb-2">Industry</label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData((prev) => ({ ...prev, industry: e.target.value }))}
                  placeholder="Technology, Health, Finance..."
                  className="input"
                />
              </div>
            </div>
            <button type="submit" disabled={isCreating || !formData.domain.trim()} className="btn">
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Project
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Projects Table */}
      <div className="card">
        <div className="card-header">
          <Database className="w-4 h-4 text-matrix mr-2" />
          Projects ({projects.length})
        </div>
        <div className="card-body">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-matrix/30 border-t-matrix rounded-full animate-spin mx-auto mb-2" />
              <p className="text-zincsoft">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8">
              <Database className="w-12 h-12 text-zincsoft/30 mx-auto mb-4" />
              <p className="text-zincsoft">No projects created yet</p>
              <p className="text-zincsoft/60 text-sm">Create your first project to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left py-3 px-4 text-sm text-zincsoft font-medium">ID</th>
                    <th className="text-left py-3 px-4 text-sm text-zincsoft font-medium">Domain</th>
                    <th className="text-left py-3 px-4 text-sm text-zincsoft font-medium">Industry</th>
                    <th className="text-left py-3 px-4 text-sm text-zincsoft font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-sm font-mono text-matrix">{project.id}</td>
                      <td className="py-3 px-4 text-sm font-medium text-white">{project.domain}</td>
                      <td className="py-3 px-4 text-sm text-zincsoft">
                        {project.industry || <span className="text-zincsoft/50 italic">Not specified</span>}
                      </td>
                      <td className="py-3 px-4 text-sm text-zincsoft">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(project.created_at).toLocaleDateString()}
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
