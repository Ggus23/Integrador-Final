from types import SimpleNamespace

import joblib
import numpy as np
import pandas as pd
import pytest

from app.ml.risk_classifier import RiskClassifier
from app.ml.risk_features import FEATURE_COLUMNS, validate_training_data
from app.models.ai_prediction import AIPrediction
from app.services.assessment_service import AssessmentService
from app.utils import influx_logger
from scripts.training.consolidate_synthetic_dropout_labels import (
    _synthetic_dropout_probability,
)
from scripts.training.seed_synthetic_risk_history import _correlated_observation
from scripts.training.train_med_model import train_model
from scripts.training.train_synthetic_risk_model import train_synthetic_model


class StubRiskModel:
    feature_names_in_ = FEATURE_COLUMNS
    classes_ = ["Low", "Medium", "High"]

    def predict(self, features):
        self.features = features
        return ["High"]

    def predict_proba(self, features):
        return [[0.1, 0.2, 0.7]]

    @property
    def named_steps(self):
        return {"classifier": SimpleNamespace(feature_importances_=[0.1] * 3)}


class StubSyntheticRiskModel:
    classes_ = [0, 1]

    def predict_proba(self, features):
        self.features = features
        return [[0.25, 0.75]]


def prueba_classifier_pasa_scores_nativos_como_features_separados(monkeypatch):
    model = StubRiskModel()
    classifier = RiskClassifier.__new__(RiskClassifier)
    classifier.model = model
    classifier.model_metadata = {}
    logged_predictions = []
    monkeypatch.setattr(
        influx_logger,
        "log_prediction_to_influx",
        lambda **kwargs: logged_predictions.append(kwargs),
    )

    risk, confidence = classifier.predict_risk(
        pss_score=35,
        gad7_score=18,
        phq9_score=24,
        checkin_avg=2.5,
        bad_days_count=4,
        academic_pressure_avg=3.5,
    )

    assert list(model.features.columns) == FEATURE_COLUMNS
    assert model.features.iloc[0].to_dict() == {
        "pss_score": 35,
        "gad7_score": 18,
        "phq9_score": 24,
        "mood_avg": 2.5,
        "bad_days_count": 4,
        "academic_pressure_avg": 3.5,
    }
    assert (risk, confidence) == ("High", 0.7)
    assert logged_predictions[0]["fields"]["gad_score"] == 18
    assert logged_predictions[0]["fields"]["phq_score"] == 24
    assert logged_predictions[0]["fields"]["mood_avg"] == 2.5
    assert logged_predictions[0]["fields"]["bad_days_count"] == 4
    assert logged_predictions[0]["fields"]["academic_pressure_avg"] == 3.5


def prueba_synthetic_bundle_requires_explicit_demo_opt_in(monkeypatch):
    classifier = RiskClassifier.__new__(RiskClassifier)
    classifier.model = None
    classifier.model_path = "synthetic-demo.joblib"
    artifact = {
        "model": StubSyntheticRiskModel(),
        "feature_columns": FEATURE_COLUMNS,
        "metadata": {"synthetic": True, "target": "desertor_synthetic"},
    }
    monkeypatch.setattr("app.ml.risk_classifier.os.path.exists", lambda path: True)
    monkeypatch.setattr("app.ml.risk_classifier.joblib.load", lambda path: artifact)
    monkeypatch.setattr(
        "app.ml.risk_classifier.settings.ALLOW_SYNTHETIC_RISK_MODEL", False
    )

    classifier._load_model()

    assert classifier.model is None


def prueba_demo_inference_uses_six_features_and_calibrated_probability(monkeypatch):
    model = StubSyntheticRiskModel()
    classifier = RiskClassifier.__new__(RiskClassifier)
    classifier.model = model
    classifier.model_metadata = {"synthetic": True, "target": "desertor_synthetic"}
    logged_predictions = []
    monkeypatch.setattr(
        influx_logger,
        "log_prediction_to_influx",
        lambda **kwargs: logged_predictions.append(kwargs),
    )

    risk, confidence = classifier.predict_risk(
        pss_score=30,
        gad7_score=15,
        phq9_score=20,
        checkin_avg=1.5,
        bad_days_count=6,
        academic_pressure_avg=5,
    )

    assert list(model.features.columns) == FEATURE_COLUMNS
    assert model.features.iloc[0].to_dict() == {
        "pss_score": 30,
        "gad7_score": 15,
        "phq9_score": 20,
        "mood_avg": 1.5,
        "bad_days_count": 6,
        "academic_pressure_avg": 5,
    }
    assert (risk, confidence) == ("High", 0.75)
    assert logged_predictions[0]["fields"]["dropout_probability"] == 0.75


def prueba_shadow_log_persiste_las_seis_variables_de_inferencia(monkeypatch):
    stored_predictions = []

    class FakeSession:
        def add(self, prediction):
            stored_predictions.append(prediction)

        def commit(self):
            pass

        def close(self):
            pass

    monkeypatch.setattr("app.db.session.SessionLocal", FakeSession)

    influx_logger._save_to_postgres(
        model_name="RiskClassifier",
        user_id=42,
        fields={
            "confidence": 0.8,
            "pss_score": 30,
            "gad_score": 14,
            "phq_score": 12,
            "mood_avg": 2.5,
            "bad_days_count": 4,
            "academic_pressure_avg": 3.5,
            "heuristic_score": 0.7,
        },
        tags={"risk_level": "High"},
    )

    assert len(stored_predictions) == 1
    prediction = stored_predictions[0]
    assert isinstance(prediction, AIPrediction)
    assert prediction.user_id == 42
    assert prediction.created_at is not None
    assert prediction.risk_level == "High"
    assert prediction.heuristic_score == 0.7
    assert {
        "pss_score": prediction.pss_score,
        "gad_score": prediction.gad_score,
        "phq_score": prediction.phq_score,
        "mood_avg": prediction.mood_avg,
        "bad_days_count": prediction.bad_days_count,
        "academic_pressure_avg": prediction.academic_pressure_avg,
    } == {
        "pss_score": 30,
        "gad_score": 14,
        "phq_score": 12,
        "mood_avg": 2.5,
        "bad_days_count": 4,
        "academic_pressure_avg": 3.5,
    }


def prueba_heuristica_registra_las_seis_variables_en_shadow_log(monkeypatch):
    classifier = RiskClassifier.__new__(RiskClassifier)
    classifier.model = None
    logged_predictions = []
    monkeypatch.setattr(
        influx_logger,
        "log_prediction_to_influx",
        lambda **kwargs: logged_predictions.append(kwargs),
    )

    risk, confidence = classifier.predict_risk(
        pss_score=30,
        gad7_score=14,
        phq9_score=12,
        checkin_avg=2.5,
        bad_days_count=4,
        academic_pressure_avg=3.5,
        student_id="42",
    )

    assert risk == "High"
    assert confidence == pytest.approx(0.6517857143)
    assert len(logged_predictions) == 1
    fields = logged_predictions[0]["fields"]
    assert {
        "pss_score": fields["pss_score"],
        "gad_score": fields["gad_score"],
        "phq_score": fields["phq_score"],
        "mood_avg": fields["mood_avg"],
        "bad_days_count": fields["bad_days_count"],
        "academic_pressure_avg": fields["academic_pressure_avg"],
    } == {
        "pss_score": 30,
        "gad_score": 14,
        "phq_score": 12,
        "mood_avg": 2.5,
        "bad_days_count": 4,
        "academic_pressure_avg": 3.5,
    }


def prueba_training_data_permite_scores_faltantes_y_preserva_rangos():
    data = pd.DataFrame(
        [
            [34, 16, None, 2.5, 3, 4, "High"],
            [8, None, 6, 4.0, 1, 2, "Low"],
        ],
        columns=[*FEATURE_COLUMNS, "risk_level"],
    )

    validated = validate_training_data(data)

    assert validated.loc[0, "pss_score"] == 34
    assert pd.isna(validated.loc[0, "phq9_score"])
    assert pd.isna(validated.loc[1, "gad7_score"])
    assert validated["risk_level"].tolist() == ["High", "Low"]


def prueba_training_data_rechaza_scores_fuera_de_rango():
    data = pd.DataFrame(
        [[41, 16, 20, 2, 3, 3, "High"]],
        columns=[*FEATURE_COLUMNS, "risk_level"],
    )

    with pytest.raises(ValueError, match="pss_score scores must be within"):
        validate_training_data(data)


def prueba_training_data_rechaza_totales_de_test_fraccionarios():
    data = pd.DataFrame(
        [[10.5, 8, 12, 2, 3, 3, "Medium"]],
        columns=[*FEATURE_COLUMNS, "risk_level"],
    )

    with pytest.raises(ValueError, match="pss_score scores must be whole numbers"):
        validate_training_data(data)


def prueba_training_data_rechaza_dias_bajos_fuera_de_rango():
    data = pd.DataFrame(
        [[10, 8, 12, 3, 8, 3, "Medium"]],
        columns=[*FEATURE_COLUMNS, "risk_level"],
    )

    with pytest.raises(ValueError, match="bad_days_count scores must be within"):
        validate_training_data(data)


def prueba_entrenamiento_falla_si_no_hay_dataset_verificado(tmp_path):
    missing_data = tmp_path / "missing-risk-data.csv"

    with pytest.raises(
        FileNotFoundError, match="Verified risk training data not found"
    ):
        train_model(str(missing_data), str(tmp_path / "candidate.pkl"))


def prueba_entrenamiento_guarda_modelo_candidato_con_esquema_nuevo(tmp_path):
    rows = []
    for risk_level, base_score in (("Low", 4), ("Medium", 16), ("High", 32)):
        for offset in range(12):
            rows.append(
                [
                    min(base_score + offset, 40),
                    min(base_score // 2 + offset, 21),
                    min(base_score // 2 + offset, 27),
                    max(1, 5 - offset // 4),
                    min(offset // 2, 7),
                    min(5, max(1, base_score // 8)),
                    risk_level,
                ]
            )
    data_path = tmp_path / "verified-risk-data.csv"
    model_path = tmp_path / "risk_model_candidate.pkl"
    pd.DataFrame(rows, columns=[*FEATURE_COLUMNS, "risk_level"]).to_csv(
        data_path, index=False
    )

    train_model(str(data_path), str(model_path))

    model = joblib.load(model_path)
    assert list(model.feature_names_in_) == FEATURE_COLUMNS


def prueba_generador_sintetico_correlaciona_seis_variables():
    rng = np.random.default_rng(7)
    healthy = _correlated_observation(rng, distress=-1, academic_strain=-1)
    distressed = _correlated_observation(rng, distress=2, academic_strain=2)

    assert distressed["pss_score"] > healthy["pss_score"]
    assert distressed["gad_score"] > healthy["gad_score"]
    assert distressed["phq_score"] > healthy["phq_score"]
    assert distressed["mood_avg"] < healthy["mood_avg"]
    assert distressed["bad_days_count"] > healthy["bad_days_count"]
    assert distressed["academic_pressure_avg"] >= healthy["academic_pressure_avg"]


def prueba_regla_de_etiquetado_sintetico_respeta_rangos_reales():
    severe_profile = pd.Series(
        {
            "academic_pressure_avg": 5.0,
            "phq9_score": 20.0,
            "mood_avg": 1.0,
            "gad7_score": 15.0,
            "pss_score": 30.0,
            "bad_days_count": 6.0,
        }
    )
    moderate_profile = severe_profile.copy()
    moderate_profile["academic_pressure_avg"] = 4.0

    assert _synthetic_dropout_probability(severe_profile) == 0.85
    assert _synthetic_dropout_probability(moderate_profile) < 0.85


def prueba_entrenamiento_sintetico_calibra_y_guarda_bundle(tmp_path):
    rng = np.random.default_rng(42)
    rows = []
    for student in range(80):
        student_risk = student % 2
        for observation in range(5):
            distress = (2.0 if student_risk else -1.0) + rng.normal(0, 0.25)
            pressure = (1.6 if student_risk else -0.8) + rng.normal(0, 0.25)
            features = _correlated_observation(rng, distress, pressure)
            rows.append(
                {
                    "synthetic_student_id": f"synthetic-{student}",
                    "created_at": f"2025-0{observation + 1}-01",
                    "desertor": student_risk,
                    "synthetic_target_source": "synthetic_probability_rule_v1",
                    **{
                        "pss_score": features["pss_score"],
                        "gad7_score": features["gad_score"],
                        "phq9_score": features["phq_score"],
                        "mood_avg": features["mood_avg"],
                        "bad_days_count": features["bad_days_count"],
                        "academic_pressure_avg": features["academic_pressure_avg"],
                    },
                }
            )
    data_path = tmp_path / "synthetic.csv"
    model_path = tmp_path / "synthetic.joblib"
    pd.DataFrame(rows).to_csv(data_path, index=False)

    metrics = train_synthetic_model(data_path, model_path)
    artifact = joblib.load(model_path)

    assert 0 <= metrics["roc_auc"] <= 1
    assert 0 <= metrics["brier_score"] <= 1
    assert artifact["metadata"]["synthetic"] is True
    assert artifact["metadata"]["target"] == "desertor_synthetic"
    assert artifact["feature_columns"] == FEATURE_COLUMNS
    demo_classifier = RiskClassifier.__new__(RiskClassifier)
    demo_classifier.model = artifact["model"]
    demo_classifier.model_metadata = artifact["metadata"]
    assert demo_classifier.model.get_params()["method"] == "sigmoid"


def prueba_modelo_legacy_no_se_activa(monkeypatch):
    classifier = RiskClassifier.__new__(RiskClassifier)
    classifier.model = None
    classifier.model_path = "legacy-risk-model.pkl"
    legacy_model = SimpleNamespace(
        feature_names_in_=["pss_score", "mood_avg", "bad_days_freq", "study_pressure"]
    )
    monkeypatch.setattr("app.ml.risk_classifier.os.path.exists", lambda path: True)
    monkeypatch.setattr("app.ml.risk_classifier.joblib.load", lambda path: legacy_model)

    classifier._load_model()

    assert classifier.model is None


def prueba_puntajes_recientes_de_tests_se_mantienen_separados():
    scores = AssessmentService._collect_assessment_scores(
        [
            ("PSS-10", 20),
            ("GAD-7", 10),
            ("PSS-10", 12),
            ("PHQ-9", 8),
        ],
        "GAD-7",
        15,
    )

    assert scores == {"PSS-10": 20.0, "GAD-7": 15.0, "PHQ-9": 8.0}
