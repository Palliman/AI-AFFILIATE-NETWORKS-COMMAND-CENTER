"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, ExternalLink } from "lucide-react"
import { api, type Project } from "@/lib/api"
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
      const data = await api.getProjects()
      setProjects(data)
    } catch (error) {
      toast.error("Failed to load projects")
      console.error("Error loading projects:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.domain.trim()) return

    setIsCreating(true)
    try {
      const newProject = await api.createProject(formData.domain.trim(), formData.industry.trim() || undefined)
      setProjects([...projects, newProject])
      setFormData({ domain: "", industry: "" })
      toast.success("Project created successfully")
    } catch (error) {
      toast.error("Failed to create project")
      console.error("Error creating project:", error)
    } finally {
      setIsCreating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gunmetal matrix-bg">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-matrix mx-auto"></div>
            <p className="text-zincsoft mt-2">Loading projects...</p>
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
            <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
            <p className="text-zincsoft">Manage your SEO projects and domains</p>
          </div>

          {/* Create Project Form */}
          <Card className="card">
            <CardHeader className="card-header">
              <CardTitle className="text-white">Create New Project</CardTitle>
            </CardHeader>
            <CardContent className="card-body">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="domain" className="text-zincsoft">
                      Domain *
                    </Label>
                    <Input
                      id="domain"
                      value={formData.domain}
                      onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                      placeholder="example.com"
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="industry" className="text-zincsoft">
                      Industry (optional)
                    </Label>
                    <Input
                      id="industry"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      placeholder="e.g., Technology, Health, Finance"
                      className="input"
                    />
                  </div>
                </div>
                <Button type="submit" disabled={isCreating || !formData.domain.trim()} className="btn">
                  <Plus className="w-4 h-4 mr-2" />
                  {isCreating ? "Creating..." : "Create Project"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Projects Table */}
          <Card className="card">
            <CardHeader className="card-header">
              <CardTitle className="text-white">Your Projects</CardTitle>
            </CardHeader>
            <CardContent className="card-body">
              {projects.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-zincsoft">No projects created yet.</p>
                  <p className="text-zincsoft/60 text-sm mt-1">Create your first project above.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-4 bg-panelAlt rounded-lg border border-white/10"
                    >
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-medium text-white">{project.domain}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className="badge">ID: {project.id}</Badge>
                            {project.industry && (
                              <Badge variant="outline" className="badge">
                                {project.industry}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zincsoft">
                          {new Date(project.created_at).toLocaleDateString()}
                        </span>
                        <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0 hover:bg-white/10">
                          <a href={`https://${project.domain}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
