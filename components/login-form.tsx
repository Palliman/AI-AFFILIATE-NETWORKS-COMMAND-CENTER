"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { useAuth } from "./auth-provider"

// Animated Globe Component
const AnimatedGlobe: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let rotation = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resize()
    window.addEventListener("resize", resize)

    // Globe data points
    const points = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.1,
      speed: Math.random() * 0.02 + 0.005,
    }))

    // Connection lines
    const connections = Array.from({ length: 50 }, () => ({
      start: Math.floor(Math.random() * points.length),
      end: Math.floor(Math.random() * points.length),
      opacity: Math.random() * 0.3 + 0.1,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw connections
      ctx.strokeStyle = "#2AF06E"
      connections.forEach((conn) => {
        const startPoint = points[conn.start]
        const endPoint = points[conn.end]
        const distance = Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2))

        if (distance < 200) {
          ctx.globalAlpha = conn.opacity * (1 - distance / 200)
          ctx.lineWidth = 0.5
          ctx.beginPath()
          ctx.moveTo(startPoint.x, startPoint.y)
          ctx.lineTo(endPoint.x, endPoint.y)
          ctx.stroke()
        }
      })

      // Draw points
      ctx.fillStyle = "#2AF06E"
      points.forEach((point) => {
        ctx.globalAlpha = point.opacity
        ctx.beginPath()
        ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2)
        ctx.fill()

        // Animate points
        point.x += Math.sin(rotation + point.y * 0.01) * point.speed
        point.y += Math.cos(rotation + point.x * 0.01) * point.speed

        // Wrap around screen
        if (point.x < 0) point.x = canvas.width
        if (point.x > canvas.width) point.x = 0
        if (point.y < 0) point.y = canvas.height
        if (point.y > canvas.height) point.y = 0
      })

      // Draw scanlines
      ctx.globalAlpha = 0.03
      ctx.strokeStyle = "#2AF06E"
      ctx.lineWidth = 1
      for (let i = 0; i < canvas.height; i += 4) {
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(canvas.width, i)
        ctx.stroke()
      }

      rotation += 0.005
      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ filter: "blur(0.5px)" }} />
}

// Code Rain Component
const CodeRain: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resize()
    window.addEventListener("resize", resize)

    const characters =
      "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const charArray = characters.split("")

    const columns = Math.floor(canvas.width / 20)
    const drops: number[] = []

    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * canvas.height
    }

    const draw = () => {
      ctx.fillStyle = "rgba(7, 9, 11, 0.05)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = "#2AF06E"
      ctx.font = "15px monospace"
      ctx.globalAlpha = 0.1

      for (let i = 0; i < drops.length; i++) {
        const text = charArray[Math.floor(Math.random() * charArray.length)]
        ctx.fillText(text, i * 20, drops[i] * 20)

        if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i]++
      }

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-20" />
}

// Telemetry Panel Component
const TelemetryPanel: React.FC<{ side: "left" | "right" }> = ({ side }) => {
  const [metrics, setMetrics] = useState({
    nodes: 42,
    crawlers: 318,
    uptime: 99.7,
    throughput: 1247,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        nodes: prev.nodes + Math.floor(Math.random() * 3) - 1,
        crawlers: prev.crawlers + Math.floor(Math.random() * 10) - 5,
        uptime: Math.min(99.9, prev.uptime + (Math.random() - 0.5) * 0.1),
        throughput: prev.throughput + Math.floor(Math.random() * 100) - 50,
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className={`fixed top-0 ${side}-0 h-full w-64 bg-gradient-to-b from-[#0C2E1A]/20 to-transparent backdrop-blur-sm border-${side === "left" ? "r" : "l"} border-white/5 p-6 opacity-10 hover:opacity-30 transition-opacity duration-500 hidden xl:block`}
    >
      <div className="space-y-6 mt-20">
        <div className="text-[#2AF06E] text-xs font-mono">
          <div className="mb-2">SYSTEM TELEMETRY</div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[#CBD5E1]">Nodes:</span>
              <span>{metrics.nodes}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#CBD5E1]">Crawlers:</span>
              <span>{metrics.crawlers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#CBD5E1]">Uptime:</span>
              <span>{metrics.uptime.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#CBD5E1]">Throughput:</span>
              <span>{metrics.throughput}</span>
            </div>
          </div>
        </div>

        {/* Fake Chart */}
        <div className="h-20 bg-gradient-to-r from-[#2AF06E]/20 to-transparent rounded border border-[#2AF06E]/20">
          <div className="h-full flex items-end justify-around p-2">
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={i}
                className="w-2 bg-[#2AF06E]/40 rounded-t"
                style={{ height: `${Math.random() * 80 + 20}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CommandCenterLogin() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { login, initAuth } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const success = await login(username, password)
    if (!success) {
      setError("Invalid credentials")
    }
    setIsLoading(false)
  }

  const handleQuickLogin = async () => {
    setIsLoading(true)
    await initAuth()
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center matrix-bg">
      <Card className="w-full max-w-md bg-panel border-white/10">
        <CardHeader>
          <CardTitle className="text-center text-white">
            AI Affiliate Networks
            <div className="text-sm text-matrix font-normal mt-1">RankForge Engine v0.3</div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-gunmetal border-white/10 text-white placeholder:text-zincsoft"
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gunmetal border-white/10 text-white placeholder:text-zincsoft"
                required
              />
            </div>
            {error && <div className="text-ember text-sm text-center">{error}</div>}
            <Button type="submit" className="w-full bg-matrix hover:bg-matrix/80 text-black" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Login"}
            </Button>
          </form>

          <div className="text-center">
            <div className="text-xs text-zincsoft mb-2">Development Mode</div>
            <Button
              onClick={handleQuickLogin}
              variant="outline"
              className="w-full border-white/10 text-zincsoft hover:text-white bg-transparent"
              disabled={isLoading}
            >
              Quick Login (admin/admin)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
