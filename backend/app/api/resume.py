from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Profile, Skill, Education, Experience, StudentProject, Certification
from app.schemas import ResumeUploadResponse, ResumeParsedData
from app.services.resume_parser import extract_text_from_file
from app.services.gemini_client import AIServiceLayer
from app.api.deps import get_current_user

router = APIRouter(prefix="/resume", tags=["Resume Processing"])

SAMPLE_RESUME_TEXT = """ALEX MORGAN
alex.morgan@university.edu | +1 (555) 321-7890 | San Francisco, CA
GitHub: github.com/alexmorgan-dev | LinkedIn: linkedin.com/in/alexmorgan

EDUCATION
State University of Technology (2022 - 2026)
Bachelor of Technology in Computer Science and Engineering
CGPA: 8.8 / 10.0
Relevant Coursework: Data Structures & Algorithms, Database Management Systems, Distributed Operating Systems, Web Architecture.

TECHNICAL SKILLS
- Languages: Python, JavaScript, TypeScript, C++, SQL
- Frameworks: React, Next.js, FastAPI, Node.js, Express
- Databases & Cloud: PostgreSQL, MongoDB, Redis, Docker, AWS (S3, EC2)
- Developer Tools: Git, Linux, Postman, Jest, GitHub Actions

WORK EXPERIENCE
Apex Cloud Solutions | Backend Engineering Intern (Jun 2024 - Aug 2024)
- Architected RESTful microservice in Python (FastAPI) handling telemetry data ingestion.
- Implemented asynchronous database queries using SQLAlchemy and PostgreSQL, reducing latency by 32%.
- Integrated Redis cache for hot endpoints, improving response throughput from 120 req/s to 450 req/s.
- Containerized application with Docker and established automated linting/testing in GitHub Actions.

PROJECTS
1. CampusFlow - Collaborative Student Platform (Next.js, FastAPI, PostgreSQL, Tailwind)
- Developed responsive web app enabling 1,200+ students to exchange notes and collaborate in study rooms.
- Created real-time notification engine with WebSockets and JWT-secured role authentication.
- Deployed on AWS with automated SSL and CI/CD pipelines.

2. Distributed Key-Value Store & Cache (Python, AsyncIO, Sockets)
- Built multi-client asynchronous key-value server with LRU eviction and memory threshold monitoring.
- Achieved sub-5ms lookup latency with snapshot persistence to disk.

CERTIFICATIONS & ACHIEVEMENTS
- AWS Certified Cloud Practitioner (2024)
- 1st Place - University Hackathon 2024 (Built AI Study Copilot)
- Solved 350+ LeetCode problems (Top 15% Contest Rating)
"""

def populate_profile_from_parsed(profile: Profile, parsed: dict, raw_text: str, db: Session):
    """Stores parsed AI data into Profile and relations with source='ai_extracted'."""
    profile.raw_resume_text = raw_text
    if parsed.get("full_name"):
        profile.full_name = parsed["full_name"]
    if parsed.get("email"):
        profile.email = parsed["email"]
    if parsed.get("phone"):
        profile.phone = parsed["phone"]
    if parsed.get("bio"):
        profile.bio = parsed["bio"]
    if parsed.get("target_career_hint"):
        profile.target_career = parsed["target_career_hint"]
    if parsed.get("interests"):
        profile.career_interests = parsed["interests"]

    # Clear prior AI extracted items to avoid duplicates
    db.query(Skill).filter(Skill.profile_id == profile.id, Skill.source == "ai_extracted").delete()
    db.query(Education).filter(Education.profile_id == profile.id, Education.source == "ai_extracted").delete()
    db.query(Experience).filter(Experience.profile_id == profile.id, Experience.source == "ai_extracted").delete()
    db.query(StudentProject).filter(StudentProject.profile_id == profile.id, StudentProject.source == "ai_extracted").delete()
    db.query(Certification).filter(Certification.profile_id == profile.id, Certification.source == "ai_extracted").delete()

    # Add Skills
    for s in parsed.get("skills", []):
        name = s.get("name") if isinstance(s, dict) else str(s)
        category = s.get("category", "Technical") if isinstance(s, dict) else "Technical"
        proficiency = s.get("proficiency", "Intermediate") if isinstance(s, dict) else "Intermediate"
        db.add(Skill(
            profile_id=profile.id,
            name=name,
            category=category,
            proficiency=proficiency,
            source="ai_extracted"
        ))

    # Add Educations
    for e in parsed.get("education", []):
        db.add(Education(
            profile_id=profile.id,
            institution=e.get("institution", "University"),
            degree=e.get("degree"),
            branch_or_field=e.get("branch_or_field"),
            start_year=e.get("start_year"),
            end_year=e.get("end_year"),
            grade=e.get("grade"),
            source="ai_extracted"
        ))

    # Add Experiences
    for x in parsed.get("experience", []):
        db.add(Experience(
            profile_id=profile.id,
            title=x.get("title", "Intern"),
            company=x.get("company", "Company"),
            role_type=x.get("role_type", "Internship"),
            duration=x.get("duration"),
            description=x.get("description"),
            technologies=x.get("technologies", []),
            source="ai_extracted"
        ))

    # Add Projects
    for p in parsed.get("projects", []):
        db.add(StudentProject(
            profile_id=profile.id,
            title=p.get("title", "Project"),
            description=p.get("description"),
            technologies=p.get("technologies", []),
            link=p.get("link"),
            source="ai_extracted"
        ))

    # Add Certifications
    for c in parsed.get("certifications", []):
        db.add(Certification(
            profile_id=profile.id,
            name=c.get("name", "Certification"),
            issuer=c.get("issuer"),
            issue_date=c.get("issue_date"),
            credential_url=c.get("credential_url"),
            source="ai_extracted"
        ))

    db.commit()
    db.refresh(profile)

@router.post("/upload", response_model=ResumeUploadResponse)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """FR-RES-1 to FR-RES-6: File upload, text extraction, Gemini structured analysis, DB storage."""
    contents = await file.read()
    raw_text = extract_text_from_file(file, contents)
    
    # Run structured AI extraction via Service Layer
    parsed_dict = AIServiceLayer.extract_resume_data(raw_text)
    
    # Store in DB
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
        
    populate_profile_from_parsed(profile, parsed_dict, raw_text, db)
    
    return ResumeUploadResponse(
        message=f"Resume '{file.filename}' successfully analyzed by Gemini AI and stored.",
        extracted_text_preview=raw_text[:400] + ("..." if len(raw_text) > 400 else ""),
        parsed_profile=ResumeParsedData(**parsed_dict),
        applied=True
    )

@router.post("/sample-demo", response_model=ResumeUploadResponse)
def load_sample_resume(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """1-Click Sample Resume Demo for fast hackathon evaluation (Section 10.2)."""
    raw_text = SAMPLE_RESUME_TEXT
    parsed_dict = AIServiceLayer.extract_resume_data(raw_text)
    
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
        
    populate_profile_from_parsed(profile, parsed_dict, raw_text, db)
    
    return ResumeUploadResponse(
        message="Demo CS Student resume successfully parsed and profile populated.",
        extracted_text_preview=raw_text[:400] + "...",
        parsed_profile=ResumeParsedData(**parsed_dict),
        applied=True
    )

@router.get("/sample-text")
def get_sample_text():
    return {"text": SAMPLE_RESUME_TEXT}
