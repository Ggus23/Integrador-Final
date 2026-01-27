import logging

from sqlalchemy import text

from app.db.session import SessionLocal

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_notes_table():
    db = SessionLocal()
    try:
        # Check if table exists
        check_query = text(
            """
            SELECT to_regclass('public.clinical_notes');
        """
        )
        result = db.execute(check_query).fetchone()

        if not result[0]:
            logger.info("Table 'clinical_notes' not found. Creating it...")
            create_table_query = text(
                """
                CREATE TABLE clinical_notes (
                    id SERIAL PRIMARY KEY,
                    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    psychologist_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                    content TEXT NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE
                );
                CREATE INDEX ix_clinical_notes_student_id ON clinical_notes (student_id);
                CREATE INDEX ix_clinical_notes_id ON clinical_notes (id);
            """
            )
            db.execute(create_table_query)
            db.commit()
            logger.info("Table 'clinical_notes' created successfully.")
        else:
            logger.info("Table 'clinical_notes' already exists.")

    except Exception as e:
        logger.error(f"Error updating database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    create_notes_table()
