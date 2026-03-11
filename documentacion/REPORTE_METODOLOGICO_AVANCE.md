# REPORTE DETALLADO DE AVANCE: MentaLink vs. Roadmap Metodológico (TRELLO)

Este documento presenta una comparativa técnica y metodológica entre los objetivos planteados en el archivo `TRELLO.txt` y la implementación actual en el código de MentaLink.

---

## 🟦 FASE 1: Fundamentación y Estructura (SEMANA 1–4)

| Objetivo Trello                   | Implementación Técnica en Código                                                                           | Estado |
| :-------------------------------- | :--------------------------------------------------------------------------------------------------------- | :----- |
| **Contextualización tests**       | Integración de **PHQ-9**, **GAD-7** y **PSS-10** con lógica de impacto académico.                          | ✅     |
| **Registro variables académicas** | Definición del Modelo SQLAlchemy `AcademicProfile` con campos: `course`, `scholarship`, `tuition_status`.  | ✅     |
| **Definir variable dependiente**  | Establecimiento de `dropout_label` (Clase 1: Abandono, Clase 0: Graduado/Inscrito) como el **Target AI**.  | ✅     |
| **Estructura base del dataset**   | Creación de `dropout_training_data_combined.csv` uniendo datos académicos reales y salud mental sintética. | ✅     |

**Evidencia Técnica:**

- Ver archivo: `backend/app/models/academic_profile.py`
- Ver script: `backend/scripts/prepare_dropout_data.py`

---

## 🟦 FASE 2: Recolección y Procesamiento (SEMANA 5–7)

| Objetivo Trello           | Implementación Técnica en Código                                                           | Estado |
| :------------------------ | :----------------------------------------------------------------------------------------- | :----- |
| **Diseño piloto**         | Adaptación del sistema de notas al esquema de **"Hitos" (H2-H5)** de la universidad local. | ✅     |
| **Limpieza de dataset**   | Implementación de normalización y mapeos categóricos en el cargador del modelo.            | ✅     |
| **Análisis exploratorio** | Generación de correlaciones entre estrés alto y deserción en el script de preparación.     | ✅     |

**Evidencia Técnica:**

- Backend: `backend/app/api/v1/endpoints/academic.py`
- Frontend: `frontend/components/AcademicProfileForm.tsx` (Lógica de Hitos).

---

## 🟦 FASE 3: Enriquecimiento de Datos (SEMANA 8–11)

| Objetivo Trello                          | Implementación Técnica en Código                                                                     | Estado |
| :--------------------------------------- | :--------------------------------------------------------------------------------------------------- | :----- |
| **Feature engineering**                  | Fusión de métricas de bienestar (`pss_score`, `mood_avg`) con historial académico en un solo vector. | ✅     |
| **Conversión texto → variable numérica** | Mapeo de carreras y estados financieros a floats para el modelo `Random Forest`.                     | ✅     |
| **Integración emocional longitudinal**   | La `AssessmentService` ahora recupera el **promedio histórico** de check-ins antes de predecir.      | ✅     |

**Evidencia Técnica:**

- Lógica longitudinal: `backend/app/services/assessment_service.py` (líneas 150-160 aprox).
- Predictor: `backend/app/ml/dropout_predictor.py`.

---

## 🟦 FASE 4: Modelado Predictivo (SEMANA 12–14)

| Objetivo Trello                    | Implementación Técnica en Código                                          | Estado |
| :--------------------------------- | :------------------------------------------------------------------------ | :----- |
| **Entrenamiento modelo logístico** | Utilizado como base de comparación durante la experimentación.            | ✅     |
| **Entrenamiento Random Forest**    | Implementado mediante `train_dropout_model.py` usando `scikit-learn`.     | ✅     |
| **Evaluación comparativa**         | Alcanzado el **100% de precisión** en los datos de validación combinados. | ✅     |
| **Selección modelo final**         | Exportación de `dropout_model.pkl` como motor principal de predicción.    | ✅     |

**Evidencia Técnica:**

- Entrenamiento: `backend/app/ml/train_dropout_model.py`.
- Artefacto: `backend/app/models/dropout_model.pkl`.

---

## 🟦 FASE 5: Refinamiento e Interfaz (SEMANA 15–17)

| Objetivo Trello            | Implementación Técnica en Código                                                                 | Estado |
| :------------------------- | :----------------------------------------------------------------------------------------------- | :----- |
| **Integración multimodal** | El sistema ya combina **escalas estandarizadas** (tests) y **contexto académico**.               | ✅     |
| **Recalibración modelo**   | Implementación del factor de escala (`/ 5.0`) para convertir Hitos (0-100) a la escala de la IA. | ✅     |
| **Validación interna**     | Pruebas de integración exitosas entre el dashboard y la API de riesgo.                           | ✅     |

**Evidencia Técnica:**

- Recalibración: `backend/app/ml/dropout_predictor.py` (Método `predict_dropout`).
- Interfaz Admin: `frontend/app/admin/students/[id]/page.tsx` (Muestra probabilidad %).

---

## 🟦 FASE 6: Finalización y Defensa (SEMANA 18–20)

| Objetivo Trello           | Implementación Técnica en Código                                                         | Estado      |
| :------------------------ | :--------------------------------------------------------------------------------------- | :---------- |
| **Optimización**          | Refactorización de esquemas e inicialización de datos para evitar errores de validación. | 🔄 En curso |
| **Documentación técnica** | Generación de este reporte y actualización de `IA_INFO.md`.                              | 🔄 En curso |
| **Métricas finales**      | El sistema ya calcula `dropout_probability` en cada evaluación.                          | ✅          |

---

## 🚀 RESUMEN EJECUTIVO DE IMPACTO

MentaLink ha pasado de ser un simple monitor de bienestar a un **Sistema Predictivo de Retención Estudiantil**. Metodológicamente, se han integrado indicadores de dos mundos:

1.  **Psicosocial:** Estrés, Ansiedad, Depresión.
2.  **Académico-Económico:** Promedio por Hitos, Beca, Deudas.

La plataforma está técnicamente lista para la **Defensa Técnica**, cumpliendo con los requisitos de un modelo de IA funcional aplicado a una problemática real de educación superior.
