"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Folder, Calendar, TrendingUp, Users } from "lucide-react"
import { api } from "@/lib/api"

interface Project {
  id: string
  name: string
  description: string
  status: "active" | "paused" | "completed"
  domains: string[]
  keywords: string[]
  targetDa: number
  createdAt: string
  updatedAt: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    targetDa: 50,
  })

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const data = await api.getProjects()
      setProjects(data.projects || [])
    } catch (error) {
      console.error("Failed to load projects:", error)
      // Mock data fallback
      setProjects([
        {
          id: "1",
          name: "Tech Review Network",
          description: "Technology product reviews and affiliate marketing",
          status: "active",
          domains: ["techreview.com", "gadgetguide.net"],
          keywords: ["best laptops", "smartphone reviews", "tech deals"],
          targetDa: 45,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Crypto Insights Hub",
          description: "Cryptocurrency news and trading affiliate programs",
          status: "active",
          domains: ["cryptoinsights.net"],
          keywords: ["bitcoin trading", "crypto news", "blockchain guide"],
          targetDa: 38,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) return

    setIsCreating(true)
    try {
      const data = await api.createProject(newProject)
      setProjects((prev) => [data.project, ...prev])
      setNewProject({ name: "", description: "", targetDa: 50 })
    } catch (error) {
      console.error("Failed to create project:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-matrix border-matrix/30"
      case "paused":
        return "text-yellow-400 border-yellow-400/30"
      case "completed":
        return "text-blue-400 border-blue-400/30"
      default:
        return "text-zincsoft border-white/10"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-matrix">Loading projects...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="text-zincsoft">Manage your affiliate marketing projects</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-matrix hover:bg-matrix/80 text-black">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-panel border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-zincsoft mb-2 block">Project Name</label>
                <Input
                  value={newProject.name}
                  onChange={(e) => setNewProject((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter project name"
                  className="bg-gunmetal border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-zincsoft mb-2 block">Description</label>
                <Textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Project description"
                  className="bg-gunmetal border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-zincsoft mb-2 block">Target DA</label>
                <Input
                  type="number"
                  value={newProject.targetDa}
                  onChange={(e) =>
                    setNewProject((prev) => ({ ...prev, targetDa: Number.parseInt(e.target.value) || 50 }))
                  }
                  className="bg-gunmetal border-white/10 text-white"
                />
              </div>
              <Button
                onClick={handleCreateProject}
                disabled={isCreating || !newProject.name.trim()}
                className="w-full bg-matrix hover:bg-matrix/80 text-black"
              >
                {isCreating ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {projects.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="bg-panel border-white/10 hover:border-white/20 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Folder className="w-5 h-5 text-matrix" />
                    <CardTitle className="text-white">{project.name}</CardTitle>
                  </div>
                  <Badge variant="outline" className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-zincsoft">{project.description}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-zincsoft">
                      <Users className="w-3 h-3" />
                      Domains
                    </div>
                    <div className="text-sm text-white font-medium">{project.domains.length}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-zincsoft">
                      <TrendingUp className="w-3 h-3" />
                      Target DA
                    </div>
                    <div className="text-sm text-white font-medium">{project.targetDa}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-zincsoft">Keywords ({project.keywords.length})</div>
                  <div className="flex flex-wrap gap-1">
                    {project.keywords.slice(0, 3).map((keyword, i) => (
                      <Badge key={i} variant="secondary" className="text-xs bg-gunmetal text-zincsoft">
                        {keyword}
                      </Badge>
                    ))}
                    {project.keywords.length > 3 && (
                      <Badge variant="secondary" className="text-xs bg-gunmetal text-zincsoft">
                        +{project.keywords.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-zincsoft pt-2 border-t border-white/5">
                  <Calendar className="w-3 h-3" />
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-panel border-white/10">
          <CardContent className="p-12 text-center">
            <Folder className="w-16 h-16 text-zincsoft mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Projects Yet</h3>
            <p className="text-zincsoft mb-6">
              Create your first project to start managing affiliate marketing campaigns
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-matrix hover:bg-matrix/80 text-black">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Project
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-panel border-white/10">
                <DialogHeader>
                  <DialogTitle className="text-white">Create New Project</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-zincsoft mb-2 block">Project Name</label>
                    <Input
                      value={newProject.name}
                      onChange={(e) => setNewProject((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter project name"
                      className="bg-gunmetal border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-zincsoft mb-2 block">Description</label>
                    <Textarea
                      value={newProject.description}
                      onChange={(e) => setNewProject((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Project description"
                      className="bg-gunmetal border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-zincsoft mb-2 block">Target DA</label>
                    <Input
                      type="number"
                      value={newProject.targetDa}
                      onChange={(e) =>
                        setNewProject((prev) => ({ ...prev, targetDa: Number.parseInt(e.target.value) || 50 }))
                      }
                      className="bg-gunmetal border-white/10 text-white"
                    />
                  </div>
                  <Button
                    onClick={handleCreateProject}
                    disabled={isCreating || !newProject.name.trim()}
                    className="w-full bg-matrix hover:bg-matrix/80 text-black"
                  >
                    {isCreating ? "Creating..." : "Create Project"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
