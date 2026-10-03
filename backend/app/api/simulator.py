from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Profile, Skill, CareerSimulation
from app.schemas import SimulationRequest, SimulationOut
from app.services.gemini_client import AIServiceLayer
from app.api.deps import get_current_user
from app.api.career import profile_to_dict

router = APIRouter(prefix="/simulator", tags=["Career What-If Simulator"])

@router.post("/simulate", response_model=SimulationOut)
def run_simulation(
    req: SimulationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """FR-SIM-1 to FR-SIM-5: Temporary hypothetical skill evaluation, before/after score comparison, explanation."""
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    target = req.target_career or profile.target_career or "Full Stack AI Engineer"
    p_dict = profile_to_dict(profile)

    # Call AI Service Layer
    sim_data = AIServiceLayer.simulate_what_if(
        hypothetical_skills=req.hypothetical_skills,
        target_career=target,
        current_profile=p_dict
    )

    simulation = CareerSimulation(
        user_id=current_user.id,
        hypothetical_skills=req.hypothetical_skills,
        target_career=target,
        before_score=sim_data.get("before_score", 65),
        after_score=sim_data.get("after_score", 88),
        score_delta=sim_data.get("score_delta", 23),
        explanation=sim_data.get("explanation", "Significant boost in core competencies."),
        unlocked_capabilities=sim_data.get("unlocked_capabilities", []),
        is_saved_to_profile=False
    )
    db.add(simulation)
    db.commit()
    db.refresh(simulation)

    return simulation

@router.get("/history", response_model=List[SimulationOut])
def get_simulation_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """FR-SIM-5: Simulations shall be stored for later viewing."""
    return (
        db.query(CareerSimulation)
        .filter(CareerSimulation.user_id == current_user.id)
        .order_by(CareerSimulation.created_at.desc())
        .all()
    )

@router.post("/{sim_id}/apply")
def apply_simulation_to_profile(
    sim_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """FR-SIM-2: Option to permanently merge hypothetical skills into the student's profile."""
    sim = db.query(CareerSimulation).filter(CareerSimulation.id == sim_id, CareerSimulation.user_id == current_user.id).first()
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found")

    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    existing_skill_names = {s.name.lower() for s in profile.skills}
    added_count = 0

    for s_name in sim.hypothetical_skills:
        if s_name.lower() not in existing_skill_names:
            db.add(Skill(
                profile_id=profile.id,
                name=s_name,
                category="Hypothetical Applied",
                proficiency="Intermediate",
                source="user_edited"
            ))
            added_count += 1

    sim.is_saved_to_profile = True
    db.commit()

    return {
        "message": f"Added {added_count} new skills from simulation to your permanent profile.",
        "skills_added": sim.hypothetical_skills
    }
