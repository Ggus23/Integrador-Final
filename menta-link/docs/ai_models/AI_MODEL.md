# Documentación de Modelos de Inteligencia Artificial - MenTaLink

MenTaLink utiliza una arquitectura híbrida de Inteligencia Artificial para el monitoreo preventivo del bienestar estudiantil, combinando procesamiento de lenguaje natural (NLP) con modelos predictivos clásicos.

---

## 1. Clasificación Emocional (CNN)

Se utiliza una **Red Neuronal Convolucional (CNN)** implementada en PyTorch para analizar el contenido emocional de los "Check-ins" y diarios de los estudiantes.

### Especificaciones Técnicas
- **Arquitectura**: 
  - Capa de **Embedding (128d)** para representación semántica.
  - **Conv1D (128 filtros, kernel=5)** para captura de patrones secuenciales.
  - **Global MaxPooling** para extracción de características globales.
  - **Dropout (0.5)** para regularización.
  - **Capa Densa final** con activación Softmax para clasificación multiclase.
- **Categorías (Labels)**: `feliz`, `neutral`, `triste`, `ansioso`, `frustrado`, `motivado`.
- **Preprocesamiento**: Tokenización personalizada, normalización de longitud (100 tokens) y limpieza de caracteres especiales.

### Estado Actual
El modelo ha sido re-entrenado recientemente con un dataset optimizado (`text.csv`), logrando una mayor precisión en la detección de estados de ansiedad y tristeza, críticos para la detección de riesgos.

---

## 2. Academic Risk Index (ARI)

El **ARI** es un algoritmo dinámico que cuantifica el riesgo psico-académico basándose en la evolución emocional del estudiante.

### Metodología de Cálculo
El índice no es estático; se calcula analizando la ventana deslizante de los últimos 30 días de actividad:
- **Peso Emocional**: Se asignan penalizadores a emociones negativas (Tristeza: 0.4, Ansiedad: 0.3, Frustración: 0.2).
- **Factor de Tendencia**: Si la motivación detectada por la CNN muestra una tendencia decreciente, el ARI se incrementa en un 10% preventivo.

### Umbrales de Alerta
- **Verde (Bajo)**: 0.0 - 0.3 (Bienestar estable).
- **Amarillo (Medio)**: 0.3 - 0.6 (Se recomienda seguimiento).
- **Rojo (Alto)**: > 0.6 (Dispara alerta inmediata al equipo psicológico).

---

## 3. Clasificador de Riesgo Preventivo (Random Forest)

Este modelo evalúa el riesgo basándose en métricas cuantitativas provenientes de los tests psicométricos (PHQ-9, GAD-7, PSS-10).

- **Algoritmo**: Random Forest Classifier (Scikit-Learn).
- **Features**: Puntajes totales de tests, frecuencia de respuestas críticas y variabilidad emocional semanal.
- **Implementación**: `backend/app/ml/risk_classifier.py`.

---

## 4. Predictor de Abandono (Dropout Predictor)

Modelo avanzado que estima la probabilidad de deserción escolar cruzando factores socio-emocionales con hitos académicos.

- **Datos de Entrada**: Promedio de notas (Hitos H1-H5), estado financiero, y el **ARI** acumulado.
- **Salida**: Probabilidad (0-1) y Nivel de Riesgo de Abandono.
- **Archivo**: `backend/app/ml/dropout_predictor.py`.

---

## 🛠 Mantenimiento y Evolución
Los modelos son monitoreados mediante scripts de validación integrados en el pipeline de CI/CD. El re-entrenamiento se realiza periódicamente cuando se recolectan nuevos datos anónimos del piloto universitario para ajustar los sesgos locales.
