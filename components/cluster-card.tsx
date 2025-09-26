"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw } from "lucide-react"
import type { Cluster } from "@/lib/api"

interface ClusterCardProps {
  cluster: Cluster
  planStats?: {
    da_target: number
    links_needed: number
    articles_needed: number
    eta_weeks: number
  }
  onRecalculate?: () => void
  isRecalculating?: boolean
}

export function ClusterCard({ cluster, planStats, onRecalculate, isRecalculating = false }: ClusterCardProps) {
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
    if (daTarget <= 30) return "text-matrix" // Easy - green
    if (daTarget <= 50) return "text-yellow-400" // Medium - yellow
    return "text-ember" // Hard - red
  }

  return (
    <Card className="card">
      <CardHeader className="card-header flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <CardTitle className="text-white text-sm font-medium">{cluster.cluster}</CardTitle>
          <Badge className={`badge ${getIntentColor(cluster.intent)}`}>{cluster.intent}</Badge>
        </div>
        {onRecalculate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRecalculate}
            disabled={isRecalculating}
            className="h-8 w-8 p-0 hover:bg-white/10"
          >
            <RefreshCw className={`h-3 w-3 ${isRecalculating ? "animate-spin" : ""}`} />
          </Button>
        )}
      </CardHeader>

      <CardContent className="card-body space-y-4">
        {/* Primary Keyword */}
        <div>
          <p className="text-xs text-zincsoft/70 mb-1">Primary Keyword</p>
          <p className="text-sm font-medium text-white">{cluster.primary_keyword}</p>
        </div>

        {/* Supporting Keywords */}
        <div>
          <p className="text-xs text-zincsoft/70 mb-2">Supporting Keywords</p>
          <div className="flex flex-wrap gap-1">
            {cluster.keywords.slice(0, 6).map((keyword, index) => (
              <span key={index} className="text-xs px-2 py-1 bg-white/5 rounded border border-white/10 text-zincsoft">
                {keyword}
              </span>
            ))}
            {cluster.keywords.length > 6 && (
              <span className="text-xs px-2 py-1 text-zincsoft/60">+{cluster.keywords.length - 6} more</span>
            )}
          </div>
        </div>

        {/* Plan Stats */}
        {planStats && (
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
            <div className="text-center">
              <p className="text-xs text-zincsoft/70">DA Target</p>
              <p className={`text-lg font-bold ${getDifficultyColor(planStats.da_target)}`}>{planStats.da_target}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-zincsoft/70">Links</p>
              <p className="text-lg font-bold text-white">{planStats.links_needed}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-zincsoft/70">Articles</p>
              <p className="text-lg font-bold text-white">{planStats.articles_needed}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-zincsoft/70">ETA</p>
              <p className="text-lg font-bold text-white">{planStats.eta_weeks}w</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
