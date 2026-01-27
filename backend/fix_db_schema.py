import logging

from sqlalchemy import text

from app.db.session import SessionLocal

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def add_column_if_not_exists():
    db = SessionLocal()
    try:
        # Check if column exists
        check_query = text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='must_change_password';
        """)
        result = db.execute(check_query).fetchone()

        if not result:
            logger.info("Column 'must_change_password' not found. Adding it...")
            add_column_query = text("""
                ALTER TABLE users 
                ADD COLUMN must_change_password BOOLEAN DEFAULT FALSE;
            """)
            db.execute(add_column_query)
            db.commit()
            logger.info("Column added successfully.")
        else:
            logger.info("Column 'must_change_password' already exists.")

    except Exception as e:
        logger.error(f"Error updating database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    add_column_if_not_exists()
