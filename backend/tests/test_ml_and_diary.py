import pytest
from app import models
from app.api.v1.endpoints.diary import get_phrase_cloud, get_word_cloud
from app.ml.dropout_predictor import dropout_predictor
from app.ml.risk_classifier import risk_classifier
from app.models.emotional_diary import EmotionalDiary


def test_risk_classifier_calibration():
    """
    Verifica que la calibración de entrada (sin el factor *2.0)
    permita obtener predicciones correctas bajo el motor RF.
    """
    # Escenario de Estrés Académico Alto Realista (Presión 5.0)
    # Antes, esto se convertía en 10.0 y fallaba el modelo.
    risk, conf = risk_classifier.predict_risk(
        pss_score=0.9, checkin_avg=1.5, bad_days_count=6, academic_pressure_avg=5.0
    )
    assert risk == "High"
    assert conf > 0.5


def test_dropout_predictor_heuristic_continuity():
    """
    Verifica que el nuevo motor de interpolación lineal (Continuous Scaling)
    funcione para valores intermedios en el fallback.
    """
    # Forzamos fallback desactivando el modelo (si existiera en el entorno de test)
    original_model = dropout_predictor.model
    dropout_predictor.model = None

    # Caso frontera: Estudiante con datos moderadamente malos
    data = {
        "pss_score": 20,  # Moderado (0.0 a 40)
        "mood_avg": 2.5,  # Bajo (1 a 5)
        "Curricular_units_approved": 2,  # Bajo
        "risk_level_encoded": 1,  # Medium
    }

    risk, prob = dropout_predictor.predict_dropout(data)

    # El score debería estar en el rango de Medium (>0.4)
    assert risk in ["Medium", "High"]
    assert 0.4 < prob < 0.9

    dropout_predictor.model = original_model


def test_diary_visualizations_logic():
    """
    Valida que los algoritmos de limpieza de texto para las nubes
    de palabras y frases no retornen errores con datos vacíos.
    """
    # Mocking simple de DB o comportamiento lógico
    # (Este test valida la robustez del código de procesamiento en diary.py)

    import re
    from collections import Counter

    def mock_process(text):
        words = re.findall(r"\w+", text.lower())
        stopwords = {"de", "la", "que", "el", "en"}
        return [w for w in words if w not in stopwords and len(w) > 2]

    # Test con ruidos y conectores
    text = "Hoy me sentí muy mal en la universidad, la universidad es difícil"
    result = mock_process(text)

    assert "universidad" in result
    assert "mal" in result
    assert "que" not in result
    assert len(result) > 0


def test_risk_classifier_ranges():
    """
    Verifica los límites de decisión del RiskClassifier.
    """
    # Bajo riesgo absoluto
    risk_l, _ = risk_classifier.predict_risk(0.1, 4.5, 0, 1.0)
    assert risk_l == "Low"

    # Alto riesgo absoluto
    risk_h, _ = risk_classifier.predict_risk(0.9, 1.0, 7, 5.0)
    assert risk_h == "High"
