"use client"

import { useState, useEffect } from "react"
import { Terminal, Activity } from "lucide-react"

interface LogEntry {
  id: string
  timestamp: string
  message: string
  type: "info" | "success" | "error" | "warning"
}

interface MissionLogProps {
  isActive?: boolean
}

export default function MissionLog({ isActive = false }: MissionLogProps) {
  const [logs, setLogs] = useState<LogEntry[]>([])

  const addLog = (message: string, type: LogEntry["type"] = "info") => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
      message,
      type,
    }
    setLogs((prev) => [newLog, ...prev].slice(0, 50)) // Keep last 50 logs
  }

  // Expose addLog function globally for other components to use
  useEffect(() => {
    ;(window as any).addMissionLog = addLog
    return () => {
      delete (window as any).addMissionLog
    }
  }, [])

  const getTypeColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return "text-matrix"
      case "error":
        return "text-ember"
      case "warning":
        return "text-yellow-400"
      default:
        return "text-zincsoft"
    }
  }

  const getTypeIcon = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return "✓"
      case "error":
        return "✗"
      case "warning":
        return "⚠"
      default:
        return "•"
    }
  }

  return (
    <div className="card">
      <div className="card-header flex items-center gap-2">
        <Terminal className="w-4 h-4 text-matrix" />
        <span>Mission Log</span>
        {isActive && (
          <div className="flex items-center gap-1 ml-auto">
            <Activity className="w-3 h-3 text-matrix animate-pulse" />
            <span className="text-xs text-matrix">Active</span>
          </div>
        )}
      </div>

      <div className="card-body">
        <div className="h-64 overflow-y-auto space-y-1 font-mono text-xs">
          {logs.length === 0 ? (
            <div className="text-zincsoft/60 text-center py-8">Mission log ready...</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex items-start gap-2">
                <span className="text-zincsoft/60 shrink-0">[{log.timestamp}]</span>
                <span className={`shrink-0 ${getTypeColor(log.type)}`}>{getTypeIcon(log.type)}</span>
                <span className={getTypeColor(log.type)}>{log.message}</span>
              </div>
            ))
          )}
        </div>

        {isActive && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-full bg-panelAlt rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-matrix animate-pulse" style={{ width: "60%" }} />
              </div>
              <span className="text-xs text-zincsoft shrink-0">Processing...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
