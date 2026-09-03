"""
Sistema de Logging de Predicciones de IA a PostgreSQL

DESCRIPCIÓN:
Captura predicciones de los modelos de IA (RiskClassifier, DropoutPredictor, SentimentCNN)
y las persiste en PostgreSQL para:
- Auditoría completa de predicciones
- Visualización en Grafana (solo acceso SuperAdmin)
- Análisis retrospectivo de calidad del modelo

MIGRACIÓN DESDE INFLUXDB:
NOTA IMPORTANTE - Este módulo fue previamente llamado 'influx_logger' pero ahora guarda
en PostgreSQL en lugar de InfluxDB. El nombre de la función se mantiene por compatibilidad
con el código existente, pero internamente usa SQLAlchemy para guardar en la BD.

SEGURIDAD:
- Los datos se guardan en la tabla 'ai_predictions' de PostgreSQL
- El acceso desde Grafana es controlado por SuperAdmin
- Estudiantes y Psicólogos NO ven estas predicciones
- La escritura es asíncrona (background thread) para no bloquear la API

COMPATIBILIDAD:
La función 'log_prediction_to_influx()' es usada por:
1. app/ml/risk_classifier.py
2. app/ml/dropout_predictor.py
3. app/ml/emotion/predictor.py

Todos usan la misma interfaz sin cambios.

Autor: Sistema de IA MenTaLink
Fecha de Migración: 2026-05-28
"""

import logging
from datetime import datetime
from threading import Thread
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)


def _save_to_postgres(
    model_name: str,
    user_id: Optional[int] = None,
    fields: Dict[str, Any] = None,
    tags: Dict[str, str] = None,
):
    """
    Guarda predicciones de modelos IA en PostgreSQL (tabla ai_predictions).

    Esta función se ejecuta típicamente en un thread separado (asíncrono) para
    no bloquear el flujo principal de la API.

    Parámetros:
        model_name (str): Nombre del modelo que hizo la predicción
                          Ej: 'RiskClassifier', 'DropoutPredictor', 'SentimentCNN'
        user_id (int, optional): ID del estudiante/usuario afectado
        fields (dict): Valores numéricos de la predicción
                       Ej: {'dropout_probability': 0.65, 'confidence': 0.92}
        tags (dict): Metadatos para filtrado en Grafana
                     Ej: {'risk_level': 'HIGH', 'facultad': 'Ingeniería'}

    Estructrura de Datos Guardados:
    - model_name: Identifica qué modelo generó la predicción (para Grafana)
    - user_id: Asocia la predicción con un estudiante específico
    - Fields (valores de predicción):
      * dropout_probability: Probabilidad de deserción (0.0-1.0)
      * confidence: Confianza del modelo en su predicción
      * pss_score: Puntaje de estrés percibido
      * mood_avg: Promedio de humor del estudiante
      * heuristic_score: Score alternativo (si el modelo falla)
    - Tags (metadatos para filtrado):
      * risk_level: Clasificación (LOW, MEDIUM, HIGH)
      * facultad: Programa académico del estudiante
      * sentiment: Clasificación emocional (para SentimentCNN)

    Nota Técnica:
    Esta función maneja excepciones silenciosamente para evitar que fallos
    en la persistencia impacten el flujo principal de la API.
    """
    if fields is None:
        fields = {}
    if tags is None:
        tags = {}

    try:
        from app.db.session import SessionLocal
        from app.models.ai_prediction import AIPrediction

        db = SessionLocal()

        # Construir registro con los datos disponibles de la predicción
        # Nota: Muchos campos pueden ser None si el modelo no los proporciona
        prediction_data = {
            "model_name": model_name,
            "user_id": user_id,
            "created_at": datetime.utcnow(),
            # Resultados de la predicción (fields)
            "confidence": fields.get("confidence"),
            "pss_score": fields.get("pss_score"),
            "gad_score": fields.get("gad_score"),
            "phq_score": fields.get("phq_score"),
            "mood_avg": fields.get("mood_avg"),
            "heuristic_score": fields.get("heuristic_score"),
            "dropout_probability": fields.get("dropout_probability"),
            # Metadatos para filtrado en Grafana (tags)
            "risk_level": tags.get("risk_level", "UNKNOWN"),
            "facultad": tags.get("facultad"),
            "sentiment": tags.get("sentiment"),
        }

        prediction = AIPrediction(**prediction_data)
        db.add(prediction)
        db.commit()
        db.close()

        logger.info(
            f"Prediction saved to PostgreSQL: model={model_name}, user_id={user_id}"
        )

    except Exception as e:
        logger.error(f"Failed to save prediction to PostgreSQL: {e}")
        # Falla silenciosamente para no afectar al resto de la app
        try:
            db.close()
        except Exception:
            pass


def log_prediction_to_influx(
    model_name: str,
    student_id: Optional[int] = None,
    fields: Dict[str, Any] = None,
    tags: Dict[str, str] = None,
    run_in_background: bool = True,
):
    """
    Función universal para persistir predicciones de modelos IA en PostgreSQL.

    NOTA IMPORTANTE - Nombre Heredado:
    Esta función se llama 'log_prediction_to_influx' por compatibilidad histórica,
    pero ahora guarda en PostgreSQL en lugar de InfluxDB. El nombre se mantuvo
    para minimizar cambios en el código existente de los modelos ML.

    USO - Ejemplos:

    1. RiskClassifier (Riesgo Emocional):
        log_prediction_to_influx(
            model_name="RiskClassifier",
            student_id=user_id,
            fields={"confidence": 0.92, "pss_score": 28, "mood_avg": 3.5},
            tags={"risk_level": "HIGH", "facultad": "Ingeniería"}
        )

    2. DropoutPredictor (Predictor de Deserción):
        log_prediction_to_influx(
            model_name="DropoutPredictor",
            student_id=user_id,
            fields={"dropout_probability": 0.65, "confidence": 0.88},
            tags={"risk_level": "MEDIUM", "facultad": "Medicina"}
        )

    3. SentimentCNN (Análisis de Sentimientos):
        log_prediction_to_influx(
            model_name="SentimentCNN",
            student_id=user_id,
            fields={"confidence": 0.95},
            tags={"sentiment": "ANXIETY", "facultad": "Psicología"}
        )

    Parámetros:
        model_name (str): Tipo de modelo (RiskClassifier, DropoutPredictor, SentimentCNN)
        student_id (int): ID del estudiante afectado
        fields (dict): Resultados numéricos de la predicción
        tags (dict): Metadatos para categorización (risk_level, facultad, sentiment)
        run_in_background (bool): Si True, ejecuta en thread separado sin bloquear

    Comportamiento:
        - Por defecto se ejecuta en segundo plano (threading)
        - Las excepciones se capturan y loguean, no se propagan
        - Los datos se guardan en tabla 'ai_predictions' de PostgreSQL
        - Son accesibles SOLO a SuperAdmin en Grafana

    Seguridad:
        - Estudiantes NO ven sus predicciones en la API
        - Psicólogos NO ven predicciones en la API
        - SOLO SuperAdmin ve datos en Grafana (control externo)
        - Datos almacenados indefinidamente para auditoría

    Índices Optimizados:
        - (user_id, created_at): Para queries por estudiante
        - (model_name, created_at): Para queries por tipo de modelo
        - (facultad, created_at): Para queries por programa académico
    """
    if run_in_background:
        # Ejecutar en thread daemon para no bloquear la API
        thread = Thread(
            target=_save_to_postgres,
            args=(model_name, student_id, fields, tags),
            daemon=True,  # Se termina cuando la app principal termina
        )
        thread.start()
    else:
        # Ejecutar síncronamente (útil para debugging)
        _save_to_postgres(model_name, student_id, fields, tags)
