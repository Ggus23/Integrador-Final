import logging
import os
from typing import Dict, Tuple

import joblib
import pandas as pd

from app.core.config import settings
from app.core.constants import RiskLevel

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
        student_id: str = None,
        faculty: str = None,
        pss_score_raw: float = None,
        gad_score_raw: float = None,
        phq_score_raw: float = None,
    ) -> Tuple[str, float]:

        if self.model:
            try:
                pss_raw = int(pss_score * 40)
                study_pressure = float(academic_pressure_avg)

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
                    0: RiskLevel.LOW.value,
                    1: RiskLevel.MEDIUM.value,
                    2: RiskLevel.HIGH.value,
                }
                risk_level = mapping.get(pred_class, RiskLevel.LOW.value)
                conf = float(confidence)

                from app.utils.influx_logger import log_prediction_to_influx

                log_prediction_to_influx(
                    model_name="RiskClassifier",
                    student_id=student_id,
                    fields={
                        "confidence": conf,
                        "pss_score": pss_score,
                        "mood_avg": checkin_avg,
                    },
                    tags={"risk_level": risk_level, "facultad": faculty or "Unknown"},
                )

                return risk_level, conf
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
            risk_level = RiskLevel.LOW.value
            conf = 1.0 - score
        elif score < 0.6:
            risk_level = RiskLevel.MEDIUM.value
            conf = score if score > 0.5 else 1.0 - score
        else:
            risk_level = RiskLevel.HIGH.value
            conf = score

        from app.utils.influx_logger import log_prediction_to_influx

        log_prediction_to_influx(
            model_name="RiskClassifier",
            student_id=student_id,
            fields={
                "confidence": conf,
                "heuristic_score": score,
                "pss_score": pss_score,
                "mood_avg": checkin_avg,
            },
            tags={"risk_level": risk_level, "facultad": faculty or "Unknown"},
        )

        return risk_level, conf

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
