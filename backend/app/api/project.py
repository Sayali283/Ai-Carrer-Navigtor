from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Profile, PortfolioProjectIdea
from app.schemas import ProjectGenerateRequest, PortfolioProjectOut
from app.services.gemini_client import AIServiceLayer
from app.api.deps import get_current_user

router = APIRouter(prefix="/projects", tags=["Portfolio Project Generator"])

@router.post("/generate", response_model=List[PortfolioProjectOut])
def generate_portfolio_projects(
    req: ProjectGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """FR-PRJ-1, FR-PRJ-2: Generate portfolio projects with stages, dataset needs, and resume bullets."""
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    target_career = req.target_career or (profile.target_career if profile else None) or "Full Stack AI Engineer"
    current_skills = [s.name for s in profile.skills] if profile else []
    missing_skills = ["Vector Databases", "Docker", "Redis", "Distributed Caching"]

    ai_projects = AIServiceLayer.generate_portfolio_projects(
        target_career=target_career,
        current_skills=current_skills,
        missing_skills=missing_skills,
        difficulty=req.difficulty or "Intermediate",
        interest_domain=req.interest_domain
    )

    saved_items = []
    for p in ai_projects:
        item = PortfolioProjectIdea(
            user_id=current_user.id,
            target_career=target_career,
            title=p.get("title", "Portfolio Project"),
            difficulty=p.get("difficulty", req.difficulty or "Intermediate"),
            problem_statement=p.get("problem_statement", ""),
            technologies=p.get("technologies", []),
            features=p.get("features", []),
            development_stages=p.get("development_stages", []),
            dataset_requirements=p.get("dataset_requirements"),
            expected_outcome=p.get("expected_outcome"),
            skills_demonstrated=p.get("skills_demonstrated", []),
            resume_bullet_suggestions=p.get("resume_bullet_suggestions", [])
        )
        db.add(item)
        saved_items.append(item)

    db.commit()
    for item in saved_items:
        db.refresh(item)

    return saved_items

@router.get("/list", response_model=List[PortfolioProjectOut])
def get_saved_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return (
        db.query(PortfolioProjectIdea)
        .filter(PortfolioProjectIdea.user_id == current_user.id)
        .order_by(PortfolioProjectIdea.created_at.desc())
        .all()
    )
