"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, DollarSign, TrendingUp } from "lucide-react"

interface AffiliateOpportunity {
  program: string
  commission: string
  category: string
  description: string
  pros: string[]
  cons: string[]
  difficulty: "Easy" | "Medium" | "Hard"
  potential: "Low" | "Medium" | "High"
}

export default function AffiliateFinder() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<AffiliateOpportunity[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSearch = async () => {
    if (!query.trim()) return

    setIsLoading(true)
    setError("")
    setResults([])

    try {
      const response = await fetch("/api/affiliate-finder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setResults(data.opportunities || [])
      }
    } catch (err) {
      console.error("Affiliate finder error:", err)
      setError("Failed to find affiliate opportunities. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "Medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "Hard":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getPotentialColor = (potential: string) => {
    switch (potential) {
      case "High":
        return "bg-matrix/20 text-matrix border-matrix/30"
      case "Medium":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "Low":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  return (
    <Card className="bg-panel border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <DollarSign className="w-5 h-5 text-matrix" />
          AI Affiliate Finder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter niche, product, or keyword..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="bg-gunmetal border-white/10 text-white placeholder:text-zincsoft"
          />
          <Button
            onClick={handleSearch}
            disabled={isLoading || !query.trim()}
            className="bg-matrix hover:bg-matrix/80 text-black"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-ember/20 border border-ember/30 rounded-md">
            <p className="text-ember text-sm">{error}</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Found {results.length} Affiliate Opportunities</h3>

            {results.map((opportunity, index) => (
              <Card key={index} className="bg-gunmetal border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-white mb-1">{opportunity.program}</h4>
                      <p className="text-sm text-zincsoft mb-2">{opportunity.description}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-matrix border-matrix/30">
                          {opportunity.commission}
                        </Badge>
                        <Badge variant="outline" className="text-blue-400 border-blue-400/30">
                          {opportunity.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className={getDifficultyColor(opportunity.difficulty)}>{opportunity.difficulty}</Badge>
                      <Badge className={getPotentialColor(opportunity.potential)}>
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {opportunity.potential}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-matrix mb-2">Pros:</h5>
                      <ul className="text-xs text-zincsoft space-y-1">
                        {opportunity.pros.map((pro, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-matrix mt-0.5">+</span>
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-ember mb-2">Cons:</h5>
                      <ul className="text-xs text-zincsoft space-y-1">
                        {opportunity.cons.map((con, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-ember mt-0.5">-</span>
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
