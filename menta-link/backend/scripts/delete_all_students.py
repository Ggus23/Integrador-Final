import logging
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy import text

from app.db.session import SessionLocal

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DELETE_TABLES = [
    ("email_verification_tokens", "user_id"),
    ("password_reset_tokens", "user_id"),
    ("ai_predictions", "user_id"),
    ("clinical_notes", "student_id"),
    ("appointments", "user_id"),
    ("emotional_diary", "user_id"),
    ("emotional_checkins", "user_id"),
    ("assessment_responses", "user_id"),
    ("risk_summaries", "user_id"),
    ("alerts", "user_id"),
    ("academic_subject_grades", "user_id"),
    ("academic_records", "user_id"),
    ("academic_profiles", "user_id"),
    ("consents", "user_id"),
]


def delete_all_students(db):
    # Uppercase enum value as stored in PostgreSQL
    rows = db.execute(
        text("SELECT id FROM users WHERE role = 'STUDENT'")
    ).all()
    ids = tuple(r[0] for r in rows)

    if not ids:
        logger.info("No se encontraron estudiantes para eliminar.")
        return 0

    logger.info(f"Se encontraron {len(ids)} estudiantes para eliminar.")

    # Nullify psychologist FKs that reference students
    db.execute(
        text("UPDATE clinical_notes SET psychologist_id = NULL WHERE psychologist_id IN :ids"),
        {"ids": ids},
    )
    db.execute(
        text("UPDATE appointments SET psychologist_id = NULL WHERE psychologist_id IN :ids"),
        {"ids": ids},
    )

    # Delete from child tables
    for table, fk_column in DELETE_TABLES:
        result = db.execute(
            text(f"DELETE FROM {table} WHERE {fk_column} IN :ids"),
            {"ids": ids},
        )
        if result.rowcount > 0:
            logger.info(f"Eliminados {result.rowcount} registros de {table}")

    # Delete users
    result = db.execute(
        text("DELETE FROM users WHERE id IN :ids AND role = 'STUDENT'"),
        {"ids": ids},
    )
    logger.info(f"Eliminados {result.rowcount} usuarios estudiantes")

    db.commit()
    return len(ids)


def main():
    db = SessionLocal()
    try:
        total = delete_all_students(db)
        logger.info(f"Proceso completado. Total eliminados: {total} estudiantes.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
