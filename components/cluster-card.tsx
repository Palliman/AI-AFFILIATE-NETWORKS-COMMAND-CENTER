"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, TrendingUp } from "lucide-react"

interface ClusterCardProps {
  cluster: {
    id: string
    name: string
    keywords: string[]
    difficulty: number
    volume: number
    intent: string
    color: string
  }
  estimatedDays?: number
}

export default function ClusterCard({ cluster, estimatedDays = 14 }: ClusterCardProps) {
  const getDifficultyColor = (difficulty: number) => {
    if (difficulty > 70) return "text-ember border-ember/30"
    if (difficulty > 40) return "text-yellow-400 border-yellow-400/30"
    return "text-matrix border-matrix/30"
  }

  const getIntentColor = (intent: string) => {
    switch (intent.toLowerCase()) {
      case "commercial":
        return "text-matrix border-matrix/30"
      case "informational":
        return "text-blue-400 border-blue-400/30"
      case "navigational":
        return "text-purple-400 border-purple-400/30"
      default:
        return "text-zincsoft border-white/10"
    }
  }

  return (
    <Card className="bg-panel border-white/10 hover:border-white/20 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full shadow-lg"
              style={{
                backgroundColor: cluster.color,
                boxShadow: `0 0 8px ${cluster.color}40`,
              }}
            />
            <h4 className="font-semibold text-white">{cluster.name}</h4>
          </div>
          <Badge variant="outline" className="text-xs text-zincsoft border-white/10">
            {cluster.keywords.length} keywords
          </Badge>
        </div>

        <div className="space-y-3">
          {/* Metrics Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zincsoft">Difficulty</span>
                <Badge variant="outline" className={`text-xs ${getDifficultyColor(cluster.difficulty)}`}>
                  {cluster.difficulty}/100
                </Badge>
              </div>
              <Progress value={cluster.difficulty} className="h-1.5 bg-gunmetal" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zincsoft">Volume</span>
                <span className="text-xs text-white font-medium">{cluster.volume.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-matrix" />
                <span className="text-xs text-matrix">High potential</span>
              </div>
            </div>
          </div>

          {/* Intent & Timeline */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={`text-xs ${getIntentColor(cluster.intent)}`}>
              {cluster.intent}
            </Badge>

            <div className="flex items-center gap-1 text-xs text-zincsoft">
              <Clock className="w-3 h-3" />
              <span>~{estimatedDays}d</span>
            </div>
          </div>

          {/* Keywords Preview */}
          <div className="space-y-1">
            <div className="text-xs text-zincsoft">Top Keywords:</div>
            <div className="flex flex-wrap gap-1">
              {cluster.keywords.slice(0, 2).map((keyword, i) => (
                <Badge key={i} variant="secondary" className="text-xs bg-gunmetal text-zincsoft border-white/5">
                  {keyword}
                </Badge>
              ))}
              {cluster.keywords.length > 2 && (
                <Badge variant="secondary" className="text-xs bg-gunmetal text-zincsoft border-white/5">
                  +{cluster.keywords.length - 2}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
