import logging
import sys
from pathlib import Path

# Add backend directory to path to allow imports from app
backend_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(backend_dir))

from app.db.session import SessionLocal

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def load_data():
    db = SessionLocal()
    try:
        logger.info("Creating initial data...")
        # init_db(db) # Call init_db from app/db/init_db.py
        logger.info("Initial data created.")
    finally:
        db.close()


if __name__ == "__main__":
    load_data()
