import logging
import os
from typing import Dict, Tuple

import joblib
import pandas as pd

from app.core.config import settings
from app.core.constants import RiskLevel
from app.ml.risk_features import FEATURE_COLUMNS, as_feature_record

logger = logging.getLogger(__name__)


class RiskClassifier:

    def __init__(self):
        if os.path.isabs(settings.ML_MODEL_PATH):
            self.model_path = settings.ML_MODEL_PATH
        else:
            base_path = os.getcwd()
            self.model_path = os.path.join(base_path, settings.ML_MODEL_PATH)

        self.model = None
        self.model_metadata = {}
        self._load_model()

    def _load_model(self):
        try:
            if os.path.exists(self.model_path):
                artifact = joblib.load(self.model_path)
                if isinstance(artifact, dict):
                    metadata = artifact.get("metadata", {})
                    model = artifact.get("model")
                    model_features = artifact.get("feature_columns", [])
                    if metadata.get("synthetic") and not (
                        settings.ALLOW_SYNTHETIC_RISK_MODEL
                    ):
                        logger.warning(
                            "RiskClassifier: el artefacto sintético de demostración "
                            "está bloqueado; habilítelo solo en el entorno de tesis."
                        )
                        return
                    self.model_metadata = metadata
                else:
                    model = artifact
                    model_features = list(getattr(model, "feature_names_in_", []))
                    self.model_metadata = {}
                if model_features != FEATURE_COLUMNS:
                    logger.error(
                        "RiskClassifier: El modelo en %s no coincide con el esquema "
                        "actual. Se deshabilita hasta reentrenarlo.",
                        self.model_path,
                    )
                    return
                if model is None:
                    logger.error("RiskClassifier: artefacto sin modelo.")
                    return
                self.model = model
            else:
                logger.warning(f"RiskClassifier: {self.model_path}")
        except Exception as e:
            logger.error(f"RiskClassifier: Falló la carga del modelo ML: {e}")

    def predict_risk(
        self,
        pss_score: float | None,
        gad7_score: float | None,
        phq9_score: float | None,
        checkin_avg: float,
        bad_days_count: int,
        academic_pressure_avg: float,
        student_id: str = None,
        faculty: str = None,
    ) -> Tuple[str, float]:

        if self.model:
            try:
                features_df = pd.DataFrame(
                    [
                        as_feature_record(
                            pss_score=pss_score,
                            gad7_score=gad7_score,
                            phq9_score=phq9_score,
                            mood_avg=checkin_avg,
                            bad_days_count=bad_days_count,
                            academic_pressure_avg=academic_pressure_avg,
                        )
                    ],
                    columns=FEATURE_COLUMNS,
                )

                probas = self.model.predict_proba(features_df)[0]
                model_classes = list(self.model.classes_)
                model_metadata = getattr(self, "model_metadata", {})
                if model_metadata.get("target") == "desertor_synthetic":
                    positive_index = model_classes.index(1)
                    dropout_probability = float(probas[positive_index])
                    pred_class = int(dropout_probability >= 0.5)
                    risk_level = (
                        RiskLevel.HIGH.value if pred_class == 1 else RiskLevel.LOW.value
                    )
                    conf = (
                        dropout_probability
                        if pred_class == 1
                        else 1.0 - dropout_probability
                    )
                else:
                    pred_class = self.model.predict(features_df)[0]
                    risk_level = RiskLevel.from_str(str(pred_class)).value
                    conf = float(probas[model_classes.index(pred_class)])

                from app.utils.influx_logger import log_prediction_to_influx

                log_prediction_to_influx(
                    model_name="RiskClassifier",
                    student_id=student_id,
                    fields={
                        "confidence": conf,
                        "pss_score": pss_score,
                        "gad_score": gad7_score,
                        "phq_score": phq9_score,
                        "mood_avg": checkin_avg,
                        "bad_days_count": bad_days_count,
                        "academic_pressure_avg": academic_pressure_avg,
                        "dropout_probability": (
                            dropout_probability
                            if model_metadata.get("target") == "desertor_synthetic"
                            else None
                        ),
                    },
                    tags={"risk_level": risk_level, "facultad": faculty or "Unknown"},
                )

                return risk_level, conf
            except Exception as e:
                logger.error(f"Predicción ML falló: {e}. Recurriendo a heurística.")

        emotional_scores = [
            score / maximum
            for score, maximum in (
                (pss_score, 40.0),
                (gad7_score, 21.0),
                (phq9_score, 27.0),
            )
            if score is not None
        ]
        normalized_assessment = max(emotional_scores, default=0.0)
        normalized_mood = (5 - checkin_avg) / 4.0
        normalized_bad_days = min(bad_days_count / 7.0, 1.0)
        normalized_pressure = (academic_pressure_avg - 1) / 4.0

        score = (
            normalized_assessment * 0.3
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
                "gad_score": gad7_score,
                "phq_score": phq9_score,
                "mood_avg": checkin_avg,
                "bad_days_count": bad_days_count,
                "academic_pressure_avg": academic_pressure_avg,
            },
            tags={"risk_level": risk_level, "facultad": faculty or "Unknown"},
        )

        return risk_level, conf

    def get_feature_importance(self) -> Dict[str, float]:
        if self.model:
            estimator = self.model
            calibrated_classifiers = getattr(self.model, "calibrated_classifiers_", [])
            if calibrated_classifiers:
                estimator = calibrated_classifiers[0].estimator
            named_steps = getattr(estimator, "named_steps", {})
            classifier = named_steps.get("classifier", estimator)
            imps = getattr(classifier, "feature_importances_", None)
            if imps is None:
                return {}
            return {
                feature: float(importance)
                for feature, importance in zip(FEATURE_COLUMNS, imps)
            }
        return {}


risk_classifier = RiskClassifier()
