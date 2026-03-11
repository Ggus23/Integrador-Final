# Implementación de Inteligencia Artificial en MentaLink (v2.0)

Este documento detalla la estructura, las librerías y los modelos de Inteligencia Artificial implementados en el proyecto para la detección temprana de riesgos de salud mental y abandono estudiantil.

---

## 1. Descripción General y Arquitectura

El sistema opera con dos motores de IA complementarios que permiten una visión 360° del estudiante:

1.  **Clasificador de Riesgo de Salud Mental** (`RiskClassifier`): Evalúa el bienestar emocional inmediato basándose en tests (PHQ-9, GAD-7) y check-ins diarios (Ánimo, Estrés).
2.  **Predictor de Abandono Estudiantil** (`DropoutPredictor`): **NUEVA INTEGRACIÓN**. Analiza la probabilidad de deserción cruzando factores académicos, financieros y psicológicos longitudinales.

Ambos operan bajo una **lógica híbrida**:

- **Machine Learning (Random Forest)** como motor principal.
- **Sistema Experto (Heurística)** como motor de respaldo (fallback) en caso de ausencia de modelos serializados.

---

## 2. Stack Tecnológico

| Librería         | Propósito                                                                  |
| :--------------- | :------------------------------------------------------------------------- |
| **scikit-learn** | Implementación de algoritmos de bosque aleatorio y métricas de validación. |
| **pandas**       | Procesamiento de datasets y normalización de variables académicas.         |
| **joblib**       | Serialización y persistencia de los archivos de peso del modelo (`.pkl`).  |

---

## 3. Especificaciones de los Modelos

### A. Clasificador de Riesgo (Bienestar)

- **Tipo**: Random Forest Classifier.
- **Entradas (Features)**: Puntuación PSS-10, promedio de ánimo, frecuencia de estados bajos, presión académica percibida.
- **Salida**: Clasificación categórica (Low, Medium, High).
- **Archivo**: `backend/app/models/risk_model.pkl`.

### B. Predictor de Abandono (Academic/Hybrid)

- **Tipo**: Random Forest Classifier (Entrenado con dataset de retención universitaria).
- **Entradas Académicas**: Carrera, Beca, Estado de pensiones, Unidades aprobadas, **Promedio por Hitos (H1-H5)**.
- **Entradas Psicológicas**: Estrés acumulado, Estabilidad emocional.
- **Normalización**: Las notas en escala **0-100** se recalibran automáticamente a escala **0-20** para compatibilidad con el dataset de entrenamiento.
- **Archivo**: `backend/app/models/dropout_model.pkl`.

---

## 4. Flujo de Inferencia y Multimodalidad

La gran ventaja del sistema es su capacidad **Multimodal**. Un solo test de estrés (`PSS-10`) ahora dispara dos procesos:

1.  Calcula el nivel de riesgo emocional.
2.  Inyecta ese resultado en el modelo de abandono para recalcular la probabilidad de que el alumno deje la carrera.

**Lógica de Salida:**

- `dropout_probability`: `float(0.0 - 1.0)`
- `dropout_risk`: `string` ("Low", "Medium", "High") basado en umbrales de probabilidad (> 0.7 = RIESGO ALTO).

---

## 5. Estructura de Archivos del Módulo IA

```text
backend/app/
├── ml/
│   ├── risk_classifier.py    # Lógica de bienestar emocional
│   ├── dropout_predictor.py  # Lógica de predicción de abandono
│   └── train_dropout_model.py # Script de entrenamiento académico
└── models/
    ├── risk_model.pkl        # Pesos del modelo de riesgo
    └── dropout_model.pkl     # Pesos del modelo de abandono
```

---

## 6. Mantenimiento y Retraining

Para re-entrenar el modelo de abandono con nuevos datos del piloto:

1.  Actualizar `data/dataset.csv`.
2.  Ejecutar `python scripts/prepare_dropout_data.py`.
3.  Ejecutar `python app/ml/train_dropout_model.py`.
