"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  TrendingUp,
  Cpu,
  Bitcoin,
  Brain,
  Globe,
  DollarSign,
  LogOut,
} from "lucide-react"
import MatrixRain from "@/components/matrix-rain"
import LoginForm from "@/components/login-form"
import { useAuth } from "@/components/auth-provider"
import AffiliateFinder from "@/components/affiliate-finder"
import ArbitrageResearchLab from "@/components/arbitrage-research-lab"

// Types (can be moved to a separate types.ts file for better organization)
export interface NewsItem {
  // Export for use in API routes
  id: string
  title: string
  category: "ai" | "computing" | "crypto" | "general_tech"
  source: string
  url: string
  timestamp: string
}

export interface AffiliateOpportunityItem {
  // Export if needed elsewhere
  id: string
  programName: string
  category: string
  commission: string
  competition: "Low" | "Medium" | "High"
  url: string
  notes?: string
}

type TickerItem = NewsItem | AffiliateOpportunityItem

function NewsTicker({
  title,
  items: initialItems, // Renamed to initialItems, can be used for non-API tickers
  apiEndpoint, // New prop for API endpoint
  itemType,
  icon: TitleIcon,
}: {
  title: string
  initialItems?: TickerItem[]
  apiEndpoint?: string
  itemType: "news" | "affiliate"
  icon: React.ElementType
}) {
  const [items, setItems] = useState<TickerItem[]>(initialItems || [])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (apiEndpoint) {
      const fetchData = async () => {
        setIsLoading(true)
        setError(null)
        try {
          const response = await fetch(apiEndpoint)
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || `Failed to fetch ${title}`)
          }
          const data = await response.json()
          setItems(data)
        } catch (err: any) {
          console.error(`Error fetching ${title}:`, err)
          setError(err.message || `Could not load ${title}.`)
          setItems([]) // Clear items on error
        } finally {
          setIsLoading(false)
        }
      }
      fetchData()
    } else if (initialItems) {
      setItems(initialItems) // Use initialItems if no API endpoint
    }
  }, [apiEndpoint, title, initialItems]) // Add initialItems to dependency array

  // ... (rest of the NewsTicker component's rendering logic remains the same)
  // Make sure the rendering logic correctly handles the 'items' state
  // and displays loading/error states.

  const getCategoryIcon = (item: TickerItem) => {
    if (itemType === "news" && "category" in item) {
      const newsItem = item as NewsItem
      switch (newsItem.category) {
        case "ai":
          return <Brain className="w-4 h-4 text-purple-300" />
        case "computing":
          return <Cpu className="w-4 h-4 text-blue-300" />
        case "crypto":
          return <Bitcoin className="w-4 h-4 text-orange-300" />
        default:
          return <TrendingUp className="w-4 h-4 text-green-300" />
      }
    } else if (itemType === "affiliate" && "category" in item) {
      const affItem = item as AffiliateOpportunityItem
      switch (affItem.category.toLowerCase()) {
        case "software":
          return <Cpu className="w-4 h-4 text-sky-300" />
        case "finance":
          return <DollarSign className="w-4 h-4 text-emerald-300" />
        case "education":
          return <Brain className="w-4 h-4 text-amber-300" />
        default:
          return <ExternalLink className="w-4 h-4 text-pink-300" />
      }
    }
    return <TrendingUp className="w-4 h-4 text-green-300" />
  }

  const getCategoryColor = (item: TickerItem) => {
    if (itemType === "news" && "category" in item) {
      const newsItem = item as NewsItem
      switch (newsItem.category) {
        case "ai":
          return "bg-purple-500/50"
        case "computing":
          return "bg-blue-500/50"
        case "crypto":
          return "bg-orange-500/50"
        default:
          return "bg-gray-500/50"
      }
    } else if (itemType === "affiliate" && "category" in item) {
      const affItem = item as AffiliateOpportunityItem
      switch (affItem.category.toLowerCase()) {
        case "software":
          return "bg-sky-500/50"
        case "finance":
          return "bg-emerald-500/50"
        case "education":
          return "bg-amber-500/50"
        default:
          return "bg-pink-500/50"
      }
    }
    return "bg-gray-500/50"
  }

  const renderNewsItem = (item: NewsItem) => (
    <>
      <div className={`p-1 rounded-sm ${getCategoryColor(item)}`}>{getCategoryIcon(item)}</div>
      <span className="text-xs font-medium text-slate-100">{item.title}</span>
      <span className="text-xs text-slate-400">
        • {item.source} • {item.timestamp}
      </span>
      <a href={item.url} target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-400 hover:text-blue-300">
        <ExternalLink size={12} />
      </a>
    </>
  )

  const renderAffiliateItem = (item: AffiliateOpportunityItem) => (
    <>
      <div className={`p-1 rounded-sm ${getCategoryColor(item)}`}>{getCategoryIcon(item)}</div>
      <span className="text-xs font-semibold text-green-300">{item.programName}</span>
      <span className="text-xs text-slate-200">Comm: {item.commission}</span>
      <span
        className={`text-xs px-1.5 py-0.5 rounded-full ${
          item.competition === "Low"
            ? "bg-green-700/70 text-green-200"
            : item.competition === "Medium"
              ? "bg-yellow-700/70 text-yellow-200"
              : "bg-red-700/70 text-red-200"
        }`}
      >
        Comp: {item.competition}
      </span>
      {item.notes && <span className="text-xs text-slate-400 italic hidden md:inline">• {item.notes}</span>}
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="ml-2 text-blue-400 hover:text-blue-300 flex items-center gap-1"
      >
        Sign Up <ExternalLink size={12} />
      </a>
    </>
  )

  return (
    <div className="bg-black/60 backdrop-blur-sm text-slate-200 p-3 overflow-hidden border-b border-slate-700/50">
      <div className="flex items-center gap-2 mb-1.5">
        <TitleIcon className="w-5 h-5 text-green-400" />
        <span className="font-semibold text-green-400 text-sm uppercase">{title}</span>
      </div>
      <div className="relative overflow-hidden h-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-xs text-slate-400">Loading {title}...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-xs text-red-400">Error: {error}</span>
          </div>
        ) : items.length > 0 ? (
          <div className="animate-scroll flex gap-8 whitespace-nowrap items-center">
            {[...items, ...items].map(
              (
                item,
                index, // Duplicated for seamless scroll
              ) => (
                <div key={`${item.id}-${index}`} className="flex items-center gap-2 min-w-max">
                  {itemType === "news"
                    ? renderNewsItem(item as NewsItem)
                    : renderAffiliateItem(item as AffiliateOpportunityItem)}
                </div>
              ),
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-xs text-slate-400">
              No {itemType === "news" ? "news" : "opportunities"} found for {title}.
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

interface AffiliateEntry {
  id: string
  type: "blog" | "affiliate"
  domain: string
  description: string
  affiliatePages: string[]
  status: "active" | "pending" | "inactive"
  earnings?: string
}

interface Lead {
  id: string
  name: string
  number?: string
  location?: string
  site: string
  hasActiveSEO?: boolean
  seoPrice?: string
  dateAdded: string
  notes?: string
}

function AffiliateManager() {
  const [entries, setEntries] = useState<AffiliateEntry[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<AffiliateEntry | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    type: "blog" as "blog" | "affiliate",
    domain: "",
    description: "",
    affiliatePages: "",
    status: "active" as "active" | "pending" | "inactive",
    earnings: "",
  })

  // Load data from MongoDB
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const response = await fetch("/api/domains")
        if (response.ok) {
          const data = await response.json()
          setEntries(data)
        }
      } catch (error) {
        console.error("Error fetching domains:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDomains()
  }, [])

  const handleSubmit = async () => {
    const newEntryData: AffiliateEntry = {
      id: editingEntry?.id || `domain-${Date.now()}`,
      type: formData.type,
      domain: formData.domain,
      description: formData.description,
      affiliatePages: formData.affiliatePages.split("\n").filter((page) => page.trim()),
      status: formData.status,
      earnings: formData.earnings,
    }

    try {
      if (editingEntry) {
        // Update existing entry
        const response = await fetch("/api/domains", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newEntryData),
        })

        if (response.ok) {
          setEntries(entries.map((entry) => (entry.id === editingEntry.id ? newEntryData : entry)))
        }
      } else {
        // Create new entry
        const response = await fetch("/api/domains", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newEntryData),
        })

        if (response.ok) {
          setEntries([...entries, newEntryData])
        }
      }
    } catch (error) {
      console.error("Error saving domain:", error)
    }

    resetForm()
  }

  const resetForm = () => {
    setFormData({
      type: "blog",
      domain: "",
      description: "",
      affiliatePages: "",
      status: "active",
      earnings: "",
    })
    setEditingEntry(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (entry: AffiliateEntry) => {
    setEditingEntry(entry)
    setFormData({
      type: entry.type,
      domain: entry.domain,
      description: entry.description,
      affiliatePages: entry.affiliatePages.join("\n"),
      status: entry.status,
      earnings: entry.earnings || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/domains?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setEntries(entries.filter((entry) => entry.id !== id))
      }
    } catch (error) {
      console.error("Error deleting domain:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/70 border border-green-400/50"
      case "pending":
        return "bg-yellow-500/70 border border-yellow-400/50"
      case "inactive":
        return "bg-red-500/70 border border-red-400/50"
      default:
        return "bg-gray-500/70 border border-gray-400/50"
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-100">Domain & Affiliate Management</h2>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto"></div>
          <p className="text-slate-400 mt-2">Loading domains...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-100">Domain & Affiliate Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingEntry(null)
                resetForm()
                setIsDialogOpen(true)
              }}
              variant="outline"
              className="bg-slate-700/50 hover:bg-slate-600/50 border-slate-500/50 text-slate-100"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-slate-800/80 backdrop-blur-lg border-slate-700/70 text-slate-100">
            <DialogHeader>
              <DialogTitle className="text-slate-50">{editingEntry ? "Edit Entry" : "Add New Entry"}</DialogTitle>
              <DialogDescription className="text-slate-400">
                Add or edit your blog domains and affiliate sites.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="type" className="text-slate-300">
                  Type
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "blog" | "affiliate") => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger className="bg-slate-700/60 border-slate-600 text-slate-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                    <SelectItem value="blog" className="hover:bg-slate-700">
                      Blog Site
                    </SelectItem>
                    <SelectItem value="affiliate" className="hover:bg-slate-700">
                      Affiliate Site
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="domain" className="text-slate-300">
                  Domain
                </Label>
                <Input
                  id="domain"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  placeholder="example.com"
                  className="bg-slate-700/60 border-slate-600 text-slate-100 placeholder:text-slate-400"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-slate-300">
                  Description
                </Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description"
                  className="bg-slate-700/60 border-slate-600 text-slate-100 placeholder:text-slate-400"
                />
              </div>
              <div>
                <Label htmlFor="affiliatePages" className="text-slate-300">
                  Affiliate Pages (one per line)
                </Label>
                <Textarea
                  id="affiliatePages"
                  value={formData.affiliatePages}
                  onChange={(e) => setFormData({ ...formData, affiliatePages: e.target.value })}
                  placeholder="/affiliate/product1&#10;/affiliate/product2"
                  rows={3}
                  className="bg-slate-700/60 border-slate-600 text-slate-100 placeholder:text-slate-400"
                />
              </div>
              <div>
                <Label htmlFor="status" className="text-slate-300">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "active" | "pending" | "inactive") =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger className="bg-slate-700/60 border-slate-600 text-slate-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                    <SelectItem value="active" className="hover:bg-slate-700">
                      Active
                    </SelectItem>
                    <SelectItem value="pending" className="hover:bg-slate-700">
                      Pending
                    </SelectItem>
                    <SelectItem value="inactive" className="hover:bg-slate-700">
                      Inactive
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="earnings" className="text-slate-300">
                  Monthly Earnings (optional)
                </Label>
                <Input
                  id="earnings"
                  value={formData.earnings}
                  onChange={(e) => setFormData({ ...formData, earnings: e.target.value })}
                  placeholder="$1,000"
                  className="bg-slate-700/60 border-slate-600 text-slate-100 placeholder:text-slate-400"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={resetForm}
                className="text-slate-100 border-slate-500 hover:bg-slate-700/50 hover:text-slate-100 bg-transparent"
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 text-white">
                {editingEntry ? "Update" : "Add"} Entry
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {entries.map((entry) => (
          <Card key={entry.id} className="bg-slate-800/70 backdrop-blur-md border border-slate-700/60 text-slate-100">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {entry.type === "blog" ? (
                      <Globe className="w-4 h-4 text-blue-300" />
                    ) : (
                      <DollarSign className="w-4 h-4 text-green-300" />
                    )}
                    <CardTitle className="text-lg text-slate-50">{entry.domain}</CardTitle>
                  </div>
                  <Badge className={`${getStatusColor(entry.status)} text-white text-xs`}>{entry.status}</Badge>
                  <Badge variant="outline" className="border-slate-500 text-slate-300 text-xs">
                    {entry.type}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(entry)}
                    className="text-slate-300 border-slate-600 hover:bg-slate-700/50 hover:text-slate-100"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(entry.id)}
                    className="text-slate-300 border-slate-600 hover:bg-slate-700/50 hover:text-slate-100"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="text-slate-300 border-slate-600 hover:bg-slate-700/50 hover:text-slate-100 bg-transparent"
                  >
                    <a href={`https://${entry.domain}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                </div>
              </div>
              <CardDescription className="text-slate-400 pt-1">{entry.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {entry.earnings && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="font-medium text-slate-200">Monthly Earnings: {entry.earnings}</span>
                  </div>
                )}
                {entry.affiliatePages.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-slate-300">Affiliate Pages:</h4>
                    <div className="space-y-1">
                      {entry.affiliatePages.map((page, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-slate-400">
                          <span>•</span>
                          <a
                            href={`https://${entry.domain}${page.startsWith("/") ? "" : "/"}${page}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-green-400 hover:underline"
                          >
                            {page}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {entries.length === 0 && (
          <Card className="bg-slate-800/70 backdrop-blur-md border border-slate-700/60 text-slate-100">
            <CardContent className="text-center py-8">
              <Globe className="w-12 h-12 mx-auto text-slate-500 mb-4" />
              <p className="text-slate-400">No domains or affiliate sites added yet.</p>
              <p className="text-sm text-slate-500 mt-1">Click "Add Entry" to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function LeadManager() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    number: "",
    location: "",
    site: "",
    hasActiveSEO: false,
    seoPrice: "",
    notes: "",
  })

  // Load data from MongoDB
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await fetch("/api/leads")
        if (response.ok) {
          const data = await response.json()
          setLeads(data)
        }
      } catch (error) {
        console.error("Error fetching leads:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeads()
  }, [])

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.site.trim()) {
      return // Basic validation - name and site are required
    }

    const newLead: Lead = {
      id: editingLead?.id || `lead-${Date.now()}`,
      name: formData.name.trim(),
      number: formData.number.trim() || undefined,
      location: formData.location.trim() || undefined,
      site: formData.site.trim(),
      hasActiveSEO: formData.hasActiveSEO,
      seoPrice: formData.seoPrice.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      dateAdded: editingLead?.dateAdded || new Date().toLocaleDateString(),
    }

    try {
      if (editingLead) {
        // Update existing lead
        const response = await fetch("/api/leads", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newLead),
        })

        if (response.ok) {
          setLeads(leads.map((lead) => (lead.id === editingLead.id ? newLead : lead)))
        }
      } else {
        // Create new lead
        const response = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newLead),
        })

        if (response.ok) {
          setLeads([...leads, newLead])
        }
      }
    } catch (error) {
      console.error("Error saving lead:", error)
    }

    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: "",
      number: "",
      location: "",
      site: "",
      hasActiveSEO: false,
      seoPrice: "",
      notes: "",
    })
    setEditingLead(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead)
    setFormData({
      name: lead.name,
      number: lead.number || "",
      location: lead.location || "",
      site: lead.site,
      hasActiveSEO: lead.hasActiveSEO || false,
      seoPrice: lead.seoPrice || "",
      notes: lead.notes || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/leads?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setLeads(leads.filter((lead) => lead.id !== id))
      }
    } catch (error) {
      console.error("Error deleting lead:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Lead Management</h2>
            <p className="text-slate-400 text-sm mt-1">Track and manage your potential clients</p>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto"></div>
          <p className="text-slate-400 mt-2">Loading leads...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Lead Management</h2>
          <p className="text-slate-400 text-sm mt-1">Track and manage your potential clients</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingLead(null)
                resetForm()
                setIsDialogOpen(true)
              }}
              variant="outline"
              className="bg-slate-700/50 hover:bg-slate-600/50 border-slate-500/50 text-slate-100"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg bg-slate-800/80 backdrop-blur-lg border-slate-700/70 text-slate-100 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-slate-50">{editingLead ? "Edit Lead" : "Add New Lead"}</DialogTitle>
              <DialogDescription className="text-slate-400">
                Add or edit lead information. Name and site are required fields.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-slate-300">
                  Name <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Client or company name"
                  className="bg-slate-700/60 border-slate-600 text-slate-100 placeholder:text-slate-400"
                  required
                />
              </div>
              <div>
                <Label htmlFor="site" className="text-slate-300">
                  Website <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="site"
                  value={formData.site}
                  onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                  placeholder="example.com"
                  className="bg-slate-700/60 border-slate-600 text-slate-100 placeholder:text-slate-400"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="number" className="text-slate-300">
                    Phone Number
                  </Label>
                  <Input
                    id="number"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    className="bg-slate-700/60 border-slate-600 text-slate-100 placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <Label htmlFor="location" className="text-slate-300">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, State"
                    className="bg-slate-700/60 border-slate-600 text-slate-100 placeholder:text-slate-400"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hasActiveSEO"
                    checked={formData.hasActiveSEO}
                    onChange={(e) => setFormData({ ...formData, hasActiveSEO: e.target.checked })}
                    className="w-4 h-4 text-green-600 bg-slate-700 border-slate-600 rounded focus:ring-green-500"
                  />
                  <Label htmlFor="hasActiveSEO" className="text-slate-300">
                    Has Active SEO Services
                  </Label>
                </div>
                {formData.hasActiveSEO && (
                  <div>
                    <Label htmlFor="seoPrice" className="text-slate-300">
                      SEO Price/Budget
                    </Label>
                    <Input
                      id="seoPrice"
                      value={formData.seoPrice}
                      onChange={(e) => setFormData({ ...formData, seoPrice: e.target.value })}
                      placeholder="$500/month or $5000 budget"
                      className="bg-slate-700/60 border-slate-600 text-slate-100 placeholder:text-slate-400"
                    />
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="notes" className="text-slate-300">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes about this lead..."
                  rows={3}
                  className="bg-slate-700/60 border-slate-600 text-slate-100 placeholder:text-slate-400"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={resetForm}
                className="text-slate-100 border-slate-500 hover:bg-slate-700/50 hover:text-slate-100 bg-transparent"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={!formData.name.trim() || !formData.site.trim()}
              >
                {editingLead ? "Update" : "Add"} Lead
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 sm:gap-4">
        <Card className="bg-slate-800/70 backdrop-blur-md border border-slate-700/60">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs sm:text-sm">Total Leads</p>
                <p className="text-lg sm:text-2xl font-bold text-slate-100">{leads.length}</p>
              </div>
              <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/70 backdrop-blur-md border border-slate-700/60">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs sm:text-sm">With SEO</p>
                <p className="text-lg sm:text-2xl font-bold text-slate-100">
                  {leads.filter((lead) => lead.hasActiveSEO).length}
                </p>
              </div>
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/70 backdrop-blur-md border border-slate-700/60">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs sm:text-sm">Without SEO</p>
                <p className="text-lg sm:text-2xl font-bold text-slate-100">
                  {leads.filter((lead) => !lead.hasActiveSEO).length}
                </p>
              </div>
              <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/70 backdrop-blur-md border border-slate-700/60">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs sm:text-sm">This Month</p>
                <p className="text-lg sm:text-2xl font-bold text-slate-100">
                  {
                    leads.filter((lead) => {
                      const leadDate = new Date(lead.dateAdded)
                      const now = new Date()
                      return leadDate.getMonth() === now.getMonth() && leadDate.getFullYear() === now.getFullYear()
                    }).length
                  }
                </p>
              </div>
              <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leads List */}
      <div className="grid gap-4">
        {leads.map((lead) => (
          <Card key={lead.id} className="bg-slate-800/70 backdrop-blur-md border border-slate-700/60 text-slate-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3 sm:px-6 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-300 leading-tight">{lead.name}</CardTitle>
              <div className="flex gap-1 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(lead)}
                  className="text-slate-300 border-slate-600 hover:bg-slate-700/50 hover:text-slate-100 h-8 w-8 p-0"
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(lead.id)}
                  className="text-slate-300 border-slate-600 hover:bg-slate-700/50 hover:text-slate-100 h-8 w-8 p-0"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="text-slate-300 border-slate-600 hover:bg-slate-700/50 hover:text-slate-100 bg-transparent h-8 w-8 p-0"
                >
                  <a href={`https://${lead.site}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span className="text-slate-300">Website:</span>
                    <a
                      href={`https://${lead.site}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 hover:underline truncate"
                    >
                      {lead.site}
                    </a>
                  </div>
                  {lead.number && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300">Phone:</span>
                      <span className="text-slate-200">{lead.number}</span>
                    </div>
                  )}
                  {lead.location && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300">Location:</span>
                      <span className="text-slate-200">{lead.location}</span>
                    </div>
                  )}
                  {lead.seoPrice && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-slate-300">SEO Budget:</span>
                      <span className="text-green-300 font-medium">{lead.seoPrice}</span>
                    </div>
                  )}
                </div>
                {lead.notes && (
                  <div className="mt-3 p-3 bg-slate-700/50 rounded-md border border-slate-600/50">
                    <h4 className="font-medium text-sm mb-1 text-slate-300">Notes:</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">{lead.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {leads.length === 0 && (
          <Card className="bg-slate-800/70 backdrop-blur-md border border-slate-700/60 text-slate-100">
            <CardContent className="text-center py-12">
              <Brain className="w-12 h-12 mx-auto text-slate-500 mb-4" />
              <p className="text-slate-400">No leads added yet.</p>
              <p className="text-sm text-slate-500 mt-1">Click "Add Lead" to start tracking your potential clients.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function CommandCenter() {
  const [activeTab, setActiveTab] = useState("domains") // Default to domains tab
  const { logout } = useAuth()

  const endpoints = [
    { method: "GET", path: "/healthz", description: "System health check" },
    { method: "POST", path: "/projects", description: "Create new project" },
    { method: "POST", path: "/keywords/intake", description: "Process keyword clusters" },
    { method: "POST", path: "/plans/auto", description: "Generate SEO plan" },
    { method: "GET", path: "/plans", description: "List all plans" },
  ]

  return (
    <div className="min-h-screen relative text-slate-100">
      <MatrixRain />
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-slate-700/50 bg-slate-900/70 backdrop-blur-md sticky top-0 z-20">
          <div className="container mx-auto px-3 py-2 sm:px-4 sm:py-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-50">AI Affiliate Networks</h1>
                <p className="text-xs text-slate-400">Command Center</p>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Quick Links - Hidden on very small screens, shown as smaller on mobile */}
                <div className="hidden xs:flex items-center gap-2 sm:gap-4">
                  <a
                    href="https://x.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-300 hover:text-slate-100 transition-colors px-2 py-1 rounded hover:bg-slate-700/50"
                  >
                    X
                  </a>
                  <a
                    href="https://www.photopea.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-300 hover:text-slate-100 transition-colors px-2 py-1 rounded hover:bg-slate-700/50"
                  >
                    Photopea
                  </a>
                  <a
                    href="https://chat.openai.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-300 hover:text-slate-100 transition-colors px-2 py-1 rounded hover:bg-slate-700/50"
                  >
                    ChatGPT
                  </a>
                  <a
                    href="https://v0.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-300 hover:text-slate-100 transition-colors px-2 py-1 rounded hover:bg-slate-700/50"
                  >
                    v0
                  </a>
                  <a
                    href="https://vercel.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-300 hover:text-slate-100 transition-colors px-2 py-1 rounded hover:bg-slate-700/50"
                  >
                    Vercel
                  </a>
                  <a
                    href="https://open.spotify.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-300 hover:text-slate-100 transition-colors px-2 py-1 rounded hover:bg-slate-700/50"
                  >
                    Spotify
                  </a>
                </div>

                {/* Logout Button - Smaller on mobile */}
                <Button
                  onClick={logout}
                  variant="outline"
                  size="sm"
                  className="text-slate-300 border-slate-600 hover:bg-slate-700/50 hover:text-slate-100 bg-transparent text-xs px-2 py-1 h-8"
                >
                  <LogOut className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>

                {/* System Status - Smaller on mobile */}
                <Badge
                  variant="outline"
                  className="bg-green-500/20 text-green-300 border-green-400/50 text-xs px-2 py-1"
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                  <span className="hidden sm:inline">System Online</span>
                  <span className="sm:hidden">Online</span>
                </Badge>
              </div>
            </div>
          </div>
        </header>

        {/* News Tickers */}
        <div className="space-y-1">
          <NewsTicker
            title="Top Tech News"
            apiEndpoint="/api/news/tech" // Fetch from internal API
            itemType="news"
            icon={TrendingUp}
          />
          <NewsTicker
            title="Crypto News"
            apiEndpoint="/api/news/crypto" // Fetch from internal API
            itemType="news"
            icon={Bitcoin}
          />
          <AffiliateFinder />
        </div>

        {/* Main Content */}
        <main className="container mx-auto px-3 py-4 sm:px-4 sm:py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 bg-slate-800/70 backdrop-blur-sm border border-slate-700/60 h-auto">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-slate-700/80 data-[state=active]:text-slate-50 text-slate-300 text-xs sm:text-sm py-2 px-2"
              >
                <span className="sm:hidden">Overview</span>
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger
                value="domains"
                className="data-[state=active]:bg-slate-700/80 data-[state=active]:text-slate-50 text-slate-300 text-xs sm:text-sm py-2 px-2"
              >
                <span className="sm:hidden">Domains</span>
                <span className="hidden sm:inline">Domains & Affiliates</span>
              </TabsTrigger>
              <TabsTrigger
                value="leads"
                className="data-[state=active]:bg-slate-700/80 data-[state=active]:text-slate-50 text-slate-300 text-xs sm:text-sm py-2 px-2"
              >
                Leads
              </TabsTrigger>
              <TabsTrigger
                value="arbitrage"
                className="data-[state=active]:bg-slate-700/80 data-[state=active]:text-slate-50 text-slate-300 text-xs sm:text-sm py-2 px-2"
              >
                <span className="sm:hidden">Research</span>
                <span className="hidden sm:inline">Arbitrage Lab</span>
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-slate-700/80 data-[state=active]:text-slate-50 text-slate-300 text-xs sm:text-sm py-2 px-2"
              >
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 sm:gap-6">
                {[
                  { title: "Total Domains", value: "0", change: "Connected to MongoDB", icon: Globe },
                  { title: "Active Affiliates", value: "0", change: "Connected to MongoDB", icon: DollarSign },
                  { title: "Monthly Revenue", value: "$0", change: "Awaiting data", icon: TrendingUp },
                  { title: "Conversion Rate", value: "0%", change: "Awaiting data", icon: Brain },
                ].map((item) => (
                  <Card key={item.title} className="bg-slate-800/70 backdrop-blur-md border border-slate-700/60">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3 sm:px-6 sm:pt-6">
                      <CardTitle className="text-xs sm:text-sm font-medium text-slate-300 leading-tight">
                        {item.title}
                      </CardTitle>
                      <item.icon className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400 flex-shrink-0" />
                    </CardHeader>
                    <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
                      <div className="text-lg sm:text-2xl font-bold text-slate-50">{item.value}</div>
                      <p className="text-xs text-slate-400 leading-tight">{item.change}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-slate-800/70 backdrop-blur-md border border-slate-700/60">
                <CardHeader>
                  <CardTitle className="text-slate-100">Quick Actions</CardTitle>
                  <CardDescription className="text-slate-400">
                    Manage your affiliate network efficiently
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
                  <Button
                    variant="outline"
                    className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 bg-slate-700/50 hover:bg-slate-600/50 border-slate-500/50 text-slate-100 text-xs sm:text-sm"
                  >
                    <Plus className="w-4 h-4 sm:w-6 sm:h-6" /> Add New Domain
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 bg-slate-700/50 hover:bg-slate-600/50 border-slate-500/50 text-slate-100 text-xs sm:text-sm"
                  >
                    <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6" /> View Analytics
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 bg-slate-700/50 hover:bg-slate-600/50 border-slate-500/50 text-slate-100 text-xs sm:text-sm sm:col-span-2 lg:col-span-1"
                  >
                    <DollarSign className="w-4 h-4 sm:w-6 sm:h-6" /> Track Earnings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="domains">
              <AffiliateManager />
            </TabsContent>

            <TabsContent value="leads">
              <LeadManager />
            </TabsContent>

            <TabsContent value="arbitrage">
              <ArbitrageResearchLab />
            </TabsContent>

            <TabsContent value="analytics">
              <Card className="bg-slate-800/70 backdrop-blur-md border border-slate-700/60">
                <CardHeader>
                  <CardTitle className="text-slate-100">Analytics Dashboard</CardTitle>
                  <CardDescription className="text-slate-400">
                    Detailed performance metrics and insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <TrendingUp className="w-12 h-12 mx-auto text-slate-500 mb-4" />
                    <p className="text-slate-400">Analytics dashboard coming soon...</p>
                    <p className="text-sm text-slate-500 mt-1">
                      Integration with Google Analytics and affiliate tracking systems
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

export default function Page() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginForm />
  }

  return <CommandCenter />
}
