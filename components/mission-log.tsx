"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Terminal, Activity, CheckCircle, AlertCircle } from "lucide-react"

interface LogEntry {
  id: string
  timestamp: string
  level: "info" | "success" | "warning" | "error"
  message: string
  source: string
}

export default function MissionLog() {
  const [logs, setLogs] = useState<LogEntry[]>([])

  useEffect(() => {
    // Initialize with some sample logs
    const initialLogs: LogEntry[] = [
      {
        id: "1",
        timestamp: new Date().toISOString(),
        level: "info",
        message: "RankForge Engine v0.3 initialized",
        source: "SYSTEM",
      },
      {
        id: "2",
        timestamp: new Date(Date.now() - 30000).toISOString(),
        level: "success",
        message: "API connection established",
        source: "API",
      },
      {
        id: "3",
        timestamp: new Date(Date.now() - 60000).toISOString(),
        level: "info",
        message: "Database connection verified",
        source: "DB",
      },
    ]
    setLogs(initialLogs)

    // Simulate real-time log updates
    const interval = setInterval(() => {
      const messages = [
        "Keyword analysis job queued",
        "Processing cluster data",
        "SEO metrics updated",
        "Domain authority check completed",
        "Competition analysis running",
        "Traffic estimation calculated",
        "Content gap analysis finished",
      ]

      const sources = ["KEYWORD", "CLUSTER", "SEO", "DOMAIN", "COMP", "TRAFFIC", "CONTENT"]
      const levels: ("info" | "success" | "warning")[] = ["info", "success", "info", "success", "info"]

      const newLog: LogEntry = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        level: levels[Math.floor(Math.random() * levels.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
        source: sources[Math.floor(Math.random() * sources.length)],
      }

      setLogs((prev) => [newLog, ...prev.slice(0, 49)]) // Keep last 50 logs
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "success":
        return <CheckCircle className="w-3 h-3 text-matrix" />
      case "warning":
        return <AlertCircle className="w-3 h-3 text-yellow-400" />
      case "error":
        return <AlertCircle className="w-3 h-3 text-ember" />
      default:
        return <Activity className="w-3 h-3 text-blue-400" />
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "success":
        return "text-matrix"
      case "warning":
        return "text-yellow-400"
      case "error":
        return "text-ember"
      default:
        return "text-blue-400"
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  return (
    <Card className="bg-panel border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-white">
          <Terminal className="w-5 h-5 text-matrix" />
          Mission Log
          <Badge variant="outline" className="text-xs text-matrix border-matrix/30 ml-auto">
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-80">
          <div className="space-y-1 p-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 py-2 px-3 rounded-md hover:bg-gunmetal/50 transition-colors font-mono text-sm"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {getLevelIcon(log.level)}
                  <span className="text-zincsoft text-xs">{formatTime(log.timestamp)}</span>
                  <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 border-white/10 text-zincsoft">
                    {log.source}
                  </Badge>
                  <span className={`${getLevelColor(log.level)} flex-1 min-w-0`}>{log.message}</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
