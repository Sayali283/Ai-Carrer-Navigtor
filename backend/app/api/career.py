from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Profile, CareerRecommendation
from app.schemas import CareerRecommendationOut, SetTargetCareerRequest
from app.services.gemini_client import AIServiceLayer
from app.api.deps import get_current_user

router = APIRouter(prefix="/career", tags=["Career Recommendations"])

def profile_to_dict(profile: Profile) -> dict:
    return {
        "target_career": profile.target_career,
        "current_skill_level": profile.current_skill_level,
        "career_interests": profile.career_interests or [],
        "skills": [{"name": s.name, "category": s.category, "proficiency": s.proficiency} for s in profile.skills],
        "educations": [{"institution": e.institution, "degree": e.degree, "branch_or_field": e.branch_or_field} for e in profile.educations],
        "experiences": [{"title": x.title, "company": x.company, "role_type": x.role_type} for x in profile.experiences],
        "projects": [{"title": p.title, "technologies": p.technologies} for p in profile.projects],
        "certifications": [{"name": c.name, "issuer": c.issuer} for c in profile.certifications],
    }

@router.get("/recommendations", response_model=List[CareerRecommendationOut])
def get_career_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """FR-CAR-1 to FR-CAR-6: Retrieve or generate dynamic career recommendations."""
    # Check if user already has saved recommendations
    existing = db.query(CareerRecommendation).filter(CareerRecommendation.user_id == current_user.id).all()
    if existing:
        return existing

    # If none exist yet, generate them dynamically from profile
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    p_dict = profile_to_dict(profile)
    ai_recs = AIServiceLayer.recommend_careers(p_dict)

    saved_recs = []
    for r in ai_recs:
        is_target = bool(profile.target_career and profile.target_career.lower() == r.get("career_name", "").lower())
        rec = CareerRecommendation(
            user_id=current_user.id,
            career_name=r.get("career_name", "Software Engineer"),
            match_score=r.get("match_score", 75),
            reasoning=r.get("reasoning", "Strong alignment with profile skills."),
            technical_skills_score=r.get("technical_skills_score", 75),
            project_relevance_score=r.get("project_relevance_score", 75),
            education_score=r.get("education_score", 75),
            experience_score=r.get("experience_score", 75),
            salary_range=r.get("salary_range", "$90,000 - $130,000 / yr"),
            growth_outlook=r.get("growth_outlook", "High (+25%)"),
            relevant_skills=r.get("relevant_skills", []),
            missing_skills=r.get("missing_skills", []),
            recommended_actions=r.get("recommended_actions", []),
            is_target=is_target
        )
        db.add(rec)
        saved_recs.append(rec)

    db.commit()
    return saved_recs

@router.post("/regenerate", response_model=List[CareerRecommendationOut])
def regenerate_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """FR-CAR-8: Regenerate recommendations when profile is updated."""
    # Remove old recommendations
    db.query(CareerRecommendation).filter(CareerRecommendation.user_id == current_user.id).delete()
    db.commit()

    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    p_dict = profile_to_dict(profile)
    ai_recs = AIServiceLayer.recommend_careers(p_dict)

    saved_recs = []
    for r in ai_recs:
        is_target = bool(profile.target_career and profile.target_career.lower() == r.get("career_name", "").lower())
        rec = CareerRecommendation(
            user_id=current_user.id,
            career_name=r.get("career_name", "Software Engineer"),
            match_score=r.get("match_score", 75),
            reasoning=r.get("reasoning", "Strong alignment with profile skills."),
            technical_skills_score=r.get("technical_skills_score", 75),
            project_relevance_score=r.get("project_relevance_score", 75),
            education_score=r.get("education_score", 75),
            experience_score=r.get("experience_score", 75),
            salary_range=r.get("salary_range"),
            growth_outlook=r.get("growth_outlook"),
            relevant_skills=r.get("relevant_skills", []),
            missing_skills=r.get("missing_skills", []),
            recommended_actions=r.get("recommended_actions", []),
            is_target=is_target
        )
        db.add(rec)
        saved_recs.append(rec)

    db.commit()
    return saved_recs

@router.post("/target")
def set_target_career(
    req: SetTargetCareerRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """FR-CAR-7: The student shall be able to select a recommended career as their target."""
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if profile:
        profile.target_career = req.career_name
        db.commit()

    # Update is_target flag on recommendations
    recs = db.query(CareerRecommendation).filter(CareerRecommendation.user_id == current_user.id).all()
    for r in recs:
        r.is_target = (r.career_name.lower() == req.career_name.lower())
    db.commit()

    return {"message": f"Target career updated to '{req.career_name}'.", "target_career": req.career_name}
