from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Profile, SkillGapAnalysis
from app.schemas import SkillGapResponse, SkillGapItem
from app.services.gemini_client import AIServiceLayer
from app.api.deps import get_current_user
from app.api.career import profile_to_dict

router = APIRouter(prefix="/skill-gap", tags=["Skill Gap Analysis"])

@router.get("/analyze", response_model=SkillGapResponse)
def analyze_skill_gap(
    career: Optional[str] = Query(None, description="Target career to analyze against"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """FR-GAP-1 to FR-GAP-4: Skill gap evaluation with dynamic competencies and severity ranking."""
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    target_career = career or profile.target_career or "Full Stack AI Engineer"
    p_dict = profile_to_dict(profile)

    gap_data = AIServiceLayer.analyze_skill_gap(target_career, p_dict)

    # Persist or update analysis in DB
    db.query(SkillGapAnalysis).filter(
        SkillGapAnalysis.user_id == current_user.id,
        SkillGapAnalysis.career_name == target_career
    ).delete()

    items = []
    for g in gap_data.get("gaps", []):
        db_gap = SkillGapAnalysis(
            user_id=current_user.id,
            career_name=target_career,
            skill_name=g.get("skill_name", "Skill"),
            category=g.get("category", "Technical"),
            current_proficiency=g.get("current_proficiency", 20),
            target_proficiency=g.get("target_proficiency", 80),
            importance=g.get("importance", "High"),
            gap_severity=g.get("gap_severity", "Moderate"),
            estimated_hours_to_bridge=g.get("estimated_hours_to_bridge", 15),
            learning_resources=g.get("learning_resources", [])
        )
        db.add(db_gap)
        items.append(SkillGapItem(**g))

    db.commit()

    return SkillGapResponse(
        career_name=target_career,
        overall_readiness=gap_data.get("overall_readiness", 65),
        gaps=items
    )
