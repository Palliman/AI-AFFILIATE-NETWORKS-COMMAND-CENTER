const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000"

export interface HealthResponse {
  status: string
  env: string
  version: string
}

export interface Project {
  id: number
  domain: string
  industry?: string
  created_at: string
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

export interface Plan {
  id: number
  project_id: number
  keyword: string
  domain: string
  da_target: number
  links_needed: number
  articles_needed: number
  eta_weeks: number
  created_at: string
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
      throw new ApiError(errorData.error || `HTTP ${response.status}`, response.status)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(`Network error: ${error instanceof Error ? error.message : "Unknown error"}`, 0)
  }
}

export const api = {
  // Health check
  async getHealth(): Promise<HealthResponse> {
    return fetchApi<HealthResponse>("/healthz")
  },

  // Projects
  async createProject(domain: string, industry?: string): Promise<Project> {
    return fetchApi<Project>("/projects", {
      method: "POST",
      body: JSON.stringify({ domain, industry }),
    })
  },

  async getProjects(): Promise<Project[]> {
    return fetchApi<Project[]>("/projects")
  },

  // Keywords
  async processKeywords(data: {
    project_id: number
    domain: string
    keywords: string[]
    options?: {
      num_competitors?: number
      avg_link_strength?: number
      kd_bucket?: number
      posts_per_week?: number
      links_per_month?: number
    }
  }): Promise<KeywordIntakeResponse> {
    return fetchApi<KeywordIntakeResponse>("/keywords/intake", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  // Plans
  async createPlan(project_id: number, keyword: string, domain: string): Promise<Plan> {
    return fetchApi<Plan>("/plans/auto", {
      method: "POST",
      body: JSON.stringify({ project_id, keyword, domain }),
    })
  },

  async getPlans(project_id?: number): Promise<Plan[]> {
    const query = project_id ? `?project_id=${project_id}` : ""
    return fetchApi<Plan[]>(`/plans${query}`)
  },
}
