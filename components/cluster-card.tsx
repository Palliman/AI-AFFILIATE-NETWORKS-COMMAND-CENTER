"use client"

import { useState } from "react"
import type { Cluster } from "@/lib/api"
import { createAutoPlan } from "@/lib/api"
import { RefreshCw, Target } from "lucide-react"
import { toast } from "sonner"

interface ClusterCardProps {
  cluster: Cluster
  projectId: number
  domain: string
  planStats?: {
    da_target: number
    links: number
    articles: number
    eta_weeks: number
  }
  onPlanRecalculated?: () => void
}

export default function ClusterCard({ cluster, projectId, domain, planStats, onPlanRecalculated }: ClusterCardProps) {
  const [isRecalculating, setIsRecalculating] = useState(false)

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case "commercial":
        return "bg-ember/20 text-ember border-ember/30"
      case "transactional":
        return "bg-matrix/20 text-matrix border-matrix/30"
      case "informational":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      default:
        return "bg-white/10 text-zincsoft border-white/20"
    }
  }

  const getDifficultyColor = (daTarget: number) => {
    if (daTarget >= 70) return "text-ember" // Brutal
    if (daTarget >= 50) return "text-yellow-400" // Moderate
    return "text-matrix" // Easy
  }

  const handleRecalculatePlan = async () => {
    setIsRecalculating(true)
    try {
      await createAutoPlan({
        project_id: projectId,
        keyword: cluster.primary_keyword,
        domain,
      })
      toast.success("Plan recalculated successfully")
      onPlanRecalculated?.()
    } catch (error) {
      toast.error("Failed to recalculate plan")
      console.error("Plan recalculation error:", error)
    } finally {
      setIsRecalculating(false)
    }
  }

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-matrix" />
          <span className="font-medium text-white">{cluster.cluster}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`badge ${getIntentColor(cluster.intent)}`}>{cluster.intent}</span>
          <button
            onClick={handleRecalculatePlan}
            disabled={isRecalculating}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            title="Recalculate Plan"
          >
            <RefreshCw className={`w-3 h-3 text-zincsoft ${isRecalculating ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="card-body space-y-4">
        <div>
          <div className="text-sm text-zincsoft mb-1">Primary Keyword</div>
          <div className="font-medium text-matrix">{cluster.primary_keyword}</div>
        </div>

        <div>
          <div className="text-sm text-zincsoft mb-2">Supporting Keywords</div>
          <div className="flex flex-wrap gap-1">
            {cluster.keywords.slice(0, 6).map((keyword, idx) => (
              <span key={idx} className="text-xs px-2 py-1 bg-white/5 rounded border border-white/10 text-zincsoft">
                {keyword}
              </span>
            ))}
            {cluster.keywords.length > 6 && (
              <span className="text-xs px-2 py-1 bg-white/5 rounded border border-white/10 text-zincsoft/60">
                +{cluster.keywords.length - 6} more
              </span>
            )}
          </div>
        </div>

        {planStats && (
          <div className="border-t border-white/5 pt-4">
            <div className="text-sm text-zincsoft mb-2">Plan Stats</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-zincsoft/80">DA Target:</span>
                <span className={`ml-2 font-medium ${getDifficultyColor(planStats.da_target)}`}>
                  {planStats.da_target}
                </span>
              </div>
              <div>
                <span className="text-zincsoft/80">Links:</span>
                <span className="ml-2 font-medium text-white">{planStats.links}</span>
              </div>
              <div>
                <span className="text-zincsoft/80">Articles:</span>
                <span className="ml-2 font-medium text-white">{planStats.articles}</span>
              </div>
              <div>
                <span className="text-zincsoft/80">ETA:</span>
                <span className="ml-2 font-medium text-matrix">{planStats.eta_weeks.toFixed(1)}w</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
