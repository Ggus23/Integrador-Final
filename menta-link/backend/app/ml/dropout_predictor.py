import logging
import os
from typing import Dict, Tuple

import joblib
import pandas as pd

from app.core.constants import RiskLevel

logger = logging.getLogger(__name__)

# Feature columns — must match the training script exactly.
FEATURE_COLUMNS = [
    "Course",
    "Scholarship holder",
    "Tuition fees up to date",
    "Curricular units 1st sem (approved)",
    "Curricular units 1st sem (grade)",
    "Age at enrollment",
    "Gender",
    "pss_score",
    "mood_avg",
    "risk_level_encoded",  # 0=Low, 1=Medium, 2=High, 3=Critical
]


class DropoutPredictor:
    """
    Predicts university dropout probability using a RandomForest model
    trained on academic + emotional health features.

    The `risk_level_encoded` feature captures the emotional risk
    classification from the psychometric assessment, giving the model
    access to clinically-grounded information beyond raw scores.
    """

    def __init__(self):
        base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.model_path = os.path.join(base_path, "models", "dropout_model.pkl")
        self.model = None
        self._load_model()

    def _load_model(self):
        try:
            if os.path.exists(self.model_path):
                self.model = joblib.load(self.model_path)
                logger.info("DropoutPredictor: Model loaded from %s.", self.model_path)
            else:
                logger.warning(
                    "DropoutPredictor: Model not found at %s. "
                    "Heuristic fallback will be used.",
                    self.model_path,
                )
        except Exception as e:
            logger.error("DropoutPredictor: Failed to load model: %s", e)

    def predict_dropout(self, data: Dict) -> Tuple[str, float]:
        """
        Predict dropout risk and probability.

        Expected keys in `data`
        -----------------------
        Course                   : int   — encoded programme id
        Scholarship_holder       : int   — 0/1
        Tuition_fees_up_to_date  : int   — 0/1
        Curricular_units_approved: int
        Curricular_units_grade   : float — scale 0-100 (converted internally to 0-20)
        Age_at_enrollment        : int
        Gender                   : int   — 0/1
        pss_score                : float — 0-40
        mood_avg                 : float — 1-5
        risk_level_encoded       : int   — 0=Low, 1=Medium, 2=High, 3=Critical

        Returns
        -------
        (risk_label, probability) where risk_label is "Low"/"Medium"/"High"
        and probability is in [0.0, 1.0].
        """
        risk_encoded = data.get("risk_level_encoded", 0)

        if not self.model:
            # Heuristic fallback when no model is available (Continuous Scoring)
            pss = float(data.get("pss_score", 0.0))
            mood = float(data.get("mood_avg", 5.0))
            units = float(data.get("Curricular_units_approved", 6))

            # PSS Contribution: scales linearly from 0 (at pss <= 13) to 0.25 (at pss >= 40)
            pss_weight = max(0.0, min((pss - 13.0) / 27.0 * 0.25, 0.25))

            # Mood Contribution: scales linearly from 0 (at mood=4) to 0.25 (at mood <= 1)
            mood_weight = max(0.0, min((4.0 - mood) / 3.0 * 0.25, 0.25))

            # Units Contribution: scales linearly from 0 (at units>=5) to 0.30 (at units=0)
            units_weight = max(0.0, min((5.0 - units) / 5.0 * 0.3, 0.3))

            # Risk Level Contribution (0.0 to ~0.2)
            risk_weight = risk_encoded * 0.067

            score = pss_weight + mood_weight + units_weight + risk_weight

            risk = RiskLevel.LOW.value
            if score > 0.7:
                risk = RiskLevel.HIGH.value
            elif score > 0.4:
                risk = RiskLevel.MEDIUM.value
            from app.utils.influx_logger import log_prediction_to_influx
            student_id = data.get("student_id")
            faculty = data.get("faculty", "Unknown")
            
            prob = min(round(score, 4), 1.0)
            log_prediction_to_influx(
                model_name="DropoutPredictor",
                student_id=student_id,
                fields={"dropout_probability": prob, "heuristic_score": score},
                tags={"risk_level": risk, "facultad": faculty}
            )
            return risk, prob

        try:
            features_df = pd.DataFrame(
                [
                    [
                        data.get("Course", 1),
                        data.get("Scholarship_holder", 0),
                        data.get("Tuition_fees_up_to_date", 1),
                        data.get("Curricular_units_approved", 0),
                        # grade: convert from 100-pt to 20-pt scale to match training data
                        data.get("Curricular_units_grade", 0.0) / 5.0,
                        data.get("Age_at_enrollment", 20),
                        data.get("Gender", 1),
                        data.get("pss_score", 0.0),
                        data.get("mood_avg", 5.0),
                        risk_encoded,
                    ]
                ],
                columns=FEATURE_COLUMNS,
            )

            probability = float(
                self.model.predict_proba(features_df)[0][1]  # P(dropout)
            )

            risk = RiskLevel.LOW.value
            if probability > 0.7:
                risk = RiskLevel.HIGH.value
            elif probability > 0.3:
                risk = RiskLevel.MEDIUM.value

            prob_round = round(probability, 4)
            
            from app.utils.influx_logger import log_prediction_to_influx
            student_id = data.get("student_id")
            faculty = data.get("faculty", "Unknown")
            
            log_prediction_to_influx(
                model_name="DropoutPredictor",
                student_id=student_id,
                fields={"dropout_probability": prob_round},
                tags={"risk_level": risk, "facultad": faculty}
            )

            return risk, prob_round

        except Exception as e:
            logger.error("DropoutPredictor: Prediction failed: %s", e)
            return "Error", 0.0

    def get_feature_importance(self) -> Dict[str, float]:
        if self.model and hasattr(self.model, "feature_importances_"):
            imps = self.model.feature_importances_
            return dict(zip(FEATURE_COLUMNS, [float(v) for v in imps]))
        return {}


dropout_predictor = DropoutPredictor()
