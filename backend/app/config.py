from pydantic import BaseSettings

class Settings(BaseSettings):
    # MongoDB
    MONGODB_URL: str = "mongodb://mongo:27017"
    MONGODB_DB_NAME: str = "zambian_farmer_db"

    # JWT
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Redis
    REDIS_URL: str = "redis://redis:6379/0"

    # Admin Seeder
    SEED_ADMIN_EMAIL: str
    SEED_ADMIN_PASSWORD: str

    # App
    UPLOAD_DIR: str = "./uploads"
    DEBUG: bool = True

    class Config:
        env_file = ".env"

settings = Settings()
