"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { User, Lock, Eye, EyeOff, Shield, Globe, Activity, Zap, Clock } from "lucide-react"
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
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [cardVisible, setCardVisible] = useState(false)
  const [shake, setShake] = useState(false)
  const { login } = useAuth()

  useEffect(() => {
    // Card entrance animation
    setTimeout(() => setCardVisible(true), 100)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simulate loading delay
    await new Promise((resolve) => setTimeout(resolve, 1200))

    const success = login(username, password)
    if (!success) {
      setError("Invalid credentials. Check the hint if you're stuck!")
      setPassword("")
      setIsLoading(false)
      setShake(true)
      setTimeout(() => setShake(false), 500)
    } else {
      setIsSuccess(true)
      setTimeout(() => {
        setIsLoading(false)
      }, 1000)
    }
  }

  return (
    <div className="min-h-screen relative bg-[#07090B] flex items-center justify-center p-4 overflow-hidden font-['Inter']">
      {/* Background Layers */}
      <div id="bg-globe" className="absolute inset-0 z-0">
        <AnimatedGlobe />
      </div>

      <div id="bg-rain" className="absolute inset-0 z-10">
        <CodeRain />
      </div>

      <div
        id="bg-fog"
        className="absolute inset-0 z-20 backdrop-blur-xl"
        style={{
          background: `
            radial-gradient(circle at 50% 50%, rgba(42, 240, 110, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 20% 80%, rgba(12, 46, 26, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(12, 46, 26, 0.1) 0%, transparent 50%),
            linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, transparent 100%)
          `,
        }}
      />

      {/* Telemetry Panels */}
      <TelemetryPanel side="left" />
      <TelemetryPanel side="right" />

      {/* Main Login Card */}
      <div className="relative z-30 w-full max-w-sm sm:max-w-md">
        <Card
          className={`
            backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl
            shadow-[0_0_80px_-30px_#2AF06E] transition-all duration-1000 ease-out
            ${cardVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
            ${shake ? "animate-pulse" : ""}
            hover:shadow-[0_0_100px_-20px_#2AF06E] hover:-translate-y-1
          `}
          style={{
            boxShadow: "0 0 80px -30px #2AF06E, inset 0 1px 0 rgba(255, 255, 255, 0.1)",
          }}
        >
          <CardHeader className="text-center space-y-4 px-6 pt-8 sm:px-8">
            {/* Security Badge */}
            <div className="flex justify-center">
              <Badge
                className="bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30 px-3 py-1 text-xs font-medium tracking-tight animate-pulse"
                variant="outline"
              >
                <Shield className="w-3 h-3 mr-2" />🔒 Secure Login Required
              </Badge>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <CardTitle className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                AI Affiliate Networks
              </CardTitle>
              <CardDescription className="text-[#CBD5E1] text-base tracking-tight">
                Command Center Access
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-6 pb-8 sm:px-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-[#CBD5E1] text-sm font-medium">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#CBD5E1]/60" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="
                      pl-10 h-12 bg-white/5 border-white/20 text-white placeholder:text-[#CBD5E1]/50
                      focus:border-[#2AF06E] focus:ring-2 focus:ring-[#2AF06E]/60 focus:shadow-[0_0_20px_-5px_#2AF06E]
                      transition-all duration-200
                    "
                    required
                    disabled={isLoading}
                    aria-invalid={error ? "true" : "false"}
                    aria-describedby={error ? "error-message" : undefined}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#CBD5E1] text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#CBD5E1]/60" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="
                      pl-10 pr-10 h-12 bg-white/5 border-white/20 text-white placeholder:text-[#CBD5E1]/50
                      focus:border-[#2AF06E] focus:ring-2 focus:ring-[#2AF06E]/60 focus:shadow-[0_0_20px_-5px_#2AF06E]
                      transition-all duration-200
                    "
                    required
                    disabled={isLoading}
                    aria-invalid={error ? "true" : "false"}
                    aria-describedby={error ? "error-message" : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#CBD5E1]/60 hover:text-[#CBD5E1] transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div
                  id="error-message"
                  className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-400/50 rounded-lg"
                  role="alert"
                >
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                  <span className="text-red-300 text-sm">{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="
                  w-full h-12 bg-[#2AF06E] hover:bg-[#22d763] text-black font-semibold text-base
                  transition-all duration-200 active:scale-[0.98]
                  hover:shadow-[0_0_30px_-5px_#2AF06E] hover:animate-pulse
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
                disabled={isLoading}
              >
                {isLoading ? (
                  isSuccess ? (
                    <>
                      <Zap className="w-4 h-4 mr-2 animate-spin" />
                      Granting Access...
                    </>
                  ) : (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Authenticating...
                    </>
                  )
                ) : (
                  "Access Command Center"
                )}
              </Button>
            </form>

            {/* Hint */}
            <div className="mt-6 text-center">
              <p className="text-[#CBD5E1]/60 text-xs tracking-tight">Not ironman</p>
            </div>

            {/* Status Ticker */}
            <div className="mt-6 p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center justify-center space-x-4 text-xs text-[#CBD5E1]/80 font-mono">
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Node mesh synced
                </span>
                <span className="hidden sm:flex items-center">
                  <Globe className="w-3 h-3 mr-1" />
                  42 regions online
                </span>
                <span className="flex items-center">
                  <Activity className="w-3 h-3 mr-1" />
                  318 active crawlers
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
