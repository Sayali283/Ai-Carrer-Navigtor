from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Profile, ResumeReview
from app.schemas import ResumeReviewOut
from app.services.gemini_client import AIServiceLayer
from app.api.deps import get_current_user

router = APIRouter(prefix="/resume-review", tags=["Resume Reviewer"])

@router.post("/analyze", response_model=ResumeReviewOut)
def analyze_resume(
    target_career: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """FR-REV-1 to FR-REV-3: Resume audit, weak point identification, metric-driven bullet rewrites, ATS keywords."""
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile or (not profile.raw_resume_text and not profile.skills and not profile.projects):
        raise HTTPException(
            status_code=400,
            detail="Please upload a resume or add skills/projects to your profile first before requesting an audit."
        )

    # Use raw resume text if available, or reconstruct from profile
    resume_content = profile.raw_resume_text
    if not resume_content:
        skills_str = ", ".join([s.name for s in profile.skills])
        projects_str = "; ".join([f"{p.title}: {p.description}" for p in profile.projects])
        experiences_str = "; ".join([f"{x.title} at {x.company}: {x.description}" for x in profile.experiences])
        resume_content = f"Candidate Profile:\nSkills: {skills_str}\nExperience: {experiences_str}\nProjects: {projects_str}"

    career = target_career or profile.target_career or "Full Stack AI Engineer"
    review_data = AIServiceLayer.review_resume(resume_content, career)

    review = ResumeReview(
        user_id=current_user.id,
        overall_score=review_data.get("overall_score", 75),
        summary=review_data.get("summary", "Review complete."),
        weak_sections=review_data.get("weak_sections", []),
        suggestions=review_data.get("suggestions", []),
        bullet_rewrites=review_data.get("bullet_rewrites", []),
        ats_keywords_recommended=review_data.get("ats_keywords_recommended", []),
        ats_keywords_missing=review_data.get("ats_keywords_missing", [])
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    return review

@router.get("/latest", response_model=Optional[ResumeReviewOut])
def get_latest_review(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return (
        db.query(ResumeReview)
        .filter(ResumeReview.user_id == current_user.id)
        .order_by(ResumeReview.created_at.desc())
        .first()
    )
