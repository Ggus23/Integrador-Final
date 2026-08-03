"""
Modelo de Predicciones de IA para MenTaLink

Este modelo almacena todos los resultados de las predicciones generadas por los
modelos de machine learning (RiskClassifier, DropoutPredictor, SentimentCNN) para
propósitos de:

1. **Auditoría y Histórico:** Rastrear todas las predicciones realizadas
2. **Visualización en Grafana:** Mostrar series de tiempo de riesgo por usuario
3. **Análisis Retrospectivo:** Permitir que el equipo de datos valide la precisión

IMPORTANTE - Seguridad:
- SOLO el SuperAdmin en Grafana puede ver estos datos
- Estudiantes y Psicólogos NO tienen acceso directo a estas predicciones
- El acceso es controlado a través del authentication de Grafana

Autor: Sistema de IA MenTaLink
Fecha de Creación: 2026-05-28
"""

from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Index
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class AIPrediction(Base):
    """
    Tabla que almacena predicciones de IA para análisis y visualización.
    
    Campos principales:
    - user_id: Referencia al estudiante
    - model_name: Tipo de modelo que hizo la predicción
    - Campos de entrada (features): gpa, pss_score, mood_avg, etc.
    - Campos de salida: risk_level, dropout_probability
    - Índices: Optimizados para queries en Grafana por usuario, modelo, facultad
    """
    __tablename__ = "ai_predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Información del modelo
    model_name = Column(String, nullable=False, index=True)  # RiskClassifier, DropoutPredictor, SentimentCNN
    model_version = Column(String, default="v1")

    # Features usadas para la predicción (académicos)
    gpa = Column(Float, nullable=True)
    enrolled_credits = Column(Integer, nullable=True)
    failed_classes = Column(Integer, nullable=True)
    hito2_nota = Column(Float, default=0.0)
    hito3_nota = Column(Float, default=0.0)
    hito4_nota = Column(Float, default=0.0)
    hito5_nota = Column(Float, default=0.0)

    # Features usadas para la predicción (emocionales)
    checkin_score = Column(Float, default=0.0)   # promedio de checkins
    test_score = Column(Float, default=0.0)      # promedio de tests/assessments
    pss_score = Column(Float, nullable=True)     # Escala de Estrés Percibido
    gad_score = Column(Float, nullable=True)     # Escala GAD-7 (Ansiedad)
    phq_score = Column(Float, nullable=True)     # Escala PHQ-9 (Depresión)
    mood_avg = Column(Float, nullable=True)      # promedio de humor
    confidence = Column(Float, nullable=True)    # confianza de la predicción

    # Resultado de la predicción
    risk_level = Column(String, nullable=False, index=True)  # LOW, MEDIUM, HIGH
    dropout_probability = Column(Float, nullable=True)
    heuristic_score = Column(Float, nullable=True)  # score calculado por heurística

    # Metadata para filtrado en Grafana
    facultad = Column(String, nullable=True, index=True)
    sentiment = Column(String, nullable=True)  # para análisis de sentimientos

    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="ai_predictions")

    # Índices compuestos para queries eficientes en Grafana
    __table_args__ = (
        Index('idx_user_created', 'user_id', 'created_at'),
        Index('idx_model_created', 'model_name', 'created_at'),
        Index('idx_facultad_created', 'facultad', 'created_at'),
    )