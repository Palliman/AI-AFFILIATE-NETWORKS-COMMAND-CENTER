"use client"

import { useState, useEffect } from "react"
import { getHealth } from "@/lib/api"

interface StatusIndicator {
  label: string
  status: boolean
  color: string
}

export default function StatusBar() {
  const [health, setHealth] = useState<{ status: string; env: string; version: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const healthData = await getHealth()
        setHealth(healthData)
      } catch (error) {
        console.error("Health check failed:", error)
        setHealth(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkHealth()
    const interval = setInterval(checkHealth, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const indicators: StatusIndicator[] = [
    {
      label: "API Keys",
      status: true, // Placeholder - wire to actual API key validation
      color: "text-matrix",
    },
    {
      label: "DB Connected",
      status: health?.status === "ok",
      color: "text-matrix",
    },
    {
      label: "Queue Status",
      status: true, // Placeholder - wire to actual queue status
      color: "text-matrix",
    },
  ]

  return (
    <div className="bg-panel border-b border-white/5 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${health?.status === "ok" ? "bg-matrix shadow-[0_0_8px_rgba(10,255,157,0.6)]" : "bg-ember shadow-[0_0_8px_rgba(255,77,46,0.6)]"} animate-pulse`}
            />
            <span className="text-sm text-zincsoft">
              {isLoading ? "Connecting..." : health ? `${health.env} v${health.version}` : "Offline"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {indicators.map((indicator) => (
              <div key={indicator.label} className="flex items-center gap-1.5">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${indicator.status ? "bg-matrix shadow-[0_0_4px_rgba(10,255,157,0.4)]" : "bg-ember/50"}`}
                />
                <span className="text-xs text-zincsoft/80">{indicator.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-zincsoft/60">
          API Base: {process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000"}
        </div>
      </div>
    </div>
  )
}
