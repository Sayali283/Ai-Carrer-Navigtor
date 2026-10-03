import os
from typing import List, Dict
from pydantic import Field
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "AI Student Career Navigator"
    APP_ENV: str = os.getenv("APP_ENV", "development")
    API_V1_PREFIX: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./career_navigator.db")
    
    # Security
    JWT_SECRET: str = Field(min_length=32)
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ]
    
    # Gemini AI
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    GEMINI_TEMPERATURE: float = 0.3
    GEMINI_MAX_RETRIES: int = 2
    
    # File limits
    MAX_RESUME_SIZE_MB: int = 10
    ALLOWED_EXTENSIONS: List[str] = [".pdf", ".docx"]
    
    # Configurable Scoring Weights (FR-CAR-5 / Appendix A #3)
    SCORING_WEIGHTS: Dict[str, float] = {
        "technical_skills": 0.35,
        "projects": 0.25,
        "education": 0.15,
        "experience": 0.15,
        "interests": 0.10,
    }

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
