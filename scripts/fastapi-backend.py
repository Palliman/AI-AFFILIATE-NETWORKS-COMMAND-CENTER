from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import json
import time
from datetime import datetime, timedelta
import random

app = FastAPI(title="RankForge API", version="0.3.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class Project(BaseModel):
    id: Optional[str] = None
    name: str
    description: Optional[str] = None
    status: str = "active"
    domains: List[str] = []
    keywords: List[str] = []
    targetDa: int = 50
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

class Plan(BaseModel):
    id: Optional[str] = None
    name: str
    description: Optional[str] = None
    keywords: List[str]
    targetDa: int = 50
    status: str = "draft"
    progress: int = 0
    estimatedCompletion: Optional[str] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None
    metrics: Optional[Dict[str, Any]] = None

# In-memory storage (replace with real database)
projects_db = []
plans_db = []

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "env": "development",
        "version": "0.3.0",
        "timestamp": datetime.now().isoformat()
    }

# Projects endpoints
@app.get("/projects")
async def get_projects():
    return {"projects": projects_db}

@app.post("/projects")
async def create_project(project: Project):
    project.id = f"proj-{int(time.time())}"
    project.createdAt = datetime.now().isoformat()
    project.updatedAt = datetime.now().isoformat()
    
    projects_db.append(project.dict())
    return {"success": True, "project": project.dict()}

@app.get("/projects/{project_id}")
async def get_project(project_id: str):
    project = next((p for p in projects_db if p["id"] == project_id), None)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"project": project}

# Plans endpoints
@app.get("/plans")
async def get_plans():
    return {"plans": plans_db}

@app.post("/plans")
async def create_plan(plan: Plan):
    plan.id = f"plan-{int(time.time())}"
    plan.createdAt = datetime.now().isoformat()
    plan.updatedAt = datetime.now().isoformat()
    
    if not plan.metrics:
        plan.metrics = {
            "totalKeywords": len(plan.keywords),
            "difficulty": random.randint(30, 80),
            "estimatedTraffic": random.randint(10000, 200000),
            "budget": random.randint(1000, 10000)
        }
    
    plans_db.append(plan.dict())
    return {"success": True, "plan": plan.dict()}

@app.get("/plans/{plan_id}")
async def get_plan(plan_id: str):
    plan = next((p for p in plans_db if p["id"] == plan_id), None)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return {"plan": plan}

# Keyword clustering endpoint
@app.post("/keywords/cluster")
async def cluster_keywords(data: Dict[str, Any]):
    keywords = data.get("keywords", [])
    if not keywords:
        raise HTTPException(status_code=400, detail="Keywords required")
    
    # Simulate processing time
    time.sleep(2)
    
    # Mock clustering
    clusters = []
    chunk_size = max(1, len(keywords) // 3)
    
    for i in range(0, len(keywords), chunk_size):
        chunk = keywords[i:i + chunk_size]
        if chunk:
            cluster = {
                "id": f"cluster-{i // chunk_size + 1}",
                "name": f"Cluster {i // chunk_size + 1}",
                "keywords": chunk,
                "difficulty": random.randint(20, 80),
                "volume": random.randint(1000, 50000),
                "intent": random.choice(["Commercial", "Informational", "Navigational"]),
                "color": random.choice(["#0aff9d", "#ff4d2e", "#ffd700", "#00bfff"])
            }
            clusters.append(cluster)
    
    return {
        "success": True,
        "clusters": clusters,
        "totalKeywords": len(keywords),
        "processingTime": "2.1s"
    }

# SEO plan generation
@app.post("/plans/generate")
async def generate_seo_plan(data: Dict[str, Any]):
    keywords = data.get("keywords", [])
    clusters = data.get("clusters", 1)
    target_da = data.get("targetDa", 50)
    
    if not keywords:
        raise HTTPException(status_code=400, detail="Keywords required")
    
    # Simulate processing
    time.sleep(3)
    
    plan = {
        "id": f"auto-plan-{int(time.time())}",
        "name": f"Auto SEO Plan - {clusters} Clusters",
        "description": f"Generated plan for {len(keywords)} keywords",
        "keywords": keywords,
        "targetDa": target_da,
        "status": "active",
        "progress": 0,
        "estimatedCompletion": (datetime.now() + timedelta(days=45)).isoformat(),
        "createdAt": datetime.now().isoformat(),
        "metrics": {
            "totalKeywords": len(keywords),
            "clusters": clusters,
            "difficulty": random.randint(40, 70),
            "estimatedTraffic": random.randint(25000, 175000),
            "budget": random.randint(2000, 10000),
            "timeline": "6-8 weeks"
        },
        "roadmap": [
            {
                "phase": "Content Strategy",
                "duration": "2 weeks",
                "tasks": [
                    "Keyword mapping and content gaps analysis",
                    "Competitor content audit",
                    "Content calendar creation"
                ]
            },
            {
                "phase": "Content Creation",
                "duration": "4 weeks",
                "tasks": [
                    "High-priority content creation",
                    "On-page SEO optimization",
                    "Internal linking strategy"
                ]
            },
            {
                "phase": "Link Building",
                "duration": "2 weeks",
                "tasks": [
                    "Domain authority building",
                    "Guest posting campaigns",
                    "Performance monitoring"
                ]
            }
        ]
    }
    
    plans_db.append(plan)
    return {"success": True, "plan": plan}

if __name__ == "__main__":
    print("🚀 Starting RankForge API Server...")
    print("📊 Environment: Development")
    print("🔗 API Base: http://127.0.0.1:8000")
    print("📖 Docs: http://127.0.0.1:8000/docs")
    
    uvicorn.run(
        "fastapi-backend:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )
