from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "AetherFlow Enterprise"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "aetherflow_jwt_secret_key_2026_enterprise_phase_1"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    DATABASE_URL: str = "postgresql+asyncpg://postgres:aetherflow_pass@localhost:5432/aetherflow"
    FRONTEND_URL: str = "http://localhost:5173"
    SEED_DEMO_DATA: bool = False

    # Supabase Integration keys
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    GROQ_API_KEY: str = ""

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"

settings = Settings()
