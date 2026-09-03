"""
Script to seed historical AI predictions (telemetry) for all students in the database.
This populates the 'ai_predictions' table so that the Grafana dashboard has realistic,
complete data for all users rather than just a single student.

Usage:
    python scripts/seed_ai_predictions.py
"""

import os
import random
import sys
from datetime import datetime, timedelta

# Add parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.models import AcademicProfile, RiskSummary, User, UserRole
from app.models.ai_prediction import AIPrediction

# Database connection
DATABASE_URL = settings.SQLALCHEMY_DATABASE_URI
engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def seed_predictions():
    db = SessionLocal()
    try:
        # 1. Fetch all student users
        students = db.query(User).filter(User.role == UserRole.STUDENT).all()
        if not students:
            print(
                "⚠️ No student users found in the database. Please run seed_data or generate_test_users first."
            )
            return

        print(f"✓ Found {len(students)} student users in the database.")

        # 2. Clear old predictions
        print("🔄 Clearing existing predictions in 'ai_predictions' table...")
        db.execute(text("TRUNCATE TABLE ai_predictions RESTART IDENTITY CASCADE;"))
        db.commit()
        print("✓ Table cleared.")

        # 3. Generate predictions for each student over the last 30 days
        print("🚀 Generating historical prediction records...")

        predictions_to_insert = []
        now = datetime.utcnow()

        faculties = ["Ingeniería en Sistemas", "Psicología", "Medicina"]

        count = 0
        for student in students:
            # Determine profile details
            profile = (
                db.query(AcademicProfile)
                .filter(AcademicProfile.user_id == student.id)
                .first()
            )
            risk_summary = (
                db.query(RiskSummary).filter(RiskSummary.user_id == student.id).first()
            )

            # Determine or assign facultad
            facultad = (
                profile.course
                if profile and profile.course
                else random.choice(faculties)
            )

            # Determine GPA
            gpa = (
                profile.current_gpa
                if profile and profile.current_gpa
                else random.uniform(60.0, 95.0)
            )

            # Determine failed classes
            failed_classes_val = (
                random.randint(0, 3) if not profile else random.randint(0, 2)
            )

            # Determine risk level
            if risk_summary and risk_summary.current_risk_level:
                risk_level = risk_summary.current_risk_level.upper()
            elif profile:
                if gpa < 70:
                    risk_level = "HIGH"
                elif gpa < 82:
                    risk_level = "MEDIUM"
                else:
                    risk_level = "LOW"
            else:
                risk_level = random.choice(["LOW", "MEDIUM", "HIGH"])

            # Generate multiple points in time (e.g. 10 time periods over the last 30 days)
            for day_offset in range(30, -1, -3):  # every 3 days
                pred_time = now - timedelta(
                    days=day_offset,
                    hours=random.randint(0, 23),
                    minutes=random.randint(0, 59),
                )

                # --- 1. RiskClassifier (Emotional Risk Prediction) ---
                # Vary mood and stress slightly over time
                if risk_level == "HIGH":
                    pss_score = random.uniform(27.0, 38.0)
                    mood_avg = random.uniform(1.2, 2.3)
                    gad_score = random.uniform(11.0, 20.0)
                    phq_score = random.uniform(12.0, 24.0)
                    pred_risk = "HIGH"
                elif risk_level == "MEDIUM":
                    pss_score = random.uniform(14.0, 26.0)
                    mood_avg = random.uniform(2.4, 3.7)
                    gad_score = random.uniform(5.0, 10.0)
                    phq_score = random.uniform(6.0, 11.0)
                    pred_risk = "MEDIUM"
                else:  # LOW
                    pss_score = random.uniform(4.0, 13.0)
                    mood_avg = random.uniform(3.8, 4.9)
                    gad_score = random.uniform(0.0, 4.0)
                    phq_score = random.uniform(0.0, 5.0)
                    pred_risk = "LOW"

                # Add some random walk/fluctuation
                pss_score = max(0.0, min(40.0, pss_score + random.uniform(-2, 2)))
                mood_avg = max(1.0, min(5.0, mood_avg + random.uniform(-0.4, 0.4)))

                risk_pred = AIPrediction(
                    user_id=student.id,
                    model_name="RiskClassifier",
                    model_version="v1",
                    pss_score=round(pss_score, 2),
                    mood_avg=round(mood_avg, 2),
                    gad_score=round(gad_score, 2),
                    phq_score=round(phq_score, 2),
                    confidence=round(random.uniform(0.82, 0.98), 2),
                    risk_level=pred_risk,
                    facultad=facultad,
                    created_at=pred_time,
                )
                predictions_to_insert.append(risk_pred)

                # --- 2. DropoutPredictor (Dropout Risk Prediction) ---
                # Check-in and test scores used in dropout prediction
                if risk_level == "HIGH":
                    dropout_prob = random.uniform(0.60, 0.89)
                    checkin_score = random.uniform(1.5, 2.5)
                    test_score = random.uniform(50.0, 68.0)
                    pred_risk = "HIGH"
                elif risk_level == "MEDIUM":
                    dropout_prob = random.uniform(0.20, 0.55)
                    checkin_score = random.uniform(2.6, 3.8)
                    test_score = random.uniform(69.0, 81.0)
                    pred_risk = "MEDIUM"
                else:  # LOW
                    dropout_prob = random.uniform(0.02, 0.15)
                    checkin_score = random.uniform(3.9, 4.9)
                    test_score = random.uniform(82.0, 98.0)
                    pred_risk = "LOW"

                dropout_pred = AIPrediction(
                    user_id=student.id,
                    model_name="DropoutPredictor",
                    model_version="v1.2",
                    gpa=round(gpa, 2),
                    enrolled_credits=semester_credits(profile),
                    failed_classes=failed_classes_val,
                    checkin_score=round(checkin_score, 2),
                    test_score=round(test_score, 2),
                    dropout_probability=round(dropout_prob, 2),
                    confidence=round(random.uniform(0.85, 0.97), 2),
                    risk_level=pred_risk,
                    facultad=facultad,
                    created_at=pred_time + timedelta(hours=1),  # slightly offset
                )
                predictions_to_insert.append(dropout_pred)

                # --- 3. SentimentCNN (Sentiment Analysis from Diaries/Text) ---
                if risk_level == "HIGH":
                    sentiment = random.choices(
                        ["ANXIETY", "SAD", "ANGER", "NEUTRAL", "HAPPY"],
                        weights=[45, 35, 10, 8, 2],
                    )[0]
                elif risk_level == "MEDIUM":
                    sentiment = random.choices(
                        ["NEUTRAL", "ANXIETY", "HAPPY", "SAD", "ANGER"],
                        weights=[40, 25, 20, 10, 5],
                    )[0]
                else:  # LOW
                    sentiment = random.choices(
                        ["HAPPY", "NEUTRAL", "ANXIETY", "SAD", "ANGER"],
                        weights=[70, 18, 8, 3, 1],
                    )[0]

                sentiment_pred = AIPrediction(
                    user_id=student.id,
                    model_name="SentimentCNN",
                    model_version="v2.0-cnn",
                    sentiment=sentiment,
                    confidence=round(random.uniform(0.88, 0.99), 2),
                    risk_level=risk_level,
                    facultad=facultad,
                    created_at=pred_time + timedelta(hours=2),  # offset
                )
                predictions_to_insert.append(sentiment_pred)

            count += 1
            if count % 20 == 0:
                print(f"  Processed {count}/{len(students)} students...")

        # Bulk insert to be extremely fast
        print(
            f"📥 Bulk saving {len(predictions_to_insert)} prediction records to PostgreSQL..."
        )
        db.bulk_save_objects(predictions_to_insert)
        db.commit()
        print(
            f"✅ Seeding completed! Successfully generated {len(predictions_to_insert)} AI predictions across {len(students)} students."
        )

    except Exception as e:
        db.rollback()
        print(f"❌ Error during seeding: {e}")
    finally:
        db.close()


def semester_credits(profile):
    if not profile or not profile.current_semester:
        return 20
    return profile.current_semester * 20


if __name__ == "__main__":
    print("🌟 MenTaLink - AI Predictions Seeder 🌟")
    seed_predictions()
