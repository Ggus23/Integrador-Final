from typing import List, Union

from pydantic import AnyHttpUrl, ValidationInfo, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", case_sensitive=True, extra="ignore"
    )

    PROJECT_NAME: str = "MENTALINK"
    API_V1_STR: str = "/api/v1"

    SECRET_KEY: str = "your-secret-key-change-it-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    SENTRY_DSN: str | None = None

    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "mentalink"
    
    # Campo para capturar la variable inyectada por Railway
    DATABASE_URL: str | None = None
    SQLALCHEMY_DATABASE_URI: str | None = None

    @field_validator("SQLALCHEMY_DATABASE_URI", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: str | None, info: ValidationInfo) -> str:
        # 1. Si SQLALCHEMY_DATABASE_URI viene explícita en el entorno, usarla
        if isinstance(v, str) and v.strip():
            url = v
        # 2. Si Railway inyectó DATABASE_URL, tomarla
        elif info.data.get("DATABASE_URL"):
            url = info.data.get("DATABASE_URL")
        # 3. Fallback para desarrollo local
        else:
            url = (
                f"postgresql://{info.data.get('POSTGRES_USER')}:"
                f"{info.data.get('POSTGRES_PASSWORD')}"
                f"@{info.data.get('POSTGRES_SERVER')}/"
                f"{info.data.get('POSTGRES_DB')}"
            )

        # Corregir compatibilidad de dialecto para SQLAlchemy v2 (postgres:// -> postgresql://)
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)

        return url

    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    EMAIL_ENABLED: bool = False
    SMTP_TLS: bool = True
    SMTP_PORT: int | None = 587
    SMTP_HOST: str | None = None
    SMTP_USER: str | None = None
    SMTP_PASSWORD: str | None = None
    EMAILS_FROM_EMAIL: str | None = None
    EMAILS_FROM_NAME: str = "MENTA-LINK"
    EMAILS_CABINET_EMAIL: str = "cabinet@unifranz.edu.bo"

    ML_MODEL_PATH: str = "app/models/risk_model.pkl"
    GEMINI_API_KEY: str = ""

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)


settings = Settings()