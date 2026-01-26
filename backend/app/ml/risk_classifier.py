from typing import Dict, Tuple


class RiskClassifier:
    """
    A simple and interpretable risk classification service.
    This module uses a rule-based approach that can be interpreted as
    a simplified Decision Tree or Logistic Regression weights.

    Academic Note: In a bachelor thesis, interpretability is key.
    Using fixed weights for different psychometric indicators allows
    psychologists to understand WHY a student was flagged.
    """

    def __init__(self):
        # In a real scenario, these weights would be learned from a dataset.
        # For this prototype, we use literature-based clinical weights.
        self.weights = {
            "pss_10": 0.4,  # Perceived Stress Scale weight
            "checkin_avg": 0.3,  # Emotional stability weight (negative correlation)
            "frequency_low_mood": 0.3,  # Frequency of bad days
        }

    def predict_risk(
        self, pss_score: float, checkin_avg: float, bad_days_count: int
    ) -> Tuple[str, float]:
        """
        Calculates the risk level based on normalized inputs.

        Args:
            pss_score: Normalized PSS-10 score (0.0 to 1.0)
            checkin_avg: Average mood score (1.0 to 5.0)
            bad_days_count: Number of checkins with mood < 3 in the last week

        Returns:
            A tuple of (Risk Level, Confidence)
        """
        # Normalize checkin_avg (invert it because 5 is good, 1 is bad)
        normalized_mood = (5 - checkin_avg) / 4.0

        # Normalize bad_days_count (assuming max 7 days)
        normalized_bad_days = min(bad_days_count / 7.0, 1.0)

        # Weighted sum (Logistic-like approach)
        score = (
            pss_score * self.weights["pss_10"]
            + normalized_mood * self.weights["checkin_avg"]
            + normalized_bad_days * self.weights["frequency_low_mood"]
        )

        # Classification Thresholds
        if score < 0.3:
            return "Low", 1.0 - score
        elif score < 0.6:
            return "Medium", score if score > 0.5 else 1.0 - score
        else:
            return "High", score

    def get_feature_importance(self) -> Dict[str, float]:
        """
        Returns the importance of each feature for explainability.
        """
        return self.weights


risk_classifier = RiskClassifier()
