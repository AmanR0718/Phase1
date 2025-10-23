from pydantic import BaseSettings

class Settings(BaseSettings):
    MONGO_URI: str = "mongodb://localhost:27017"
    MONGO_DB: str = "zambian_farmer_db"
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 10080   # ✅ Add this line
    SEED_ADMIN_EMAIL: str = "admin@agrimanage.com"
    SEED_ADMIN_PASSWORD: str = "admin123"

    class Config:
        env_file = "../.env"

settings = Settings()
