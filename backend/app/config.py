# backend/app/config.py
from pydantic import BaseSettings, Field
from functools import lru_cache
import os


class Settings(BaseSettings):
    # ======================================
    # MongoDB
    # ======================================
    MONGODB_URL: str = Field(..., env="MONGODB_URL")
    MONGODB_DB_NAME: str = Field(..., env="MONGODB_DB_NAME")

    # ======================================
    # JWT + Security
    # ======================================
    JWT_SECRET: str = Field(..., env="JWT_SECRET")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    SECRET_KEY: str = Field(..., env="SECRET_KEY")

    # ======================================
    # Redis / Celery
    # ======================================
    REDIS_URL: str = Field(default="redis://farmer-redis:6379/0", env="REDIS_URL")

    # ======================================
    # Admin Seeder
    # ======================================
    SEED_ADMIN_EMAIL: str = Field(..., env="SEED_ADMIN_EMAIL")
    SEED_ADMIN_PASSWORD: str = Field(..., env="SEED_ADMIN_PASSWORD")

    # ======================================
    # Application settings
    # ======================================
    DEBUG: bool = Field(default=True)
    UPLOAD_DIR: str = Field(default="/app/uploads", env="UPLOAD_DIR")
    MAX_UPLOAD_SIZE_MB: int = Field(default=10)
    CORS_ORIGINS: list[str] = Field(
        default=["http://localhost:8000", "http://localhost:5173", "*"]
    )

    class Config:
        env_file = os.path.join(os.path.dirname(__file__), "../.env")
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Cached settings loader"""
    return Settings()


settings = get_settings()
# Usage:
# from app.config import settings
# print(settings.MONGODB_URL)   
