from pydantic_settings import BaseSettings
from pydantic import ConfigDict


class Settings(BaseSettings):
    # Firestore
    FIRESTORE_CREDENTIALS_PATH: str

    # Database (旧設定・移行後削除予定)
    DATABASE_URL: str | None = None

    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60  # 60 minutes
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30  # 30 days (optional)

    # Google OAuth
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_REDIRECT_URI: str

    # Frontend
    FRONTEND_URL: str

    # Gemini API
    GEMINI_API_KEY: str

    # Optional fields
    ENVIRONMENT: str = "development"
    GCP_PROJECT_ID: str | None = None
    OPENAI_API_KEY: str | None = None
    GCS_BUCKET_NAME: str | None = None
    PORT: int = 8000
    LOG_LEVEL: str = "info"

    # Pydantic v2 configuration
    model_config = ConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra='ignore'  # Allow extra fields in .env
    )


settings = Settings()
