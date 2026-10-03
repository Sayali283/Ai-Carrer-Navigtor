from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Profile, JobMatch
from app.schemas import JobMatchRequest, JobMatchOut
from app.services.gemini_client import AIServiceLayer
from app.api.deps import get_current_user
from app.api.career import profile_to_dict

router = APIRouter(prefix="/jobs", tags=["Job Description Matcher"])

SAMPLE_JD = """Title: Full Stack Engineer (Python / Next.js)
Company: CloudScale AI Labs
Location: San Francisco, CA / Remote

About the Role:
We are looking for a motivated Full Stack Engineer to join our high-growth platform team. You will build customer-facing web interfaces, design scalable backend APIs, and integrate machine learning pipelines.

Required Qualifications:
- Proficiency in Python, FastAPI, or Django
- Hands-on experience with modern JavaScript/TypeScript, React, and Next.js
- Solid understanding of SQL databases (PostgreSQL preferred) and database normalization
- Familiarity with Docker containerization and Git workflows
- Strong problem-solving skills and computer science fundamentals

Preferred Qualifications:
- Experience with Redis distributed caching and Celery
- Experience with cloud providers like AWS or GCP
- Understanding of LLMs, vector search, or LangChain
- Past internship or demonstrable personal projects deployed to production
"""

@router.post("/match", response_model=JobMatchOut)
def match_job(
    req: JobMatchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """FR-JOB-1 to FR-JOB-5: Paste JD, extract requirements, calculate match score, and generate prep plan."""
    if not req.job_description.strip():
        raise HTTPException(status_code=400, detail="Job description text cannot be empty.")

    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    p_dict = profile_to_dict(profile)
    res = AIServiceLayer.match_job_description(req.job_description, p_dict)

    job_title = req.job_title or res.get("job_title", "Software Engineer")
    company = req.company or res.get("company", "Target Company")

    job_match = JobMatch(
        user_id=current_user.id,
        job_title=job_title,
        company=company,
        original_jd=req.job_description,
        match_score=res.get("match_score", 70),
        extracted_required_skills=res.get("extracted_required_skills", []),
        extracted_preferred_skills=res.get("extracted_preferred_skills", []),
        matching_skills=res.get("matching_skills", []),
        missing_skills=res.get("missing_skills", []),
        match_strengths=res.get("match_strengths", []),
        responsibilities_summary=res.get("responsibilities_summary", "Core engineering responsibilities."),
        preparation_plan=res.get("preparation_plan", [])
    )
    db.add(job_match)
    db.commit()
    db.refresh(job_match)

    return job_match

@router.get("/history", response_model=List[JobMatchOut])
def get_job_match_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return (
        db.query(JobMatch)
        .filter(JobMatch.user_id == current_user.id)
        .order_by(JobMatch.created_at.desc())
        .all()
    )

@router.get("/sample")
def get_sample_jd():
    """Provides instant sample JD for quick evaluation."""
    return {"sample_jd": SAMPLE_JD}
