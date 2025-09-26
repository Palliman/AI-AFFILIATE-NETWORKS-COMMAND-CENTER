from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import random
import string
from datetime import datetime
import os

app = FastAPI(title="RankForge API", version="0.3.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage (replace with real database)
projects_db = []
plans_db = []
next_project_id = 1
next_plan_id = 1

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
    num_competitors: Optional[int] = 10
    avg_link_strength: Optional[float] = 0.25
    kd_bucket: Optional[int] = 40
    posts_per_week: Optional[int] = 3
    links_per_month: Optional[int] = 6

class KeywordIntakeRequest(BaseModel):
    project_id: int
    domain: str
    keywords: List[str]
    options: Optional[KeywordIntakeOptions] = None

class Cluster(BaseModel):
    cluster: str
    intent: str
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
    keyword: str
    domain: str
    da_target: int
    links_needed: int
    articles_needed: int
    eta_weeks: float
    created_at: str

# Helper functions
def generate_clusters(keywords: List[str]) -> List[Cluster]:
    """Generate mock clusters from keywords"""
    clusters = []
    
    # Group keywords into semantic clusters (mock logic)
    cluster_groups = {}
    for keyword in keywords:
        # Simple clustering based on first word
        first_word = keyword.split()[0].lower()
        if first_word not in cluster_groups:
            cluster_groups[first_word] = []
        cluster_groups[first_word].append(keyword)
    
    # Create cluster objects
    intents = ['informational', 'commercial', 'transactional']
    for cluster_name, cluster_keywords in cluster_groups.items():
        if len(cluster_keywords) >= 2:  # Only create clusters with multiple keywords
            clusters.append(Cluster(
                cluster=cluster_name.replace('-', ' ').title(),
                intent=random.choice(intents),
                keywords=cluster_keywords,
                primary_keyword=cluster_keywords[0]
            ))
    
    return clusters

def generate_plan(keyword: str, domain: str) -> Dict[str, Any]:
    """Generate mock SEO plan"""
    return {
        'da_target': random.randint(20, 80),
        'links_needed': random.randint(5, 25),
        'articles_needed': random.randint(3, 12),
        'eta_weeks': round(random.uniform(4.0, 16.0), 1)
    }

# Routes
@app.get("/healthz")
async def health_check():
    return {
        "status": "healthy",
        "env": os.getenv("ENV", "development"),
        "version": "0.3.0"
    }

@app.post("/projects", response_model=Project)
async def create_project(project: ProjectCreate):
    global next_project_id
    
    new_project = Project(
        id=next_project_id,
        domain=project.domain,
        industry=project.industry,
        created_at=datetime.now().isoformat()
    )
    
    projects_db.append(new_project.dict())
    next_project_id += 1
    
    return new_project

@app.get("/projects", response_model=List[Project])
async def get_projects():
    return [Project(**project) for project in projects_db]

@app.post("/keywords/intake", response_model=KeywordIntakeResponse)
async def process_keywords(request: KeywordIntakeRequest):
    global next_plan_id
    
    # Validate project exists
    project_exists = any(p['id'] == request.project_id for p in projects_db)
    if not project_exists:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Generate clusters
    clusters = generate_clusters(request.keywords)
    
    # Create plans for each cluster
    plans_created = 0
    details = {}
    
    for cluster in clusters:
        plan_data = generate_plan(cluster.primary_keyword, request.domain)
        
        new_plan = Plan(
            id=next_plan_id,
            project_id=request.project_id,
            keyword=cluster.primary_keyword,
            domain=request.domain,
            da_target=plan_data['da_target'],
            links_needed=plan_data['links_needed'],
            articles_needed=plan_data['articles_needed'],
            eta_weeks=plan_data['eta_weeks'],
            created_at=datetime.now().isoformat()
        )
        
        plans_db.append(new_plan.dict())
        details[cluster.cluster] = next_plan_id
        next_plan_id += 1
        plans_created += 1
    
    return KeywordIntakeResponse(
        project_id=request.project_id,
        domain=request.domain,
        clusters=clusters,
        plans_created=plans_created,
        details=details
    )

@app.post("/plans/auto", response_model=Plan)
async def create_plan(request: PlanCreate):
    global next_plan_id
    
    # Validate project exists
    project_exists = any(p['id'] == request.project_id for p in projects_db)
    if not project_exists:
        raise HTTPException(status_code=404, detail="Project not found")
    
    plan_data = generate_plan(request.keyword, request.domain)
    
    new_plan = Plan(
        id=next_plan_id,
        project_id=request.project_id,
        keyword=request.keyword,
        domain=request.domain,
        da_target=plan_data['da_target'],
        links_needed=plan_data['links_needed'],
        articles_needed=plan_data['articles_needed'],
        eta_weeks=plan_data['eta_weeks'],
        created_at=datetime.now().isoformat()
    )
    
    plans_db.append(new_plan.dict())
    next_plan_id += 1
    
    return new_plan

@app.get("/plans", response_model=List[Plan])
async def get_plans(project_id: Optional[int] = None):
    filtered_plans = plans_db
    
    if project_id is not None:
        filtered_plans = [p for p in plans_db if p['project_id'] == project_id]
    
    return [Plan(**plan) for plan in filtered_plans]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
