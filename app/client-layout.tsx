"use client"

import type React from "react"
import { Inter } from "next/font/google"
import StatusBar from "@/components/status-bar"
import Link from "next/link"
import { usePathname } from "next/navigation"

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

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="matrix-bg min-h-screen">
      {/* Header */}
      <header className="bg-panel border-b border-white/5 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold text-white">
              AI Affiliate Networks — <span className="text-matrix">RankForge Engine v0.3</span>
            </h1>
            <Navigation />
          </div>
        </div>
      </header>

      {/* Status Bar */}
      <StatusBar />

      {/* Main Content */}
      <main className="p-6">{children}</main>
    </div>
  )
}
