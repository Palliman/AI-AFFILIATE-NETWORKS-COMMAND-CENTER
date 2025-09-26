"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Target, Calendar, TrendingUp, DollarSign, Clock, Filter, Search } from "lucide-react"
import { api } from "@/lib/api"

interface Plan {
  id: string
  name: string
  description: string
  keywords: string[]
  targetDa: number
  status: "draft" | "active" | "paused" | "completed"
  progress: number
  estimatedCompletion?: string
  createdAt: string
  updatedAt: string
  metrics: {
    totalKeywords: number
    difficulty: number
    estimatedTraffic: number
    budget: number
  }
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [filteredPlans, setFilteredPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    loadPlans()
  }, [])

  useEffect(() => {
    filterPlans()
  }, [plans, searchTerm, statusFilter])

  const loadPlans = async () => {
    try {
      const data = await api.getPlans()
      setPlans(data.plans || [])
    } catch (error) {
      console.error("Failed to load plans:", error)
      // Mock data fallback
      setPlans([
        {
          id: "1",
          name: "Tech Review SEO Campaign",
          description: "Comprehensive SEO strategy for technology product reviews",
          keywords: ["best laptops", "smartphone reviews", "tech deals", "gadget guide"],
          targetDa: 45,
          status: "active",
          progress: 65,
          estimatedCompletion: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          metrics: {
            totalKeywords: 45,
            difficulty: 58,
            estimatedTraffic: 125000,
            budget: 3500,
          },
        },
        {
          id: "2",
          name: "Crypto Trading Affiliate Plan",
          description: "Cryptocurrency trading and investment affiliate marketing",
          keywords: ["bitcoin trading", "crypto signals", "trading bots"],
          targetDa: 38,
          status: "active",
          progress: 30,
          estimatedCompletion: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          metrics: {
            totalKeywords: 32,
            difficulty: 72,
            estimatedTraffic: 89000,
            budget: 4200,
          },
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const filterPlans = () => {
    let filtered = plans

    if (searchTerm) {
      filtered = filtered.filter(
        (plan) =>
          plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          plan.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((plan) => plan.status === statusFilter)
    }

    setFilteredPlans(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-matrix border-matrix/30 bg-matrix/10"
      case "paused":
        return "text-yellow-400 border-yellow-400/30 bg-yellow-400/10"
      case "completed":
        return "text-blue-400 border-blue-400/30 bg-blue-400/10"
      case "draft":
        return "text-zincsoft border-white/10 bg-white/5"
      default:
        return "text-zincsoft border-white/10"
    }
  }

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty > 70) return "text-ember"
    if (difficulty > 40) return "text-yellow-400"
    return "text-matrix"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getDaysUntilCompletion = (dateString?: string) => {
    if (!dateString) return null
    const days = Math.ceil((new Date(dateString).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return days > 0 ? days : 0
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-matrix">Loading plans...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">SEO Plans</h1>
          <p className="text-zincsoft">Manage and track your SEO campaigns</p>
        </div>

        <Button className="bg-matrix hover:bg-matrix/80 text-black">
          <Plus className="w-4 h-4 mr-2" />
          New Plan
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-panel border-white/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zincsoft" />
                <Input
                  placeholder="Search plans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gunmetal border-white/10 text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-zincsoft" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 bg-gunmetal border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gunmetal border-white/10">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans Grid */}
      {filteredPlans.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {filteredPlans.map((plan) => (
            <Card key={plan.id} className="bg-panel border-white/10 hover:border-white/20 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white mb-1">{plan.name}</CardTitle>
                    <p className="text-sm text-zincsoft">{plan.description}</p>
                  </div>
                  <Badge className={getStatusColor(plan.status)}>{plan.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zincsoft">Progress</span>
                    <span className="text-white font-medium">{plan.progress}%</span>
                  </div>
                  <Progress value={plan.progress} className="h-2 bg-gunmetal" />
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-zincsoft">
                      <Target className="w-3 h-3" />
                      Keywords
                    </div>
                    <div className="text-sm text-white font-medium">{plan.metrics.totalKeywords}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-zincsoft">
                      <TrendingUp className="w-3 h-3" />
                      Difficulty
                    </div>
                    <div className={`text-sm font-medium ${getDifficultyColor(plan.metrics.difficulty)}`}>
                      {plan.metrics.difficulty}/100
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-zincsoft">
                      <TrendingUp className="w-3 h-3" />
                      Est. Traffic
                    </div>
                    <div className="text-sm text-white font-medium">
                      {plan.metrics.estimatedTraffic.toLocaleString()}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-zincsoft">
                      <DollarSign className="w-3 h-3" />
                      Budget
                    </div>
                    <div className="text-sm text-white font-medium">${plan.metrics.budget.toLocaleString()}</div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex items-center gap-1 text-xs text-zincsoft">
                    <Calendar className="w-3 h-3" />
                    Created {formatDate(plan.createdAt)}
                  </div>

                  {plan.estimatedCompletion && (
                    <div className="flex items-center gap-1 text-xs">
                      <Clock className="w-3 h-3 text-matrix" />
                      <span className="text-matrix">{getDaysUntilCompletion(plan.estimatedCompletion)}d remaining</span>
                    </div>
                  )}
                </div>

                {/* Keywords Preview */}
                <div className="space-y-2">
                  <div className="text-xs text-zincsoft">Keywords:</div>
                  <div className="flex flex-wrap gap-1">
                    {plan.keywords.slice(0, 3).map((keyword, i) => (
                      <Badge key={i} variant="secondary" className="text-xs bg-gunmetal text-zincsoft">
                        {keyword}
                      </Badge>
                    ))}
                    {plan.keywords.length > 3 && (
                      <Badge variant="secondary" className="text-xs bg-gunmetal text-zincsoft">
                        +{plan.keywords.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-panel border-white/10">
          <CardContent className="p-12 text-center">
            <Target className="w-16 h-16 text-zincsoft mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm || statusFilter !== "all" ? "No Plans Found" : "No Plans Yet"}
            </h3>
            <p className="text-zincsoft mb-6">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Create your first SEO plan to start tracking campaigns"}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Button className="bg-matrix hover:bg-matrix/80 text-black">
                <Plus className="w-4 h-4 mr-2" />
                Create First Plan
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
