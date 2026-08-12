from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# Garantiza formato string y corrige la compatibilidad de Railway con SQLAlchemy
db_url = str(settings.SQLALCHEMY_DATABASE_URI)
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# Create the SQLAlchemy engine.
engine = create_engine(
    db_url,
    pool_pre_ping=True,
)

# SessionLocal is a factory for database sessions.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)