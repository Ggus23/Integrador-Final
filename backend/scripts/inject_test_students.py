import logging
import os
import random
import sys
from datetime import datetime, timedelta

# Add the parent directory to sys.path to allow importing app modules
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.core.security import get_password_hash
from app.db.session import SessionLocal
from app.models.assessment import Assessment
from app.models.assessment_response import AssessmentResponse
from app.models.consent import Consent
from app.models.emotional_checkin import EmotionalCheckin
from app.models.risk_summary import RiskSummary
from app.models.user import User, UserRole
from app.services.assessment_service import assessment_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_student_profile(db, email_prefix, risk_profile, num_checkins=10):
    email = f"{email_prefix}@estudiante.mentalink.edu"
    logger.info(f"Creating profile: {email} [Profile: {risk_profile}]")

    # 1. Create User
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            full_name=f"Estudiante {risk_profile.capitalize()}",
            email=email,
            hashed_password=get_password_hash("Test1234!"),
            role=UserRole.STUDENT,
            is_active=True,
            is_email_verified=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Add Consent
        consent = Consent(user_id=user.id, has_accepted=True)
        db.add(consent)
        db.commit()

    # 2. Generate Check-in History
    # Clear existing checkins for this user to avoid duplicates if re-running
    db.query(EmotionalCheckin).filter(EmotionalCheckin.user_id == user.id).delete()

    base_date = datetime.now() - timedelta(days=num_checkins)

    for i in range(num_checkins):
        date = base_date + timedelta(days=i)

        # Profile Logic
        if risk_profile == "bajo":
            mood = random.choices([4, 5], weights=[0.4, 0.6])[0]
            pressure = random.choices([1, 2], weights=[0.7, 0.3])[0]
            sleep = random.randint(7, 9)

        elif risk_profile == "medio":
            # Mixed mood to create some "bad days" but not enough for high risk
            # Pressure is consistently high to drive the "Medium" classification via scale
            mood = random.choices([2, 3, 4], weights=[0.3, 0.4, 0.3])[0]
            # High pressure defines this profile
            pressure = random.choices([4, 5], weights=[0.4, 0.6])[0]
            sleep = random.randint(5, 7)

        elif risk_profile == "alto":
            mood = random.choices([1, 2, 3], weights=[0.4, 0.4, 0.2])[0]
            pressure = random.choices([3, 4, 5], weights=[0.2, 0.3, 0.5])[0]
            sleep = random.randint(3, 6)

        checkin = EmotionalCheckin(
            user_id=user.id,
            mood_score=mood,
            academic_pressure=pressure,
            sleep_hours=sleep,
            note=f"Auto-generated checkin day {i}",
            created_at=date,
        )
        db.add(checkin)

    db.commit()

    # 3. Simulate Assessment Response (PSS-10) to trigger Risk Calculation
    pss = db.query(Assessment).filter(Assessment.type == "PSS-10").first()
    if pss:
        # Answers based on profile
        if risk_profile == "bajo":
            score_val = 1  # Low stress answers
        elif risk_profile == "medio":
            score_val = 2  # Moderate
        else:
            score_val = 3  # High

        answers = {item["id"]: score_val for item in pss.items}

        # Create a schema-like object or call service logic directly?
        # Let's verify service logic. AssessmentService needs a Pydantic model for input usually.
        # But we can manually invoke the logic or just insert the record and call logic.

        # Let's insert record manually but trigger the logic
        # We need to calculate risk to update Summary
        score_total = sum(answers.values())  # Simple sum for mock

        # This part re-uses the logic we want to test!
        # Context: predict_risk needs (pss_score, checkin_avg, bad_days, pressure_avg)

        # Let's try to simulate a service call if possible, or replicate the logic here to "seed" the state
        # Better yet: Create risk summary manually to reflect what we expect,
        # OR simulate a "fresh" assessment taking right now.

        from app.schemas.assessment_response import AssessmentResponseCreate

        try:
            # We mock the schema input
            response_in = AssessmentResponseCreate(
                assessment_id=pss.id, answers=answers
            )

            # Call the service! This tests the ACTUAL backend logic.
            assessment_service.process_response(db, user.id, response_in)
            logger.info(f" -> Processed assessment for {email}")

        except Exception as e:
            logger.error(f"Failed to process assessment for {email}: {e}")


def main():
    db = SessionLocal()
    try:
        logger.info("--- Starting Bulk Data Injection ---")

        # 1. Seed base assessments if missing
        # (Assuming seed_data.py ran, but harmless to rely on DB state)

        # 2. Create Profiles
        # 20 Low Risk
        for i in range(20):
            create_student_profile(db, f"student_low_{i}", "bajo")

        # 20 Medium Risk (Academic Pressure)
        for i in range(20):
            create_student_profile(db, f"student_med_{i}", "medio")

        # 10 High Risk (Crisis)
        for i in range(10):
            create_student_profile(db, f"student_high_{i}", "alto")

        logger.info("--- Data Injection Complete ---")
        logger.info("Login with student_high_0@estudiante.mentalink.edu / Test1234!")

    finally:
        db.close()


if __name__ == "__main__":
    main()
