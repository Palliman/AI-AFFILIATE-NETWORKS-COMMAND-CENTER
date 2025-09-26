export interface Domain {
  id: string
  url: string
  da: number
  traffic: number
  niche: string
  status: "active" | "inactive" | "pending"
  lastChecked: string
  createdAt: string
}

export interface Lead {
  id: string
  email: string
  name?: string
  source: string
  status: "new" | "contacted" | "qualified" | "converted"
  createdAt: string
  notes?: string
}

export interface ResearchResult {
  id: string
  query: string
  results: {
    domains: Domain[]
    keywords: string[]
    competition: number
    opportunity: number
  }
  createdAt: string
}

export interface Project {
  id: string
  name: string
  description?: string
  status: "active" | "paused" | "completed"
  domains: string[]
  keywords: string[]
  targetDa: number
  createdAt: string
  updatedAt: string
}

export interface Plan {
  id: string
  name: string
  description?: string
  keywords: string[]
  targetDa: number
  status: "draft" | "active" | "paused" | "completed"
  progress: number
  estimatedCompletion?: string
  createdAt: string
  updatedAt: string
  metrics: {
    totalKeywords: number
    difficulty: number
    estimatedTraffic: number
    budget: number
  }
}
