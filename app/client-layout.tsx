"use client"

import type React from "react"
import { Inter } from "next/font/google"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"

const inter = Inter({ subsets: ["latin"] })

function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Dashboard" },
    { href: "/projects", label: "Projects" },
    { href: "/intake", label: "Keyword Intake" },
    { href: "/plans", label: "Plans" },
  ]

  return (
    <nav className="flex items-center gap-6">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`text-sm transition-colors ${
            pathname === item.href ? "text-matrix font-medium" : "text-zincsoft hover:text-white"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}

function StatusIndicators() {
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
    <div className="flex items-center gap-4">
      {/* System Status */}
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${isOnline ? "bg-matrix animate-pulse shadow-[0_0_8px_rgba(10,255,157,0.6)]" : "bg-ember shadow-[0_0_8px_rgba(255,77,46,0.6)]"}`}
        />
        <span className="text-xs text-zincsoft">{isOnline ? "API Online" : "API Offline"}</span>
      </div>

      {/* API Keys Status */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-matrix animate-pulse shadow-[0_0_4px_rgba(10,255,157,0.4)]" />
        <span className="text-xs text-zincsoft">API Keys</span>
      </div>

      {/* DB Status */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-matrix animate-pulse shadow-[0_0_4px_rgba(10,255,157,0.4)]" />
        <span className="text-xs text-zincsoft">DB Connected</span>
      </div>

      {/* Queue Status */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-matrix animate-pulse shadow-[0_0_4px_rgba(10,255,157,0.4)]" />
        <span className="text-xs text-zincsoft">Queue Active</span>
      </div>

      {health && (
        <Badge variant="outline" className="text-xs text-zincsoft border-white/10 ml-2">
          {health.env} • v{health.version}
        </Badge>
      )}
    </div>
  )
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated } = useAuth()

  return (
    <div className="matrix-bg min-h-screen">
      {/* Single Header with Navigation and Status */}
      <header className="bg-panel border-b border-white/5 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold text-white">
              AI Affiliate Networks — <span className="text-matrix">RankForge Engine v0.3</span>
            </h1>
            <Navigation />
          </div>

          {/* Status Indicators on the Right */}
          {isAuthenticated && <StatusIndicators />}
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">{children}</main>
    </div>
  )
}
