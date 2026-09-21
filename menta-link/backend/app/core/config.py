import json
from typing import List, Union

from pydantic import (
    AliasChoices,
    Field,
    ValidationInfo,
    field_validator,
    model_validator,
)
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", case_sensitive=True, extra="ignore"
    )

    PROJECT_NAME: str = Field(
        default="MENTALINK", validation_alias=AliasChoices("PROJECT_NAME", "APP_NAME")
    )
    API_V1_STR: str = "/api/v1"
    APP_ENV: str = "development"
    FRONTEND_BASE_URL: str | None = None
    ALEMBIC_RUNNING: bool = False

    SECRET_KEY: str = Field(
        default="development-only-secret-key-change-in-production",
        validation_alias=AliasChoices("SECRET_KEY", "JWT_SECRET_KEY"),
    )
    ALGORITHM: str = Field(
        default="HS256", validation_alias=AliasChoices("ALGORITHM", "JWT_ALGORITHM")
    )
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    SENTRY_DSN: str | None = None

    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgresql"
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

    @field_validator("FRONTEND_BASE_URL", mode="before")
    @classmethod
    def normalize_frontend_base_url(cls, value: str | None) -> str | None:
        if not value:
            return value
        normalized = value.strip().rstrip("/")
        if not normalized.startswith(("http://", "https://")):
            normalized = f"https://{normalized}"
        return normalized

    # Se usa List[str] para evitar fallos estrictos de validación con barras finales o puertos
    BACKEND_CORS_ORIGINS: Union[List[str], str] = []

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            v = v.strip()
            if not v:
                return []
            if v.startswith("[") and v.endswith("]"):
                try:
                    parsed = json.loads(v)
                    if isinstance(parsed, list):
                        return [str(item).strip().rstrip("/") for item in parsed]
                except Exception:
                    pass
            return [i.strip().rstrip("/") for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return [str(item).strip().rstrip("/") for item in v]
        return []

    EMAIL_ENABLED: bool = False
    SMTP_TLS: bool = True
    SMTP_PORT: int | None = 587
    SMTP_HOST: str | None = None
    SMTP_USER: str | None = None
    SMTP_PASSWORD: str | None = None
    BREVO_API_KEY: str | None = None
    EMAILS_FROM_EMAIL: str | None = None
    EMAILS_FROM_NAME: str = "MENTA-LINK"
    EMAILS_CABINET_EMAIL: str = "cabinet@unifranz.edu.bo"

    ML_MODEL_PATH: str = "app/models/risk_model.pkl"
    GEMINI_API_KEY: str = ""
    HF_TOKEN: str = ""

    # ----------------------------------------------------------------
    # SMS / OTP (verificación por celular)
    # ----------------------------------------------------------------
    SMS_ENABLED: bool = False
    SMS_PROVIDER: str = "infobip"
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_FROM_NUMBER: str = ""
    INFOBIP_BASE_URL: str = ""
    INFOBIP_API_KEY: str = ""
    INFOBIP_FROM_NUMBER: str = "MENTALINK"
    OTP_EXPIRE_MINUTES: int = 10

    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, value: str, info: ValidationInfo) -> str:
        if len(value) < 32:
            raise ValueError("SECRET_KEY must contain at least 32 characters")
        return value

    @model_validator(mode="after")
    def validate_production_secrets(self) -> "Settings":
        if self.APP_ENV.lower() == "production":
            if self.SECRET_KEY == "development-only-secret-key-change-in-production":
                raise ValueError("SECRET_KEY must be configured in production")
            if not self.FRONTEND_BASE_URL and not self.ALEMBIC_RUNNING:
                raise ValueError("FRONTEND_BASE_URL must be configured in production")
        return self


settings = Settings()
