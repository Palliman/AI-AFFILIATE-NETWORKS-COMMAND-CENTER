// TypeScript interfaces for MongoDB documents
export interface AffiliateEntry {
  _id?: string
  id: string
  type: "blog" | "affiliate"
  domain: string
  description: string
  affiliatePages: string[]
  status: "active" | "pending" | "inactive"
  earnings?: string
  createdAt: string
  updatedAt: string
}

export interface Lead {
  _id?: string
  id: string
  name: string
  number?: string
  location?: string
  site: string
  hasActiveSEO?: boolean
  seoPrice?: string
  dateAdded: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface ResearchResult {
  _id?: string
  id: string
  country: string
  niche: string
  keywords: KeywordData[]
  opportunityScore: number
  competitionScore: number
  volumeScore: number
  cpcRpmScore: number
  saturationScore: number
  localizationPenalty: number
  totalScore: number
  status: "pending" | "running" | "completed" | "failed"
  createdAt: string
  updatedAt: string
}

export interface KeywordData {
  keyword: string
  volume: number
  competition: number
  cpc: number
  difficulty: number
  cluster?: string
}

export interface Job {
  _id?: string
  id: string
  type: "research" | "plan" | "content"
  status: "queued" | "running" | "completed" | "failed"
  progress: number
  result?: any
  error?: string
  title: string
  createdAt: string
  updatedAt: string
}
