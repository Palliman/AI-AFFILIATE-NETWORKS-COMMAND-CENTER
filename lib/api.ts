const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000"

class APIError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
    this.name = "APIError"
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
    throw new APIError(errorData.error || `HTTP ${response.status}`, response.status)
  }

  return response.json()
}

// Health check
export async function getHealth() {
  return apiRequest<{ status: string; env: string; version: string }>("/healthz")
}

// Projects
export interface Project {
  id: number
  domain: string
  industry?: string
  created_at: string
}

export async function createProject(data: { domain: string; industry?: string }) {
  return apiRequest<Project>("/projects", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function getProjects() {
  return apiRequest<Project[]>("/projects")
}

// Keywords & Intake
export interface KeywordIntakeRequest {
  project_id: number
  domain: string
  keywords: string[]
  options: {
    num_competitors: number
    avg_link_strength: number
    kd_bucket: number
    posts_per_week: number
    links_per_month: number
  }
}

export interface Cluster {
  cluster: string
  intent: "informational" | "commercial" | "transactional"
  keywords: string[]
  primary_keyword: string
}

export interface KeywordIntakeResponse {
  project_id: number
  domain: string
  clusters: Cluster[]
  plans_created: number
  details: Record<string, number>
}

export async function runKeywordIntake(data: KeywordIntakeRequest) {
  return apiRequest<KeywordIntakeResponse>("/keywords/intake", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

// Plans
export interface Plan {
  id: number
  project_id: number
  da_target: number
  links: number
  articles: number
  eta_weeks: number
  created_at: string
}

export async function createAutoPlan(data: { project_id: number; keyword: string; domain: string }) {
  return apiRequest<Plan>("/plans/auto", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function getPlans(projectId?: number) {
  const query = projectId ? `?project_id=${projectId}` : ""
  return apiRequest<Plan[]>(`/plans${query}`)
}
