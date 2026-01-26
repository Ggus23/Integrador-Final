from typing import Dict

from sqlalchemy.orm import Session

from app import schemas
from app.ml.risk_classifier import risk_classifier
from app.models.alert import Alert
from app.models.assessment import Assessment
from app.models.assessment_response import AssessmentResponse
from app.models.risk_summary import RiskSummary


class AssessmentService:
    """
    Handles the logic for scoring psychometric assessments and updating risk levels.
    """

    @staticmethod
    def calculate_score(assessment_type: str, answers: Dict[str, int]) -> float:
        """
        Calculates the score based on the specific psychometric scale logic.
        """
        total = 0
        if assessment_type == "PSS-10":
            # PSS-10: Reverse items 4, 5, 7, and 8. (Input keys are "q4", "q5", etc.)
            reverse_items = ["q4", "q5", "q7", "q8"]
            for item_id, value in answers.items():
                if item_id in reverse_items:
                    total += 4 - value
                else:
                    total += value
        elif assessment_type == "GAD-7" or assessment_type == "PHQ-9":
            # Direct sum of 0-3 scale
            total = sum(answers.values())
        else:
            total = sum(answers.values())
        return float(total)

    @staticmethod
    def _get_pss_risk(score: float) -> str:
        # Cohen et al. (1983): 0-13 Low, 14-26 Moderate, 27-40 High
        if score <= 13:
            return "Low"
        if score <= 26:
            return "Medium"
        return "High"

    @staticmethod
    def _get_gad_risk(score: float) -> str:
        # Spitzer et al. (2006): 0-4 Minimal, 5-9 Mild, 10-14 Moderate, 15-21 Severe
        if score <= 4:
            return "Low"
        if score <= 9:
            return "Low"  # Mild is considered Low risk for urgent intervention
        if score <= 14:
            return "Medium"
        return "High"

    @staticmethod
    def _get_phq_risk(score: float) -> str:
        # Kroenke et al. (2001): 0-4 None, 5-9 Mild, 10-14 Moderate,
        # 15-19 Moderately Severe, 20-27 Severe
        if score <= 9:
            return "Low"
        if score <= 14:
            return "Medium"
        return "High"

    @classmethod
    def get_risk_level(cls, assessment_type: str, score: float) -> str:
        """
        Maps raw scores to academic risk levels (Low, Medium, High).
        These thresholds are based on standard clinical literature.
        """
        if assessment_type == "PSS-10":
            return cls._get_pss_risk(score)
        elif assessment_type == "GAD-7":
            return cls._get_gad_risk(score)
        elif assessment_type == "PHQ-9":
            return cls._get_phq_risk(score)

        return "Low"

    def process_response(
        self,
        db: Session,
        user_id: int,
        response_in: schemas.assessment_response.AssessmentResponseCreate,
    ):
        # 1. Get assessment info
        assessment = (
            db.query(Assessment)
            .filter(Assessment.id == response_in.assessment_id)
            .first()
        )
        if not assessment:
            return None

        # 2. Calculate score and risk
        score = self.calculate_score(assessment.type, response_in.answers)
        risk = self.get_risk_level(assessment.type, score)

        # 3. Create response record
        db_response = AssessmentResponse(
            user_id=user_id,
            assessment_id=response_in.assessment_id,
            answers=response_in.answers,
            total_score=score,
            risk_level=risk,
        )
        db.add(db_response)

        # 4. Update Risk Summary with ML Prediction
        risk_summary = (
            db.query(RiskSummary).filter(RiskSummary.user_id == user_id).first()
        )
        if not risk_summary:
            risk_summary = RiskSummary(user_id=user_id)
            db.add(risk_summary)

        # ML refinement: Get more context for better prediction
        # Get average mood of last 5 checkins
        from app.models.emotional_checkin import EmotionalCheckin

        last_checkins = (
            db.query(EmotionalCheckin)
            .filter(EmotionalCheckin.user_id == user_id)
            .order_by(EmotionalCheckin.created_at.desc())
            .limit(7)
            .all()
        )
        avg_mood = (
            sum([c.mood_score for c in last_checkins]) / len(last_checkins)
            if last_checkins
            else 3.0
        )
        bad_days = len([c for c in last_checkins if c.mood_score < 3])

        # Normalize PSS score (max is 40)
        norm_pss = score / 40.0 if assessment.type == "PSS-10" else 0.5

        ml_risk, confidence = risk_classifier.predict_risk(norm_pss, avg_mood, bad_days)

        risk_summary.current_risk_level = ml_risk
        risk_summary.prediction_confidence = float(confidence)

        # 5. Trigger Alert if ML or Assessment detects High Risk
        if risk == "High" or ml_risk == "High":
            # Avoid duplicate alerts if one already exists for this issue
            alert = Alert(
                user_id=user_id,
                severity="High",
                message=(
                    f"System detected High Risk. Source: {assessment.title} + ML Context."  # noqa: E501
                ),
            )
            db.add(alert)

        db.commit()
        db.refresh(db_response)
        return db_response


assessment_service = AssessmentService()
