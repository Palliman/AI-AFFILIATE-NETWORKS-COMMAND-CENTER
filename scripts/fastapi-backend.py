from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from datetime import datetime
import json

app = FastAPI(title="RankForge Engine API", version="0.3")

# CORS middleware for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class ProjectCreate(BaseModel):
    domain: str
    industry: Optional[str] = None

class Project(BaseModel):
    id: int
    domain: str
    industry: Optional[str] = None
    created_at: str

class KeywordIntakeOptions(BaseModel):
    num_competitors: int = 10
    avg_link_strength: float = 0.25
    kd_bucket: int = 40
    posts_per_week: int = 3
    links_per_month: int = 6

class KeywordIntakeRequest(BaseModel):
    project_id: int
    domain: str
    keywords: List[str]
    options: KeywordIntakeOptions

class Cluster(BaseModel):
    cluster: str
    intent: str  # "informational", "commercial", "transactional"
    keywords: List[str]
    primary_keyword: str

class KeywordIntakeResponse(BaseModel):
    project_id: int
    domain: str
    clusters: List[Cluster]
    plans_created: int
    details: Dict[str, int]

class PlanCreate(BaseModel):
    project_id: int
    keyword: str
    domain: str

class Plan(BaseModel):
    id: int
    project_id: int
    da_target: int
    links: int
    articles: int
    eta_weeks: float
    created_at: str

# In-memory storage (replace with actual database)
projects_db: List[Project] = []
plans_db: List[Plan] = []
project_counter = 1
plan_counter = 1

# Health check endpoint
@app.get("/healthz")
async def health_check():
    return {
        "status": "ok",
        "env": os.getenv("ENV", "development"),
        "version": "0.3"
    }

# Projects endpoints
@app.post("/projects", response_model=Project)
async def create_project(project: ProjectCreate):
    global project_counter
    new_project = Project(
        id=project_counter,
        domain=project.domain,
        industry=project.industry,
        created_at=datetime.now().isoformat()
    )
    projects_db.append(new_project)
    project_counter += 1
    return new_project

@app.get("/projects", response_model=List[Project])
async def get_projects():
    return projects_db

# Keywords intake endpoint
@app.post("/keywords/intake", response_model=KeywordIntakeResponse)
async def keyword_intake(request: KeywordIntakeRequest):
    # Mock clustering logic - replace with actual clustering algorithm
    import random
    
    # Group keywords into clusters (simplified)
    clusters = []
    cluster_names = ["running-shoes", "marathon-training", "fitness-gear", "workout-plans"]
    
    # Split keywords into groups
    keywords_per_cluster = len(request.keywords) // min(4, len(request.keywords))
    if keywords_per_cluster == 0:
        keywords_per_cluster = 1
    
    for i in range(0, len(request.keywords), keywords_per_cluster):
        chunk = request.keywords[i:i + keywords_per_cluster]
        if not chunk:
            continue
            
        cluster_name = cluster_names[len(clusters) % len(cluster_names)]
        intent = random.choice(["informational", "commercial", "transactional"])
        
        cluster = Cluster(
            cluster=cluster_name,
            intent=intent,
            keywords=chunk,
            primary_keyword=chunk[0]
        )
        clusters.append(cluster)
    
    # Auto-create plans for each cluster
    plans_created = 0
    details = {}
    
    for cluster in clusters:
        plan = await create_auto_plan_internal(
            request.project_id, 
            cluster.primary_keyword, 
            request.domain
        )
        plans_created += 1
        details[cluster.cluster] = plan.id
    
    return KeywordIntakeResponse(
        project_id=request.project_id,
        domain=request.domain,
        clusters=clusters,
        plans_created=plans_created,
        details=details
    )

# Plans endpoints
async def create_auto_plan_internal(project_id: int, keyword: str, domain: str) -> Plan:
    global plan_counter
    import random
    
    # Mock plan generation - replace with actual algorithm
    plan = Plan(
        id=plan_counter,
        project_id=project_id,
        da_target=random.randint(30, 80),
        links=random.randint(10, 50),
        articles=random.randint(5, 20),
        eta_weeks=round(random.uniform(4.0, 12.0), 1),
        created_at=datetime.now().isoformat()
    )
    
    plans_db.append(plan)
    plan_counter += 1
    return plan

@app.post("/plans/auto", response_model=Plan)
async def create_auto_plan(request: PlanCreate):
    return await create_auto_plan_internal(
        request.project_id, 
        request.keyword, 
        request.domain
    )

@app.get("/plans", response_model=List[Plan])
async def get_plans(project_id: Optional[int] = None):
    if project_id:
        return [plan for plan in plans_db if plan.project_id == project_id]
    return plans_db

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
