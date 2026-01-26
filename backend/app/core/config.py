from typing import List, Union

from pydantic import AnyHttpUrl, ValidationInfo, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings and configuration.
    Uses pydantic-settings to automatically load environment variables.
    """

    model_config = SettingsConfigDict(
        env_file=".env", case_sensitive=True, extra="ignore"
    )

    PROJECT_NAME: str = "MENTALINK"
    API_V1_STR: str = "/api/v1"

    # JWT Configuration
    # In a production environment, this should be a long, random, secret string
    SECRET_KEY: str = "your-secret-key-change-it-in-production"
    ALGORITHM: str = "HS256"
    # Token expiration time in minutes
    # Academic Note: Short-lived tokens (30-60 mins) are a security best practice
    # to limit the window of opportunity if a token is intercepted.
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Database Configuration
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "mentalink"
    SQLALCHEMY_DATABASE_URI: str | None = None

    @field_validator("SQLALCHEMY_DATABASE_URI", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: str | None, info: ValidationInfo) -> str:
        """
        Assembles the database connection URI from individual components.
        """
        if isinstance(v, str):
            return v
        return (
            f"postgresql://{info.data.get('POSTGRES_USER')}:"
            f"{info.data.get('POSTGRES_PASSWORD')}"
            f"@{info.data.get('POSTGRES_SERVER')}/"
            f"{info.data.get('POSTGRES_DB')}"
        )

    # Security
    # Origins that are allowed to make cross-origin requests
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    # SMTP Configuration
    SMTP_TLS: bool = True
    SMTP_PORT: int | None = 587
    SMTP_HOST: str | None = None
    SMTP_USER: str | None = None
    SMTP_PASSWORD: str | None = None
    EMAILS_FROM_EMAIL: str | None = None
    EMAILS_FROM_NAME: str = "MENTA-LINK"

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)


settings = Settings()
