from typing import Any, Dict, List

from app.core.constants import AssessmentType


class ScoringService:
    @staticmethod
    def calculate_score(assessment_type: str, responses: List[Dict[str, Any]]) -> int:
        """
        Calculates the total score based on assessment type and responses.
        Expects responses to be a list of dicts with 'value' key (int).
        """
        total_score = 0
        for response in responses:
            value = response.get("value")
            if isinstance(value, int):
                total_score += value

        # Specific logic for DASS-21 if needed (e.g. multiply by 2 for full DASS comparability)
        if assessment_type == AssessmentType.DASS_21:
            total_score *= 2

        return total_score


scoring_service = ScoringService()
