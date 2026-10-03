from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import (
    User, Profile, Skill, Education, Experience, StudentProject, Certification
)
from app.schemas import (
    ProfileOut, ProfileUpdate,
    SkillCreate, SkillOut,
    EducationCreate, EducationOut,
    ExperienceCreate, ExperienceOut,
    ProjectCreate, ProjectOut,
    CertificationCreate, CertificationOut
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/profile", tags=["Student Profile"])

def get_or_create_profile(user: User, db: Session) -> Profile:
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    if not profile:
        profile = Profile(
            user_id=user.id,
            full_name=user.full_name,
            email=user.email,
            current_skill_level="Beginner",
            available_hours_per_day=2.0,
            preferred_learning_style="Hands-on Project-based"
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.get("", response_model=ProfileOut)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """FR-PRO-1, FR-PRO-2: Get student profile with all extracted and edited entities."""
    return get_or_create_profile(current_user, db)

@router.put("", response_model=ProfileOut)
def update_profile(
    update_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """FR-PRO-3: Update overall profile details."""
    profile = get_or_create_profile(current_user, db)
    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile

@router.delete("")
def clear_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """FR-PRO-5: The student shall be able to delete their profile information."""
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if profile:
        db.delete(profile)
        db.commit()
    # Re-init fresh empty profile
    new_prof = Profile(user_id=current_user.id, full_name=current_user.full_name, email=current_user.email)
    db.add(new_prof)
    db.commit()
    return {"message": "Profile reset to empty state successfully."}

# --- Skills CRUD (FR-PRO-3, FR-PRO-4: Distinguish AI vs edited) ---
@router.post("/skills", response_model=SkillOut)
def add_skill(
    skill_in: SkillCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_or_create_profile(current_user, db)
    new_skill = Skill(
        profile_id=profile.id,
        name=skill_in.name,
        category=skill_in.category or "Technical",
        proficiency=skill_in.proficiency or "Intermediate",
        source="user_edited"
    )
    db.add(new_skill)
    db.commit()
    db.refresh(new_skill)
    return new_skill

@router.put("/skills/{skill_id}", response_model=SkillOut)
def update_skill(
    skill_id: int,
    skill_in: SkillCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_or_create_profile(current_user, db)
    skill = db.query(Skill).filter(Skill.id == skill_id, Skill.profile_id == profile.id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    skill.name = skill_in.name
    skill.category = skill_in.category
    skill.proficiency = skill_in.proficiency
    skill.source = "user_edited"  # Marks explicitly as edited by student
    db.commit()
    db.refresh(skill)
    return skill

@router.delete("/skills/{skill_id}")
def delete_skill(
    skill_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_or_create_profile(current_user, db)
    skill = db.query(Skill).filter(Skill.id == skill_id, Skill.profile_id == profile.id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    db.delete(skill)
    db.commit()
    return {"message": "Skill deleted"}

# --- Education CRUD ---
@router.post("/education", response_model=EducationOut)
def add_education(
    edu_in: EducationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_or_create_profile(current_user, db)
    edu = Education(profile_id=profile.id, **edu_in.model_dump())
    edu.source = "user_edited"
    db.add(edu)
    db.commit()
    db.refresh(edu)
    return edu

@router.delete("/education/{edu_id}")
def delete_education(
    edu_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_or_create_profile(current_user, db)
    edu = db.query(Education).filter(Education.id == edu_id, Education.profile_id == profile.id).first()
    if not edu:
        raise HTTPException(status_code=404, detail="Education not found")
    db.delete(edu)
    db.commit()
    return {"message": "Education entry deleted"}

# --- Experience CRUD ---
@router.post("/experience", response_model=ExperienceOut)
def add_experience(
    exp_in: ExperienceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_or_create_profile(current_user, db)
    exp = Experience(profile_id=profile.id, **exp_in.model_dump())
    exp.source = "user_edited"
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp

@router.delete("/experience/{exp_id}")
def delete_experience(
    exp_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_or_create_profile(current_user, db)
    exp = db.query(Experience).filter(Experience.id == exp_id, Experience.profile_id == profile.id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")
    db.delete(exp)
    db.commit()
    return {"message": "Experience entry deleted"}

# --- Projects CRUD ---
@router.post("/projects", response_model=ProjectOut)
def add_project(
    proj_in: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_or_create_profile(current_user, db)
    proj = StudentProject(profile_id=profile.id, **proj_in.model_dump())
    proj.source = "user_edited"
    db.add(proj)
    db.commit()
    db.refresh(proj)
    return proj

@router.delete("/projects/{proj_id}")
def delete_project(
    proj_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_or_create_profile(current_user, db)
    proj = db.query(StudentProject).filter(StudentProject.id == proj_id, StudentProject.profile_id == profile.id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(proj)
    db.commit()
    return {"message": "Project entry deleted"}

# --- Certifications CRUD ---
@router.post("/certifications", response_model=CertificationOut)
def add_certification(
    cert_in: CertificationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_or_create_profile(current_user, db)
    cert = Certification(profile_id=profile.id, **cert_in.model_dump())
    cert.source = "user_edited"
    db.add(cert)
    db.commit()
    db.refresh(cert)
    return cert

@router.delete("/certifications/{cert_id}")
def delete_certification(
    cert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_or_create_profile(current_user, db)
    cert = db.query(Certification).filter(Certification.id == cert_id, Certification.profile_id == profile.id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certification not found")
    db.delete(cert)
    db.commit()
    return {"message": "Certification entry deleted"}
