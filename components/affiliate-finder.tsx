"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ExternalLink, DollarSign } from "lucide-react"

interface AffiliateOpportunityItem {
  id: string
  programName: string
  category: string
  commission: string
  competition: "Low" | "Medium" | "High"
  url: string
  notes?: string
}

const AffiliateFinder: React.FC = () => {
  const [prompt, setPrompt] = useState("")
  const [opportunities, setOpportunities] = useState<AffiliateOpportunityItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/affiliate-finder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to find affiliate opportunities")
      }

      const data = await response.json()
      setOpportunities(data)
    } catch (err: any) {
      console.error("Error finding affiliate opportunities:", err)
      setError(err.message || "Could not find affiliate opportunities.")
      setOpportunities([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-black/60 backdrop-blur-sm text-slate-200 p-3 sm:p-4 border-b border-slate-700/50 space-y-3">
      <div className="flex items-center gap-2 mb-1.5">
        <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
        <span className="font-semibold text-green-400 text-xs sm:text-sm uppercase">Affiliate Opportunity Finder</span>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <Input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter niche or keywords (e.g., 'eco-friendly pet products')"
          className="bg-slate-700/60 border-slate-600 text-slate-100 placeholder:text-slate-400 flex-grow text-sm"
          disabled={isLoading}
        />
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 whitespace-nowrap"
        >
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </form>

      {error && <p className="text-red-400 text-sm">Error: {error}</p>}

      {opportunities.length > 0 && (
        <div className="space-y-2 max-h-80 sm:max-h-96 overflow-y-auto pr-2">
          {opportunities.map((op) => (
            <div key={op.id} className="p-3 bg-slate-700/50 rounded-md border border-slate-600/50 text-xs sm:text-sm">
              <h4 className="font-semibold text-sm text-green-300 mb-1">{op.programName}</h4>
              <div className="space-y-1">
                <p className="text-slate-300">
                  <span className="font-medium">Category:</span> {op.category}
                </p>
                {op.commission && (
                  <p className="text-slate-300">
                    <span className="font-medium">Commission:</span> {op.commission}
                  </p>
                )}
                <p className="text-slate-300 flex items-center gap-2">
                  <span className="font-medium">Competition:</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-xs ${
                      op.competition === "Low"
                        ? "bg-green-700/70 text-green-200"
                        : op.competition === "Medium"
                          ? "bg-yellow-700/70 text-yellow-200"
                          : op.competition === "High"
                            ? "bg-red-700/70 text-red-200"
                            : "bg-gray-600/70 text-gray-200"
                    }`}
                  >
                    {op.competition}
                  </span>
                </p>
                <p className="text-slate-300 mt-1">
                  <span className="font-medium">Notes:</span> {op.notes}
                </p>
                <a
                  href={
                    op.url.startsWith("http") ? op.url : `https://www.google.com/search?q=${encodeURIComponent(op.url)}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline mt-1 inline-flex items-center gap-1 text-sm"
                >
                  {op.url.startsWith("http") ? "Visit Sign-up" : "Search for Program"}
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
      {isLoading && opportunities.length === 0 && (
        <p className="text-slate-400 text-center text-sm">Searching for opportunities...</p>
      )}
      {!isLoading && !error && opportunities.length === 0 && prompt && (
        <p className="text-slate-400 text-center text-sm">
          No opportunities found for your query. Try being more specific or broader.
        </p>
      )}
    </div>
  )
}

export default AffiliateFinder
