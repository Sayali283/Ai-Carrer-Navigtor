from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.api import (
    auth, profile, resume, career, skill_gap,
    roadmap, assessment, simulator, job_matcher,
    project, resume_review
)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="Backend AI API Service Layer for AI Student Career Navigator",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration (NFR-SEC-5)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS + ["*"],  # Allows local dev port flexibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
api_prefix = settings.API_V1_PREFIX
app.include_router(auth.router, prefix=api_prefix)
app.include_router(profile.router, prefix=api_prefix)
app.include_router(resume.router, prefix=api_prefix)
app.include_router(career.router, prefix=api_prefix)
app.include_router(skill_gap.router, prefix=api_prefix)
app.include_router(roadmap.router, prefix=api_prefix)
app.include_router(assessment.router, prefix=api_prefix)
app.include_router(simulator.router, prefix=api_prefix)
app.include_router(job_matcher.router, prefix=api_prefix)
app.include_router(project.router, prefix=api_prefix)
app.include_router(resume_review.router, prefix=api_prefix)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "gemini_model": settings.GEMINI_MODEL,
        "gemini_configured": bool(settings.GEMINI_API_KEY)
    }

@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.APP_NAME} API Service Layer",
        "docs": "/docs",
        "version": "1.0.0"
    }
