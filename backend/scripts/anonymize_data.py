import os
import sys
from datetime import datetime, timedelta

# Add backend to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session  # noqa: E402

from app.db.session import SessionLocal  # noqa: E402
from app.models.user import User, UserRole  # noqa: E402


def anonymize_old_data(db: Session, retention_days: int = 365):
    """
    Anonymizes student data older than retention_days.
    Compliance with SDG Data Minimization principles.
    """
    cutoff_date = datetime.utcnow() - timedelta(days=retention_days)

    print(f"Checking for students created before {cutoff_date.date()}...")

    # Logic: Find students who are inactive or graduated.
    # For prototype, we just check creation date as a proxy for 'old' data.
    students = (
        db.query(User)
        .filter(User.role == UserRole.STUDENT, User.created_at < cutoff_date)
        .all()
    )

    if not students:
        print("No accounts found eligible for anonymization.")
        return

    print(f"Found {len(students)} students to anonymize.")

    for student in students:
        old_email = student.email
        # Anonymization logic
        student.email = f"anonymized_{student.id}@deleted.mentalink"
        student.full_name = "Anonymized User"
        student.is_active = False
        print(f"Anonymizing {old_email} -> {student.email}")

    db.commit()
    print("Anonymization complete.")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        anonymize_old_data(db)
    finally:
        db.close()
