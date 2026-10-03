from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Profile, Roadmap, RoadmapTask
from app.schemas import RoadmapOut, RoadmapCreateRequest, TaskToggleRequest
from app.services.gemini_client import AIServiceLayer
from app.api.deps import get_current_user

router = APIRouter(prefix="/roadmap", tags=["Learning Roadmap"])

def calculate_progress(roadmap: Roadmap, db: Session):
    total = len(roadmap.tasks)
    completed = sum(1 for t in roadmap.tasks if t.is_completed)
    roadmap.total_tasks = total
    roadmap.completed_tasks = completed
    roadmap.progress_percent = round((completed / max(1, total)) * 100, 1)
    if completed == total and total > 0:
        roadmap.status = "completed"
    db.commit()
    db.refresh(roadmap)

@router.get("", response_model=Optional[RoadmapOut])
def get_active_roadmap(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """FR-RDM-5, FR-RDM-6: Retrieve current active learning roadmap with task breakdown."""
    roadmap = (
        db.query(Roadmap)
        .filter(Roadmap.user_id == current_user.id)
        .order_by(Roadmap.created_at.desc())
        .first()
    )
    return roadmap

@router.post("/generate", response_model=RoadmapOut)
def generate_roadmap(
    req: RoadmapCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """FR-RDM-1 to FR-RDM-4: Generate a tailored multi-day roadmap (7, 14, 30, 60, 90 days)."""
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    career_name = req.career_name or (profile.target_career if profile else None) or "Full Stack AI Engineer"
    starting_level = req.starting_level or (profile.current_skill_level if profile else "Beginner")
    hours = req.hours_per_day or (profile.available_hours_per_day if profile else 2.0)
    style = req.preferred_learning_style or (profile.preferred_learning_style if profile else "Hands-on Project-based")
    goal = req.goal or "Master production-ready skills"

    skills = [s.name for s in profile.skills] if profile else []

    # Call AI Service Layer
    task_dicts = AIServiceLayer.generate_roadmap(
        career_name=career_name,
        duration_days=req.duration_days,
        hours_per_day=hours,
        starting_level=starting_level,
        preferred_learning_style=style,
        goal=goal,
        skills=skills
    )

    # Deactivate or archive past active roadmaps
    past = db.query(Roadmap).filter(Roadmap.user_id == current_user.id, Roadmap.status == "active").all()
    for p in past:
        p.status = "archived"

    new_roadmap = Roadmap(
        user_id=current_user.id,
        career_name=career_name,
        duration_days=req.duration_days,
        hours_per_day=hours,
        starting_level=starting_level,
        preferred_learning_style=style,
        goal=goal,
        total_tasks=len(task_dicts),
        completed_tasks=0,
        progress_percent=0.0,
        status="active"
    )
    db.add(new_roadmap)
    db.commit()
    db.refresh(new_roadmap)

    # Insert tasks
    for t in task_dicts:
        task = RoadmapTask(
            roadmap_id=new_roadmap.id,
            order_index=t.get("order_index", 1),
            phase_title=t.get("phase_title", "Phase 1"),
            day_number=t.get("day_number", 1),
            week_number=t.get("week_number", 1),
            title=t.get("title", "Task"),
            description=t.get("description"),
            topic=t.get("topic"),
            estimated_hours=t.get("estimated_hours", hours),
            resources=t.get("resources", []),
            practical_exercise=t.get("practical_exercise"),
            is_completed=False,
            is_adaptive_addition=t.get("is_adaptive_addition", False),
            is_skipped=t.get("is_skipped", False)
        )
        db.add(task)

    db.commit()
    db.refresh(new_roadmap)
    return new_roadmap

@router.patch("/tasks/{task_id}/toggle", response_model=RoadmapOut)
def toggle_task(
    task_id: int,
    req: TaskToggleRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """FR-RDM-5: Toggle task completion and recalculate progress."""
    task = (
        db.query(RoadmapTask)
        .join(Roadmap)
        .filter(RoadmapTask.id == task_id, Roadmap.user_id == current_user.id)
        .first()
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.is_completed = req.is_completed
    db.commit()

    calculate_progress(task.roadmap, db)
    return task.roadmap
