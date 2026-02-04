import logging
import os
import sys

# Add parent dir
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.db.session import SessionLocal
from app.models.assessment_response import AssessmentResponse
from app.models.emotional_checkin import EmotionalCheckin
from app.models.risk_summary import RiskSummary
from app.models.user import User
from scripts.inject_test_students import create_student_profile

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def clean_test_data(db):
    logger.info("🧹 Cleaning old test data...")
    # Delete test students
    students = (
        db.query(User)
        .filter(User.email.like("student_%@estudiante.mentalink.edu"))
        .all()
    )
    count = 0
    for s in students:
        # Cascades should handle related data, but let's be safe if not configured
        db.query(EmotionalCheckin).filter(EmotionalCheckin.user_id == s.id).delete()
        db.query(RiskSummary).filter(RiskSummary.user_id == s.id).delete()
        db.query(AssessmentResponse).filter(AssessmentResponse.user_id == s.id).delete()
        db.delete(s)
        count += 1

    db.commit()
    logger.info(f"✨ Deleted {count} old test records.")


def main():
    db = SessionLocal()
    try:
        clean_test_data(db)

        logger.info("🚀 Reinjecting students with NEW MODEL classification logic...")

        # 20 Low Risk
        for i in range(20):
            create_student_profile(db, f"student_low_{i}", "bajo")

        # 20 Medium Risk (The critical ones)
        for i in range(20):
            create_student_profile(db, f"student_med_{i}", "medio")

        # 10 High Risk
        for i in range(10):
            create_student_profile(db, f"student_high_{i}", "alto")

        logger.info("✅ Refresh Complete. Check Dashboard now.")

    finally:
        db.close()


if __name__ == "__main__":
    main()
