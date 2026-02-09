from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROXY_BASE_URL: str = "http://localhost:8001/q/"
    FRONTEND_URL: str = "http://localhost:5173"
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "qr360"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    UPLOAD_DIR: str = "uploads"
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
