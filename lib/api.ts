const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000"

export const api = {
  async getHealth() {
    const response = await fetch(`${API_BASE}/health`)
    if (!response.ok) {
      throw new Error("Health check failed")
    }
    return response.json()
  },

  async getProjects() {
    const response = await fetch(`${API_BASE}/projects`)
    if (!response.ok) {
      throw new Error("Failed to fetch projects")
    }
    return response.json()
  },

  async createProject(data: any) {
    const response = await fetch(`${API_BASE}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error("Failed to create project")
    }
    return response.json()
  },

  async getPlans() {
    const response = await fetch(`${API_BASE}/plans`)
    if (!response.ok) {
      throw new Error("Failed to fetch plans")
    }
    return response.json()
  },

  async createPlan(data: any) {
    const response = await fetch(`${API_BASE}/plans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error("Failed to create plan")
    }
    return response.json()
  },
}
