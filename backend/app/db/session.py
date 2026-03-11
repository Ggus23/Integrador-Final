from app.core.config import settings
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Create the SQLAlchemy engine.
# The engine is the main entry point to the database, handling connections and pools.
engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URI,
    # pool_pre_ping=True checks if the connection is alive before using it,
    # preventing "server closed connection" errors.
    pool_pre_ping=True,
)

# SessionLocal is a factory for database sessions.
# each request will get its own session.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
