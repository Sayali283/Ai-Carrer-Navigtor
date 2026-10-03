import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import (
    User, Profile, Roadmap, RoadmapTask, Assessment, AssessmentQuestion, AdaptiveHistory
)
from app.schemas import (
    AssessmentOut, AssessmentCreateRequest, AssessmentSubmitRequest,
    AdaptiveHistoryOut
)
from app.services.gemini_client import AIServiceLayer
from app.api.deps import get_current_user
from app.api.roadmap import calculate_progress

router = APIRouter(prefix="/assessment", tags=["AI Assessment & Adaptive Engine"])

@router.post("/generate", response_model=AssessmentOut)
def generate_assessment(
    req: AssessmentCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """FR-ASM-1: Generates interactive assessment (MCQs, conceptual, scenario, coding)."""
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    career_name = (profile.target_career if profile else None) or "Full Stack AI Engineer"
    skill_level = (profile.current_skill_level if profile else None) or "Intermediate"

    roadmap_id = req.roadmap_id
    if not roadmap_id:
        active_rm = db.query(Roadmap).filter(Roadmap.user_id == current_user.id, Roadmap.status == "active").first()
        if active_rm:
            roadmap_id = active_rm.id

    topic = req.topic or "Modern Asynchronous Architecture & Web APIs"

    # Call AI Service Layer
    q_data = AIServiceLayer.generate_assessment_questions(
        topic=topic,
        career_name=career_name,
        skill_level=skill_level
    )

    assessment = Assessment(
        user_id=current_user.id,
        roadmap_id=roadmap_id,
        title=f"Assessment: {topic}",
        topic=topic,
        status="pending",
        total_questions=len(q_data)
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    for q in q_data:
        question = AssessmentQuestion(
            assessment_id=assessment.id,
            question_text=q.get("question_text", "Question"),
            question_type=q.get("question_type", "mcq"),
            options=q.get("options", []),
            correct_answer=q.get("correct_answer", ""),
            explanation=q.get("explanation", "")
        )
        db.add(question)

    db.commit()
    db.refresh(assessment)
    return assessment

@router.get("/{assessment_id}", response_model=AssessmentOut)
def get_assessment(
    assessment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id, Assessment.user_id == current_user.id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return assessment

@router.post("/{assessment_id}/submit", response_model=AssessmentOut)
def submit_assessment(
    assessment_id: int,
    sub_in: AssessmentSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    FR-ASM-2, FR-ASM-3, FR-ASM-4: Evaluate responses, calculate strengths/weaknesses.
    FR-ADP-1 to FR-ADP-4: Automatically trigger the Adaptive Roadmap Engine.
    """
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id, Assessment.user_id == current_user.id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    answers_dict = {ans.question_id: ans.answer for ans in sub_in.answers}
    q_objs = assessment.questions

    # Prepare for evaluation
    q_dicts = [
        {
            "id": q.id,
            "question_text": q.question_text,
            "correct_answer": q.correct_answer,
            "explanation": q.explanation
        }
        for q in q_objs
    ]

    eval_result = AIServiceLayer.evaluate_assessment(q_dicts, answers_dict)

    # Save question outcomes
    for q in q_objs:
        q.user_answer = answers_dict.get(q.id)
        for r in eval_result.get("question_results", []):
            if r.get("question_id") == q.id:
                q.is_correct = r.get("is_correct")
                break

    assessment.score_percent = eval_result.get("score_percent", 75.0)
    assessment.strengths = eval_result.get("strengths", [])
    assessment.weaknesses = eval_result.get("weaknesses", [])
    assessment.ai_feedback = eval_result.get("ai_feedback", "Completed assessment.")
    assessment.status = "completed"
    assessment.completed_at = datetime.datetime.utcnow()

    # --- FR-ADP-1: Trigger Adaptive Engine if associated with Roadmap ---
    if assessment.roadmap_id:
        roadmap = db.query(Roadmap).filter(Roadmap.id == assessment.roadmap_id).first()
        if roadmap:
            adapt_res = AIServiceLayer.adapt_roadmap(
                roadmap_tasks=[{"title": t.title, "topic": t.topic} for t in roadmap.tasks if not t.is_completed],
                assessment_result=eval_result
            )

            # Record in AdaptiveHistory (FR-ADP-4: Show student what changed and why)
            history = AdaptiveHistory(
                roadmap_id=roadmap.id,
                assessment_id=assessment.id,
                changes_summary=adapt_res.get("changes_summary", "Roadmap adapted to reinforcement topics."),
                added_topics=adapt_res.get("added_topics", []),
                skipped_topics=adapt_res.get("skipped_topics", []),
                reason=adapt_res.get("reason", "Assessment results evaluation.")
            )
            db.add(history)

            # Insert new remedial tasks into roadmap
            max_order = max([t.order_index for t in roadmap.tasks] or [0])
            for mod in adapt_res.get("modified_tasks", []):
                max_order += 1
                new_t = RoadmapTask(
                    roadmap_id=roadmap.id,
                    order_index=max_order,
                    phase_title=mod.get("phase_title", "Phase (Adaptive Support)"),
                    day_number=max([t.day_number for t in roadmap.tasks] or [1]),
                    week_number=max([t.week_number for t in roadmap.tasks] or [1]),
                    title=mod.get("title", "Remedial Concept Workshop"),
                    description=mod.get("description"),
                    topic=mod.get("topic"),
                    estimated_hours=mod.get("estimated_hours", 2.0),
                    practical_exercise=mod.get("practical_exercise"),
                    is_completed=False,
                    is_adaptive_addition=True
                )
                db.add(new_t)

            roadmap.status = "adapted"
            calculate_progress(roadmap, db)

    db.commit()
    db.refresh(assessment)
    return assessment

@router.get("/adaptive/history/{roadmap_id}", response_model=List[AdaptiveHistoryOut])
def get_adaptive_history(
    roadmap_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """FR-ADP-4: Show student what changed and why."""
    histories = (
        db.query(AdaptiveHistory)
        .join(Roadmap)
        .filter(Roadmap.id == roadmap_id, Roadmap.user_id == current_user.id)
        .order_by(AdaptiveHistory.created_at.desc())
        .all()
    )
    return histories
