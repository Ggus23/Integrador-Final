"""
This module handles model explainability (SHAP, LIME, etc.).
"""

from typing import Any, Dict


class Explainer:
    def explain_prediction(self, features: Dict[str, Any]) -> Dict[str, float]:
        """
        Returns feature importance for a given prediction.
        """
        return {"stress_level": 0.8, "sleep_hours": 0.2}
