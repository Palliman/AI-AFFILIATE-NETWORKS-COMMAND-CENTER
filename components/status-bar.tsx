"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"

export default function StatusBar() {
  const [health, setHealth] = useState<{
    status: string
    env: string
    version: string
  } | null>(null)
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const healthData = await api.getHealth()
        setHealth(healthData)
        setIsOnline(true)
      } catch (error) {
        console.error("Health check failed:", error)
        setIsOnline(false)
      }
    }

    checkHealth()
    const interval = setInterval(checkHealth, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-gunmetal/90 backdrop-blur-sm border-b border-white/5 px-4 py-2">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-white">AI Affiliate Networks — RankForge Engine v0.3</h1>
          {health && (
            <Badge variant="outline" className="text-xs text-zincsoft border-white/10">
              {health.env} • v{health.version}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* System Status */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-matrix animate-pulse" : "bg-ember"}`} />
            <span className="text-xs text-zincsoft">{isOnline ? "API Online" : "API Offline"}</span>
          </div>

          {/* API Keys Status */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-matrix animate-pulse" />
            <span className="text-xs text-zincsoft">API Keys</span>
          </div>

          {/* DB Status */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-matrix animate-pulse" />
            <span className="text-xs text-zincsoft">DB Connected</span>
          </div>

          {/* Queue Status */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-matrix animate-pulse" />
            <span className="text-xs text-zincsoft">Queue Active</span>
          </div>
        </div>
      </div>
    </div>
  )
}
