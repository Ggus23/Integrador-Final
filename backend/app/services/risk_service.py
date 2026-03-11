from app.core.constants import AssessmentType, RiskLevel


class RiskService:
    """
    Single source of truth for score → RiskLevel mapping across all
    assessment types and daily check-ins.
    """

    @staticmethod
    def assess_risk(assessment_type: str, score: float) -> RiskLevel:
        """
        Maps a raw score to a RiskLevel based on the assessment type.
        Mirrors the thresholds used in AssessmentService so both services
        always agree on boundaries.
        """
        t = assessment_type.upper().replace("-", "_").replace(" ", "_")

        # PSS-10 — Cohen et al. (1983): 0-13 Low, 14-26 Medium, 27-40 High
        if t in ("PSS_10", "PSS"):
            if score <= 13:
                return RiskLevel.LOW
            if score <= 26:
                return RiskLevel.MEDIUM
            return RiskLevel.HIGH

        # GAD-7 (10-item extended, max=30)
        if t == "GAD_7":
            if score <= 13:
                return RiskLevel.LOW
            if score <= 20:
                return RiskLevel.MEDIUM
            return RiskLevel.HIGH

        # PHQ-9 (10-item extended, max=30)
        if t == "PHQ_9":
            if score <= 10:
                return RiskLevel.LOW
            if score <= 16:
                return RiskLevel.MEDIUM
            return RiskLevel.HIGH

        # Daily check-in: mood_score 1-5 (1=very bad, 5=very good)
        if t == "CHECKIN":
            if score >= 4:
                return RiskLevel.LOW
            if score >= 3:
                return RiskLevel.MEDIUM
            return RiskLevel.HIGH

        # Safe default
        return RiskLevel.LOW


risk_service = RiskService()
