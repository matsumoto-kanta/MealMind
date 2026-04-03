from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str

    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60  # 60分（1時間）

    # Session
    SESSION_SECRET_KEY: str  # セッション用の秘密鍵（JWTとは別）

    # Google OAuth
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_REDIRECT_URI: str

    # Frontend
    FRONTEND_URL: str

    # Gemini API
    GEMINI_API_KEY: str

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
