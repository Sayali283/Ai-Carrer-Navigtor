import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    career_recommendations = relationship("CareerRecommendation", back_populates="user", cascade="all, delete-orphan")
    roadmaps = relationship("Roadmap", back_populates="user", cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="user", cascade="all, delete-orphan")
    simulations = relationship("CareerSimulation", back_populates="user", cascade="all, delete-orphan")
    job_matches = relationship("JobMatch", back_populates="user", cascade="all, delete-orphan")
    portfolio_projects = relationship("PortfolioProjectIdea", back_populates="user", cascade="all, delete-orphan")
    resume_reviews = relationship("ResumeReview", back_populates="user", cascade="all, delete-orphan")


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Personal info
    full_name = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(100), nullable=True)
    location = Column(String(255), nullable=True)
    linkedin_url = Column(String(500), nullable=True)
    github_url = Column(String(500), nullable=True)
    portfolio_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    
    # Career goals & constraints (FR-PRO-1)
    target_career = Column(String(255), nullable=True)
    current_skill_level = Column(String(50), default="Beginner")  # Beginner, Intermediate, Advanced
    available_hours_per_day = Column(Float, default=2.0)
    preferred_learning_style = Column(String(100), default="Hands-on Project-based")
    career_interests = Column(JSON, default=list)  # list of strings
    raw_resume_text = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="profile")
    skills = relationship("Skill", back_populates="profile", cascade="all, delete-orphan")
    educations = relationship("Education", back_populates="profile", cascade="all, delete-orphan")
    experiences = relationship("Experience", back_populates="profile", cascade="all, delete-orphan")
    projects = relationship("StudentProject", back_populates="profile", cascade="all, delete-orphan")
    certifications = relationship("Certification", back_populates="profile", cascade="all, delete-orphan")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(150), nullable=False)
    category = Column(String(100), default="Technical")  # Programming, Framework, Database, Cloud, Tool, Soft Skill
    proficiency = Column(String(50), default="Intermediate")  # Beginner, Intermediate, Advanced, Expert
    source = Column(String(50), default="ai_extracted")  # ai_extracted or user_edited (FR-PRO-4)

    profile = relationship("Profile", back_populates="skills")


class Education(Base):
    __tablename__ = "educations"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    institution = Column(String(255), nullable=False)
    degree = Column(String(255), nullable=True)
    branch_or_field = Column(String(255), nullable=True)
    start_year = Column(String(50), nullable=True)
    end_year = Column(String(50), nullable=True)
    grade = Column(String(50), nullable=True)
    source = Column(String(50), default="ai_extracted")

    profile = relationship("Profile", back_populates="educations")


class Experience(Base):
    __tablename__ = "experiences"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    role_type = Column(String(100), default="Internship")  # Internship, Full-time, Freelance
    duration = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    technologies = Column(JSON, default=list)
    source = Column(String(50), default="ai_extracted")

    profile = relationship("Profile", back_populates="experiences")


class StudentProject(Base):
    __tablename__ = "student_projects"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    technologies = Column(JSON, default=list)
    link = Column(String(500), nullable=True)
    source = Column(String(50), default="ai_extracted")

    profile = relationship("Profile", back_populates="projects")


class Certification(Base):
    __tablename__ = "certifications"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    issuer = Column(String(255), nullable=True)
    issue_date = Column(String(100), nullable=True)
    credential_url = Column(String(500), nullable=True)
    source = Column(String(50), default="ai_extracted")

    profile = relationship("Profile", back_populates="certifications")


class CareerRecommendation(Base):
    __tablename__ = "career_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    career_name = Column(String(255), nullable=False)
    match_score = Column(Integer, nullable=False)  # 0 to 100
    reasoning = Column(Text, nullable=False)
    
    # Score breakdowns (FR-CAR-4)
    technical_skills_score = Column(Integer, default=70)
    project_relevance_score = Column(Integer, default=70)
    education_score = Column(Integer, default=70)
    experience_score = Column(Integer, default=70)
    
    salary_range = Column(String(100), nullable=True)
    growth_outlook = Column(String(100), nullable=True)
    
    relevant_skills = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)
    recommended_actions = Column(JSON, default=list)
    
    is_target = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="career_recommendations")


class SkillGapAnalysis(Base):
    __tablename__ = "skill_gap_analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    career_name = Column(String(255), nullable=False)
    skill_name = Column(String(150), nullable=False)
    category = Column(String(100), default="Technical")
    current_proficiency = Column(Integer, default=0)  # 0 to 100
    target_proficiency = Column(Integer, default=80)   # 0 to 100
    importance = Column(String(50), default="High")    # Critical, High, Medium, Low
    gap_severity = Column(String(50), default="Moderate") # Critical, Major, Moderate, Minimal
    estimated_hours_to_bridge = Column(Integer, default=20)
    learning_resources = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    career_name = Column(String(255), nullable=False)
    duration_days = Column(Integer, default=30)  # 7, 14, 30, 60, 90
    hours_per_day = Column(Float, default=2.0)
    starting_level = Column(String(50), default="Beginner")
    preferred_learning_style = Column(String(100), default="Hands-on Project-based")
    goal = Column(String(255), nullable=True)
    
    total_tasks = Column(Integer, default=0)
    completed_tasks = Column(Integer, default=0)
    progress_percent = Column(Float, default=0.0)
    status = Column(String(50), default="active")  # active, completed, adapted
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="roadmaps")
    tasks = relationship("RoadmapTask", back_populates="roadmap", cascade="all, delete-orphan", order_by="RoadmapTask.order_index")
    assessments = relationship("Assessment", back_populates="roadmap", cascade="all, delete-orphan")
    adaptive_history = relationship("AdaptiveHistory", back_populates="roadmap", cascade="all, delete-orphan")


class RoadmapTask(Base):
    __tablename__ = "roadmap_tasks"

    id = Column(Integer, primary_key=True, index=True)
    roadmap_id = Column(Integer, ForeignKey("roadmaps.id", ondelete="CASCADE"), nullable=False)
    order_index = Column(Integer, nullable=False)
    phase_title = Column(String(255), default="Phase 1: Foundations")
    day_number = Column(Integer, default=1)
    week_number = Column(Integer, default=1)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    topic = Column(String(150), nullable=True)
    estimated_hours = Column(Float, default=2.0)
    resources = Column(JSON, default=list)  # list of {title, url, type}
    practical_exercise = Column(Text, nullable=True)
    
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    is_adaptive_addition = Column(Boolean, default=False)
    is_skipped = Column(Boolean, default=False)

    roadmap = relationship("Roadmap", back_populates="tasks")


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    roadmap_id = Column(Integer, ForeignKey("roadmaps.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    topic = Column(String(255), nullable=False)
    
    status = Column(String(50), default="pending")  # pending, completed
    score_percent = Column(Float, nullable=True)
    total_questions = Column(Integer, default=5)
    strengths = Column(JSON, default=list)
    weaknesses = Column(JSON, default=list)
    ai_feedback = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="assessments")
    roadmap = relationship("Roadmap", back_populates="assessments")
    questions = relationship("AssessmentQuestion", back_populates="assessment", cascade="all, delete-orphan")


class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(String(50), default="mcq")  # mcq, conceptual, scenario, coding
    options = Column(JSON, default=list)  # for mcq
    correct_answer = Column(Text, nullable=False)
    user_answer = Column(Text, nullable=True)
    is_correct = Column(Boolean, nullable=True)
    explanation = Column(Text, nullable=True)

    assessment = relationship("Assessment", back_populates="questions")


class AdaptiveHistory(Base):
    __tablename__ = "adaptive_histories"

    id = Column(Integer, primary_key=True, index=True)
    roadmap_id = Column(Integer, ForeignKey("roadmaps.id", ondelete="CASCADE"), nullable=False)
    assessment_id = Column(Integer, ForeignKey("assessments.id", ondelete="SET NULL"), nullable=True)
    changes_summary = Column(Text, nullable=False)
    added_topics = Column(JSON, default=list)
    skipped_topics = Column(JSON, default=list)
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    roadmap = relationship("Roadmap", back_populates="adaptive_history")


class CareerSimulation(Base):
    __tablename__ = "career_simulations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    hypothetical_skills = Column(JSON, default=list)  # list of skill strings
    target_career = Column(String(255), nullable=False)
    before_score = Column(Integer, nullable=False)
    after_score = Column(Integer, nullable=False)
    score_delta = Column(Integer, nullable=False)
    explanation = Column(Text, nullable=False)
    unlocked_capabilities = Column(JSON, default=list)
    is_saved_to_profile = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="simulations")


class JobMatch(Base):
    __tablename__ = "job_matches"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    job_title = Column(String(255), nullable=False)
    company = Column(String(255), default="Target Company")
    original_jd = Column(Text, nullable=False)
    match_score = Column(Integer, nullable=False)  # 0 to 100
    
    extracted_required_skills = Column(JSON, default=list)
    extracted_preferred_skills = Column(JSON, default=list)
    matching_skills = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)
    match_strengths = Column(JSON, default=list)
    responsibilities_summary = Column(Text, nullable=True)
    preparation_plan = Column(JSON, default=list)  # list of actionable milestones
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="job_matches")


class PortfolioProjectIdea(Base):
    __tablename__ = "portfolio_project_ideas"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    target_career = Column(String(255), nullable=False)
    title = Column(String(255), nullable=False)
    difficulty = Column(String(50), default="Intermediate")  # Beginner, Intermediate, Advanced
    problem_statement = Column(Text, nullable=False)
    technologies = Column(JSON, default=list)
    features = Column(JSON, default=list)
    development_stages = Column(JSON, default=list)
    dataset_requirements = Column(Text, nullable=True)
    expected_outcome = Column(Text, nullable=True)
    skills_demonstrated = Column(JSON, default=list)
    resume_bullet_suggestions = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="portfolio_projects")


class ResumeReview(Base):
    __tablename__ = "resume_reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    overall_score = Column(Integer, default=75)  # 0 to 100
    summary = Column(Text, nullable=False)
    weak_sections = Column(JSON, default=list)
    suggestions = Column(JSON, default=list)
    bullet_rewrites = Column(JSON, default=list)  # list of {before, after, metric_boost}
    ats_keywords_recommended = Column(JSON, default=list)
    ats_keywords_missing = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="resume_reviews")
