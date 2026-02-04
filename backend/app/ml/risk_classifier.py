import logging
import os
from typing import Dict, Tuple

import joblib
import pandas as pd
from app.core.config import settings

logger = logging.getLogger(__name__)


class RiskClassifier:

    def __init__(self):
        self.model = None
        if os.path.isabs(settings.ML_MODEL_PATH):
            self.model_path = settings.ML_MODEL_PATH
        else:
            base_path = os.getcwd()
            self.model_path = os.path.join(base_path, settings.ML_MODEL_PATH)

        self._load_model()

        self.weights = {
            "pss_10": 0.4,
            "checkin_avg": 0.3,
            "frequency_low_mood": 0.3,
        }

    def _load_model(self):
        try:
            if os.path.exists(self.model_path):
                self.model = joblib.load(self.model_path)
            else:
                logger.warning(f"RiskClassifier: {self.model_path}")
        except Exception as e:
            logger.error(f"RiskClassifier: Falló la carga del modelo ML: {e}")

    def predict_risk(
        self,
        pss_score: float,
        checkin_avg: float,
        bad_days_count: int,
        academic_pressure_avg: float,
    ) -> Tuple[str, float]:

        if self.model:
            try:
                pss_raw = int(pss_score * 40)
                study_pressure = academic_pressure_avg * 2.0

                features_df = pd.DataFrame(
                    [[pss_raw, checkin_avg, bad_days_count, study_pressure]],
                    columns=[
                        "pss_score",
                        "mood_avg",
                        "bad_days_freq",
                        "study_pressure",
                    ],
                )

                pred_class = self.model.predict(features_df)[0]

                probas = self.model.predict_proba(features_df)[0]
                confidence = probas[pred_class]

                mapping = {
                    0: "Low",
                    1: "Medium",
                    2: "High",
                }
                return mapping.get(pred_class, "Low"), float(confidence)
            except Exception as e:
                logger.error(f"Predicción ML falló: {e}. Recurriendo a heurística.")

        normalized_mood = (5 - checkin_avg) / 4.0
        normalized_bad_days = min(bad_days_count / 7.0, 1.0)
        normalized_pressure = (academic_pressure_avg - 1) / 4.0

        score = (
            pss_score * 0.3
            + normalized_mood * 0.3
            + normalized_bad_days * 0.2
            + normalized_pressure * 0.2
        )

        if score < 0.3:
            return "Low", 1.0 - score
        elif score < 0.6:
            return "Medium", score if score > 0.5 else 1.0 - score
        else:
            return "High", score

    def get_feature_importance(self) -> Dict[str, float]:
        if self.model:
            imps = self.model.feature_importances_
            return {
                "pss_score": float(imps[0]),
                "checkin_avg": float(imps[1]),
                "bad_days_freq": float(imps[2]),
                "study_pressure": float(imps[3]),
            }
        return self.weights


risk_classifier = RiskClassifier()
