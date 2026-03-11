import logging
from typing import Dict, Tuple

from sqlalchemy.orm import Session

from app import schemas
from app.core.constants import PHQ9_CRITICAL_ITEM_KEY, RiskLevel
from app.services.alert_service import alert_service
from app.models.assessment import Assessment
from app.models.assessment_response import AssessmentResponse
from app.models.emotional_checkin import EmotionalCheckin
from app.models.risk_summary import RiskSummary
from app.ml.risk_classifier import risk_classifier
from app.services.recommendation_service import recommendation_service

logger = logging.getLogger(__name__)


class AssessmentService:
    @staticmethod
    def calculate_score(assessment_type: str, answers: Dict[str, int]) -> float:

        total = 0
        if assessment_type == "PSS-10":
            reverse_items = {"q4", "q5", "q7", "q8"}
            for item_id, value in answers.items():
                total += (4 - value) if item_id in reverse_items else value
        else:
            total = sum(answers.values())
        return float(total)

    @staticmethod
    def _get_pss_risk(score: float) -> RiskLevel:
        if score <= 13:
            return RiskLevel.LOW
        if score <= 26:
            return RiskLevel.MEDIUM
        return RiskLevel.HIGH

    @staticmethod
    def _get_gad_risk(score: float) -> RiskLevel:
        if score <= 13:
            return RiskLevel.LOW
        if score <= 20:
            return RiskLevel.MEDIUM
        return RiskLevel.HIGH

    @staticmethod
    def _get_phq_risk(score: float) -> RiskLevel:
        if score <= 10:
            return RiskLevel.LOW
        if score <= 16:
            return RiskLevel.MEDIUM
        return RiskLevel.HIGH

    @classmethod
    def get_risk_level(cls, assessment_type: str, score: float) -> RiskLevel:
        if assessment_type == "PSS-10":
            return cls._get_pss_risk(score)
        if assessment_type == "GAD-7":
            return cls._get_gad_risk(score)
        if assessment_type == "PHQ-9":
            return cls._get_phq_risk(score)
        return RiskLevel.LOW

    @staticmethod
    def _check_phq9_critical_item(
        assessment_type: str,
        answers: Dict[str, int],
    ) -> bool:
        if assessment_type != "PHQ-9":
            return False
        value = answers.get(PHQ9_CRITICAL_ITEM_KEY, 0)
        return isinstance(value, int) and value > 0

    @staticmethod
    def _get_checkin_context(
        db: Session, user_id: int, limit: int = 7
    ) -> Tuple[float, int, float]:
        checkins = (
            db.query(EmotionalCheckin)
            .filter(EmotionalCheckin.user_id == user_id)
            .order_by(EmotionalCheckin.created_at.desc())
            .limit(limit)
            .all()
        )
        if not checkins:
            return 3.0, 0, 3.0

        avg_mood = sum(c.mood_score for c in checkins) / len(checkins)
        bad_days = sum(1 for c in checkins if c.mood_score < 3)
        pressures = [
            c.academic_pressure
            for c in checkins
            if c.academic_pressure is not None
        ]
        avg_pressure = sum(pressures) / len(pressures) if pressures else 3.0
        return avg_mood, bad_days, avg_pressure

    async def process_response(
        self,
        db: Session,
        user_id: int,
        user_email: str,
        response_in: schemas.assessment_response.AssessmentResponseCreate,
    ) -> AssessmentResponse | None:
        assessment = (
            db.query(Assessment)
            .filter(Assessment.id == response_in.assessment_id)
            .first()
        )
        if not assessment:
            logger.error(
                "process_response: assessment_id=%s not found.",
                response_in.assessment_id,
            )
            return None

        assessment_type: str = assessment.type
        answers: Dict[str, int] = response_in.answers

        # 2. Score and emotional risk level
        score = self.calculate_score(assessment_type, answers)
        emotional_risk: RiskLevel = self.get_risk_level(assessment_type, score)

        phq9_critical = self._check_phq9_critical_item(assessment_type, answers)
        if phq9_critical:
            logger.critical(
                "PHQ-9 item 9 triggered for user_id=%s. Escalating to CRITICAL.",
                user_id,
            )
            emotional_risk = RiskLevel.CRITICAL
        db_response = AssessmentResponse(
            user_id=user_id,
            assessment_id=response_in.assessment_id,
            answers=answers,
            total_score=score,
            risk_level=emotional_risk.value,
            share_with_psychologist=response_in.share_with_psychologist,
        )
        db.add(db_response)

        risk_summary = (
            db.query(RiskSummary)
            .filter(RiskSummary.user_id == user_id)
            .first()
        )
        if not risk_summary:
            risk_summary = RiskSummary(user_id=user_id)
            db.add(risk_summary)

        avg_mood, bad_days, avg_pressure = self._get_checkin_context(db, user_id)
        
        # Normalize score based on assessment type for ML model compatibility
        if assessment_type == "PSS-10":
            norm_emotional_score = score / 40.0
        elif assessment_type == "GAD-7":
            norm_emotional_score = score / 21.0
        elif assessment_type == "PHQ-9":
            norm_emotional_score = score / 27.0
        else:
            norm_emotional_score = 0.5

        ml_risk_str, confidence = risk_classifier.predict_risk(
            norm_emotional_score, avg_mood, bad_days, avg_pressure
        )
        ml_risk = RiskLevel.from_str(ml_risk_str)

        risk_summary.current_risk_level = ml_risk.value
        risk_summary.prediction_confidence = float(confidence)

        from app.ml.dropout_predictor import dropout_predictor
        from app.models.academic_profile import AcademicProfile

        acad_profile = (
            db.query(AcademicProfile)
            .filter(AcademicProfile.user_id == user_id)
            .first()
        )

        dropout_data: Dict = {
            "pss_score": norm_emotional_score * 40.0,
            "mood_avg": avg_mood,
            "bad_days_freq": bad_days,
            "academic_pressure": avg_pressure,
            "risk_level_encoded": emotional_risk.encode(),
        }

        if acad_profile:
            course_map = {"Ingeniería en Sistemas": 1, "Psicología": 2, "Medicina": 3}
            dropout_data.update(
                {
                    "Course": course_map.get(str(acad_profile.course), 1),
                    "Scholarship_holder": 1 if acad_profile.scholarship_holder else 0,
                    "Tuition_fees_up_to_date": (
                        1 if acad_profile.tuition_fees_up_to_date else 0
                    ),
                    "Curricular_units_approved": acad_profile.units_approved,
                    "Curricular_units_grade": acad_profile.current_gpa,
                    "Age_at_enrollment": acad_profile.age_at_enrollment or 20,
                    "Gender": acad_profile.gender or 1,
                }
            )

        d_risk_str, d_prob = dropout_predictor.predict_dropout(dropout_data)
        d_risk = RiskLevel.from_str(d_risk_str) if d_risk_str != "Error" else RiskLevel.LOW

        risk_summary.dropout_risk = d_risk.value
        risk_summary.dropout_probability = float(d_prob)
        db_response.dropout_probability = float(d_prob)

        level_order = [RiskLevel.LOW, RiskLevel.MEDIUM, RiskLevel.HIGH, RiskLevel.CRITICAL]
        effective_risk = max(
            [emotional_risk, ml_risk],
            key=lambda r: level_order.index(r),
        )
        if phq9_critical:
            effective_risk = RiskLevel.CRITICAL

        phq9_q6 = assessment_type == "PHQ-9" and answers.get("q6", 0) > 0

        # ONLY update recommendations if the current test is PSS-10
        # This follows the requirement: "solo debe brindarme consejos para el test pss 10 no para todos"
        if assessment_type == "PSS-10":
            recs = await recommendation_service.generate(
                risk_level=emotional_risk,  # Use only the test result, not ML context
                dropout_probability=float(d_prob),
                dropout_risk=d_risk.value,
                assessment_type=assessment_type,
                phq9_q6=False,
                phq9_q9=False,
                avg_mood=avg_mood,
                bad_days=bad_days,
                avg_pressure=avg_pressure,
                acad_profile=acad_profile,
            )
            risk_summary.recommendations = recs
        
        # Determine if we should notify the cabinet based on user consent
        # We use effective_risk here because for ALERTS we DO want the most severe risk
        source = (
            "PHQ-9 ítem 9 (pensamientos de autolesión)"
            if phq9_critical
            else f"{assessment.title} + Contexto ML"
        )

        
        # Determine if we should notify the cabinet based on user consent
        await alert_service.process_risk_alert(
            db=db,
            user_id=user_id,
            user_email=user_email,
            risk_level=effective_risk,
            context=source,
            notify_cabinet=response_in.share_with_psychologist
        )

        db.commit()
        db.refresh(db_response)
        return db_response



assessment_service = AssessmentService()
