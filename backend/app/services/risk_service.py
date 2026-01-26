from app.core.constants import AssessmentType, RiskLevel


class RiskService:
    @staticmethod
    def assess_risk(assessment_type: str, score: int) -> RiskLevel:
        """
        Maps a score to a RiskLevel based on the assessment type.
        """
        if assessment_type == AssessmentType.PSS:
            if score <= 13:
                return RiskLevel.LOW
            elif score <= 26:
                return RiskLevel.MEDIUM
            else:
                return RiskLevel.HIGH

        elif assessment_type == "checkin":
            # Example: Checkin score 1-5 (1=bad, 5=good) -> Risk inverse
            if score >= 4:
                return RiskLevel.LOW
            elif score == 3:
                return RiskLevel.MEDIUM
            else:
                return RiskLevel.HIGH

        # Default fallback
        return RiskLevel.LOW


risk_service = RiskService()
