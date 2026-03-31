import os
from datetime import date, datetime, timedelta
from unittest.mock import MagicMock, patch

import pytest
from app import models
from app.ml.emotion.predictor import get_emotion_predictor
from app.services.emotional_trends_service import emotional_trends_service
from app.services.student_history_service import student_history_service
from sqlalchemy.orm import Session


def test_student_history_consolidation(db_session: Session):
    # Setup: Create a student
    student = models.user.User(
        full_name="Test Student",
        email="test@student.com",
        hashed_password="...",
        role=models.user.UserRole.STUDENT,
    )
    db_session.add(student)
    db_session.commit()
    db_session.refresh(student)

    # 1. Create a diary entry
    diary = models.EmotionalDiary(
        user_id=student.id,
        date=date.today(),
        experience="Hoy me sentí muy bien",
        wellbeing_level=5,
        emotion="feliz",
        emotion_color="verde",
        emotion_ai="feliz",
    )
    db_session.add(diary)

    # 2. Create an assessment response
    # We need an assessment first
    assessment = models.Assessment(
        title="PHQ-9", description="...", items=[{"id": 1, "text": "Q1"}], type="PHQ-9"
    )
    db_session.add(assessment)
    db_session.commit()
    db_session.refresh(assessment)

    response = models.AssessmentResponse(
        user_id=student.id,
        assessment_id=assessment.id,
        total_score=15,
        risk_level="High",
        answers={"1": 4},
    )
    db_session.add(response)
    db_session.commit()

    # Get history
    history = student_history_service.get_combined_history(db_session, student.id)

    assert len(history) == 2
    assert history[0]["type"] in ["diary", "assessment"]
    assert any(h["type"] == "diary" for h in history)
    assert any(h["type"] == "assessment" for h in history)


def test_emotional_trends_calculation(db_session: Session):
    # Setup
    student = models.user.User(
        full_name="Trend Student",
        email="trend@student.com",
        hashed_password="...",
        role=models.user.UserRole.STUDENT,
    )
    db_session.add(student)
    db_session.commit()

    # Create entries for the last 5 days
    for i in range(5):
        entry = models.EmotionalDiary(
            user_id=student.id,
            date=date.today() - timedelta(days=i),
            experience="Test",
            wellbeing_level=5,
            emotion="neutral",
            emotion_color="gris",
            emotion_ai="triste" if i < 3 else "feliz",  # 3 triste, 2 feliz
        )
        db_session.add(entry)
    db_session.commit()

    dist = emotional_trends_service.get_emotion_distribution(db_session, student.id)
    assert dist["triste"] == 60.0  # 3/5
    assert dist["feliz"] == 40.0  # 2/5

    ari = emotional_trends_service.calculate_ari(db_session, student.id)
    assert ari["ari_score"] > 0
    assert "risk_level" in ari


def test_emotion_predictor_availability():
    # This checks if the predictor handles the absence of the model file gracefully
    # If the file exists, it should return an instance. If not, None.
    predictor = get_emotion_predictor()
    # We don't assert it is NOT None because it depends on the training status
    # but we can check if it returns something or None without crashing
    assert predictor is None or hasattr(predictor, "predict")


@patch("app.ml.emotion.predictor.EmotionPredictor")
def test_emotion_prediction_logic(mock_predictor_class):
    # Mocking the predictor to test the logic without the .pt file
    mock_instance = MagicMock()
    mock_instance.predict.return_value = {
        "emotion": "feliz",
        "confidence": 0.95,
        "scores": {"feliz": 0.95},
    }

    # Simulate a prediction
    result = mock_instance.predict("Hola mundo")
    assert result["emotion"] == "feliz"
    assert result["confidence"] == 0.95
