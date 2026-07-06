from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Knowledge Assistant"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str
    
    # Security
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # AI & API Keys
    GEMINI_API_KEY: str
    OPENAI_API_KEY: str | None = None
    
    # Services
    REDIS_URL: str
    CHROMA_PATH: str = "./chroma_db"
    
    # Config
    UPLOAD_DIRECTORY: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 52428800
    ALLOWED_FILE_TYPES: str = "pdf,docx,txt,pptx,csv,md,png,jpeg,zip"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
