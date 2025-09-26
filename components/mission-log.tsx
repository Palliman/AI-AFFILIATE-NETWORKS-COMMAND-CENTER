"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

export interface LogEntry {
  id: string
  timestamp: string
  message: string
  type: "info" | "success" | "warning" | "error"
}

interface MissionLogProps {
  entries: LogEntry[]
  isLoading?: boolean
}

export function MissionLog({ entries, isLoading = false }: MissionLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [entries])

  const getTypeColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return "text-matrix"
      case "warning":
        return "text-yellow-400"
      case "error":
        return "text-ember"
      default:
        return "text-zincsoft"
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
    <Card className="card h-64">
      <CardHeader className="card-header">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-sm">Mission Log</CardTitle>
          {isLoading && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-matrix rounded-full animate-pulse" />
              <span className="text-xs text-zincsoft">Processing...</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="card-body p-0">
        <ScrollArea className="h-48 px-4" ref={scrollRef}>
          <div className="space-y-1 py-2 font-mono text-xs">
            {entries.length === 0 ? (
              <div className="text-zincsoft/60 italic">Mission log ready. Awaiting operations...</div>
            ) : (
              entries.map((entry) => (
                <div key={entry.id} className="flex gap-2">
                  <span className="text-zincsoft/60 shrink-0">[{formatTime(entry.timestamp)}]</span>
                  <span className={getTypeColor(entry.type)}>{entry.message}</span>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
