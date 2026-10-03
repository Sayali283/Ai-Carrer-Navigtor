from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr, Field
import datetime

# --- Auth Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    is_active: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None

# --- Skill Schemas ---
class SkillBase(BaseModel):
    name: str
    category: Optional[str] = "Technical"
    proficiency: Optional[str] = "Intermediate"
    source: Optional[str] = "user_edited"

class SkillCreate(SkillBase):
    pass

class SkillOut(SkillBase):
    id: int
    profile_id: int

    class Config:
        from_attributes = True

# --- Education Schemas ---
class EducationBase(BaseModel):
    institution: str
    degree: Optional[str] = None
    branch_or_field: Optional[str] = None
    start_year: Optional[str] = None
    end_year: Optional[str] = None
    grade: Optional[str] = None
    source: Optional[str] = "user_edited"

class EducationCreate(EducationBase):
    pass

class EducationOut(EducationBase):
    id: int
    profile_id: int

    class Config:
        from_attributes = True

# --- Experience Schemas ---
class ExperienceBase(BaseModel):
    title: str
    company: str
    role_type: Optional[str] = "Internship"
    duration: Optional[str] = None
    description: Optional[str] = None
    technologies: List[str] = []
    source: Optional[str] = "user_edited"

class ExperienceCreate(ExperienceBase):
    pass

class ExperienceOut(ExperienceBase):
    id: int
    profile_id: int

    class Config:
        from_attributes = True

# --- Project Schemas ---
class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    technologies: List[str] = []
    link: Optional[str] = None
    source: Optional[str] = "user_edited"

class ProjectCreate(ProjectBase):
    pass

class ProjectOut(ProjectBase):
    id: int
    profile_id: int

    class Config:
        from_attributes = True

# --- Certification Schemas ---
class CertificationBase(BaseModel):
    name: str
    issuer: Optional[str] = None
    issue_date: Optional[str] = None
    credential_url: Optional[str] = None
    source: Optional[str] = "user_edited"

class CertificationCreate(CertificationBase):
    pass

class CertificationOut(CertificationBase):
    id: int
    profile_id: int

    class Config:
        from_attributes = True

# --- Profile Schemas ---
class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    bio: Optional[str] = None
    target_career: Optional[str] = None
    current_skill_level: Optional[str] = None
    available_hours_per_day: Optional[float] = None
    preferred_learning_style: Optional[str] = None
    career_interests: Optional[List[str]] = None

class ProfileOut(BaseModel):
    id: int
    user_id: int
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    bio: Optional[str] = None
    target_career: Optional[str] = None
    current_skill_level: str
    available_hours_per_day: float
    preferred_learning_style: str
    career_interests: List[str] = []
    skills: List[SkillOut] = []
    educations: List[EducationOut] = []
    experiences: List[ExperienceOut] = []
    projects: List[ProjectOut] = []
    certifications: List[CertificationOut] = []
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

# --- Resume Schemas ---
class ResumeParsedData(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    target_career_hint: Optional[str] = None
    skills: List[Dict[str, str]] = []  # name, category, proficiency
    education: List[Dict[str, Any]] = []
    experience: List[Dict[str, Any]] = []
    projects: List[Dict[str, Any]] = []
    certifications: List[Dict[str, Any]] = []
    interests: List[str] = []

class ResumeUploadResponse(BaseModel):
    message: str
    extracted_text_preview: str
    parsed_profile: ResumeParsedData
    applied: bool = True

# --- Career Recommendation Schemas ---
class CareerRecommendationOut(BaseModel):
    id: Optional[int] = None
    career_name: str
    match_score: int
    reasoning: str
    technical_skills_score: int = 70
    project_relevance_score: int = 70
    education_score: int = 70
    experience_score: int = 70
    salary_range: Optional[str] = None
    growth_outlook: Optional[str] = None
    relevant_skills: List[str] = []
    missing_skills: List[str] = []
    recommended_actions: List[str] = []
    is_target: bool = False

    class Config:
        from_attributes = True

class SetTargetCareerRequest(BaseModel):
    career_name: str

# --- Skill Gap Schemas ---
class SkillGapItem(BaseModel):
    skill_name: str
    category: str = "Technical"
    current_proficiency: int  # 0 to 100
    target_proficiency: int   # 0 to 100
    importance: str           # Critical, High, Medium, Low
    gap_severity: str         # Critical, Major, Moderate, Minimal
    estimated_hours_to_bridge: int = 15
    learning_resources: List[Dict[str, str]] = []

class SkillGapResponse(BaseModel):
    career_name: str
    overall_readiness: int
    gaps: List[SkillGapItem]

# --- Roadmap Schemas ---
class RoadmapTaskOut(BaseModel):
    id: int
    order_index: int
    phase_title: str
    day_number: int
    week_number: int
    title: str
    description: Optional[str] = None
    topic: Optional[str] = None
    estimated_hours: float
    resources: List[Dict[str, str]] = []
    practical_exercise: Optional[str] = None
    is_completed: bool
    is_adaptive_addition: bool = False
    is_skipped: bool = False

    class Config:
        from_attributes = True

class RoadmapOut(BaseModel):
    id: int
    career_name: str
    duration_days: int
    hours_per_day: float
    starting_level: str
    preferred_learning_style: str
    goal: Optional[str] = None
    total_tasks: int
    completed_tasks: int
    progress_percent: float
    status: str
    tasks: List[RoadmapTaskOut] = []
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class RoadmapCreateRequest(BaseModel):
    career_name: Optional[str] = None
    duration_days: int = 30  # 7, 14, 30, 60, 90
    hours_per_day: Optional[float] = 2.0
    starting_level: Optional[str] = "Beginner"
    preferred_learning_style: Optional[str] = "Hands-on Project-based"
    goal: Optional[str] = "Land a junior/entry-level role"

class TaskToggleRequest(BaseModel):
    is_completed: bool

# --- Assessment Schemas ---
class AssessmentQuestionOut(BaseModel):
    id: int
    question_text: str
    question_type: str  # mcq, conceptual, scenario, coding
    options: List[str] = []
    user_answer: Optional[str] = None
    is_correct: Optional[bool] = None
    explanation: Optional[str] = None

    class Config:
        from_attributes = True

class AssessmentOut(BaseModel):
    id: int
    roadmap_id: Optional[int] = None
    title: str
    topic: str
    status: str
    score_percent: Optional[float] = None
    total_questions: int
    strengths: List[str] = []
    weaknesses: List[str] = []
    ai_feedback: Optional[str] = None
    questions: List[AssessmentQuestionOut] = []
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class AnswerSubmission(BaseModel):
    question_id: int
    answer: str

class AssessmentSubmitRequest(BaseModel):
    answers: List[AnswerSubmission]

class AssessmentCreateRequest(BaseModel):
    roadmap_id: Optional[int] = None
    topic: Optional[str] = "Full Stack Web Development & Core Concepts"

# --- Adaptive History Schema ---
class AdaptiveHistoryOut(BaseModel):
    id: int
    roadmap_id: int
    assessment_id: Optional[int] = None
    changes_summary: str
    added_topics: List[str] = []
    skipped_topics: List[str] = []
    reason: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# --- Simulation Schemas ---
class SimulationRequest(BaseModel):
    hypothetical_skills: List[str]
    target_career: Optional[str] = None

class SimulationOut(BaseModel):
    id: Optional[int] = None
    hypothetical_skills: List[str]
    target_career: str
    before_score: int
    after_score: int
    score_delta: int
    explanation: str
    unlocked_capabilities: List[str] = []
    is_saved_to_profile: bool = False
    created_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

# --- Job Match Schemas ---
class JobMatchRequest(BaseModel):
    job_description: str
    job_title: Optional[str] = None
    company: Optional[str] = None

class PrepMilestone(BaseModel):
    phase: str
    focus: str
    duration_days: int
    actions: List[str]

class JobMatchOut(BaseModel):
    id: Optional[int] = None
    job_title: str
    company: str
    match_score: int
    extracted_required_skills: List[str] = []
    extracted_preferred_skills: List[str] = []
    matching_skills: List[str] = []
    missing_skills: List[str] = []
    match_strengths: List[str] = []
    responsibilities_summary: Optional[str] = None
    preparation_plan: List[PrepMilestone] = []
    created_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

# --- Portfolio Project Generator Schemas ---
class ProjectGenerateRequest(BaseModel):
    target_career: Optional[str] = None
    difficulty: Optional[str] = "Intermediate"  # Beginner, Intermediate, Advanced
    interest_domain: Optional[str] = None

class PortfolioProjectOut(BaseModel):
    id: Optional[int] = None
    target_career: str
    title: str
    difficulty: str
    problem_statement: str
    technologies: List[str] = []
    features: List[str] = []
    development_stages: List[Dict[str, str]] = []
    dataset_requirements: Optional[str] = None
    expected_outcome: Optional[str] = None
    skills_demonstrated: List[str] = []
    resume_bullet_suggestions: List[str] = []
    created_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

# --- Resume Review Schemas ---
class BulletRewrite(BaseModel):
    before: str
    after: str
    metric_boost: str

class ResumeReviewOut(BaseModel):
    id: Optional[int] = None
    overall_score: int
    summary: str
    weak_sections: List[Dict[str, str]] = []  # section, issue, recommendation
    suggestions: List[str] = []
    bullet_rewrites: List[BulletRewrite] = []
    ats_keywords_recommended: List[str] = []
    ats_keywords_missing: List[str] = []
    created_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True
