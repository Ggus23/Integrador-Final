# Consultas SQL para Grafana - Visualización por Usuario

## Configuración en Grafana

1. **Data Source:** PostgreSQL en `localhost:5432`
2. **Base de datos:** `mentalink`
3. **Tabla:** `ai_predictions`

> Importante: en este proyecto la base de datos correcta es `mentalink`, según `docker-compose.yml` y `.env`.

## Filtros Globales Recomendados

```sql
-- Filtro por usuario actual (en el dashboard)
$user_id = 123  -- Reemplazar con variable de dashboard

-- Filtro de tiempo (macro de Grafana)
$__timeFilter(created_at)
```

---

## 📊 Query 1: Series de Tiempo - Riesgo del Usuario

Muestra cómo evoluciona el riesgo de deserción en el tiempo para un usuario específico.

```sql
SELECT
  created_at as time,
  dropout_probability as "Probabilidad de Deserción",
  risk_level as "Nivel de Riesgo",
  confidence as "Confianza del Modelo",
  model_name as "Modelo"
FROM ai_predictions
WHERE user_id = $user_id
  AND $__timeFilter(created_at)
ORDER BY created_at ASC
LIMIT 1000
```

**Visualización recomendada:** Time Series / Graph
**Eje Y:** `dropout_probability` (0 a 1)

---

## 📊 Query 2: Gauge - Probabilidad Actual de Deserción

Muestra el último valor de probabilidad de deserción (solo la más reciente).

```sql
SELECT
  MAX(dropout_probability) as "Probabilidad Actual"
FROM ai_predictions
WHERE user_id = $user_id
  AND model_name = 'DropoutPredictor'
ORDER BY created_at DESC
LIMIT 1
```

**Visualización recomendada:** Gauge
**Umbral:** 
- ✅ Verde: < 0.4
- ⚠️ Amarillo: 0.4 - 0.7
- 🔴 Rojo: > 0.7

---

## 📊 Query 3: Métricas Emocionales - RiskClassifier

Muestra la evolución del estrés y humor del usuario.

```sql
SELECT
  created_at as time,
  pss_score as "Puntaje PSS (Estrés)",
  mood_avg as "Promedio de Humor",
  confidence as "Confianza",
  risk_level as "Nivel de Riesgo Emocional"
FROM ai_predictions
WHERE user_id = $user_id
  AND model_name = 'RiskClassifier'
  AND $__timeFilter(created_at)
ORDER BY created_at ASC
```

**Visualización recomendada:** Time Series
**Series separadas:**
- PSS Score (escala 0-40)
- Mood Avg (escala 1-5)

---

## 📊 Query 4: Tabla - Histórico de Predicciones

Tabla con todas las predicciones del usuario.

```sql
SELECT
  created_at,
  model_name,
  risk_level,
  dropout_probability,
  pss_score,
  mood_avg,
  confidence,
  facultad
FROM ai_predictions
WHERE user_id = $user_id
  AND $__timeFilter(created_at)
ORDER BY created_at DESC
LIMIT 100
```

**Visualización recomendada:** Table
**Columnas a mostrar:** Todas las anteriores

---

## 📊 Query 5: Comparativa - Múltiples Usuarios (Cohort)

Compara el riesgo promedio de una cohorte de estudiantes.

```sql
SELECT
  u.full_name as "Usuario",
  ap.user_id,
  AVG(ap.dropout_probability) as "Riesgo Promedio",
  COUNT(*) as "Predicciones",
  MAX(ap.created_at) as "Última Predicción"
FROM ai_predictions ap
JOIN users u ON ap.user_id = u.id
WHERE ap.facultad = $facultad
  AND ap.model_name = 'DropoutPredictor'
  AND $__timeFilter(ap.created_at)
GROUP BY ap.user_id, u.full_name
ORDER BY "Riesgo Promedio" DESC
```

**Visualización recomendada:** Table
**Uso:** Dashboard de psicólogo para priorizar estudiantes

---

## 📊 Query 6: Heatmap - Riesgo por Hora/Día

Heatmap de cuándo los estudiantes reportan más estrés.

```sql
SELECT
  DATE_TRUNC('day', created_at) as "Día",
  EXTRACT(HOUR FROM created_at) as "Hora",
  AVG(pss_score) as "Estrés Promedio"
FROM ai_predictions
WHERE $__timeFilter(created_at)
  AND model_name = 'RiskClassifier'
GROUP BY DATE_TRUNC('day', created_at), EXTRACT(HOUR FROM created_at)
ORDER BY "Día" ASC, "Hora" ASC
```

**Visualización recomendada:** Heatmap
**Uso:** Identificar momentos críticos del día/semana

---

## 📊 Query 7: Estadísticas del Usuario

Panel de métricas clave de un usuario.

```sql
SELECT
  u.full_name as "Nombre",
  COUNT(*) as "Total Predicciones",
  AVG(ap.dropout_probability) as "Riesgo Promedio",
  MAX(ap.dropout_probability) as "Riesgo Máximo",
  MAX(ap.pss_score) as "Estrés Máximo",
  AVG(ap.mood_avg) as "Humor Promedio"
FROM ai_predictions ap
JOIN users u ON ap.user_id = u.id
WHERE ap.user_id = $user_id
GROUP BY u.full_name
```

**Visualización recomendada:** Stat panels (4 paneles lado a lado)

---

## 📊 Query 8: Alertas - Usuarios en Riesgo Alto

Lista usuarios que necesitan intervención inmediata.

```sql
SELECT
  u.full_name as "Estudiante",
  ap.dropout_probability as "Riesgo de Deserción",
  ap.risk_level,
  ap.created_at as "Último Reporte",
  ap.pss_score as "Estrés",
  ap.mood_avg as "Humor",
  'INTERVENCIÓN REQUERIDA' as "Acción"
FROM ai_predictions ap
JOIN users u ON ap.user_id = u.id
WHERE ap.model_name = 'DropoutPredictor'
  AND ap.dropout_probability > 0.7
  AND ap.created_at > NOW() - INTERVAL '7 days'
ORDER BY ap.dropout_probability DESC
```

**Visualización recomendada:** Table con colores condicionales (rojo para alto riesgo)

---

## 🔧 Variables de Dashboard Recomendadas

```
$user_id       = Variable type: Query  → SELECT id FROM users
$facultad      = Variable type: Query  → SELECT DISTINCT facultad FROM ai_predictions
$risk_level    = Variable type: Custom → LOW,MEDIUM,HIGH
$model_name    = Variable type: Custom → RiskClassifier,DropoutPredictor,SentimentCNN
```

---

## ⚡ Índices para Optimización

Asegúrate de que estos índices existan en PostgreSQL:

```sql
-- Ya creados por la migración
CREATE INDEX idx_user_created ON ai_predictions(user_id, created_at);
CREATE INDEX idx_model_created ON ai_predictions(model_name, created_at);
CREATE INDEX idx_facultad_created ON ai_predictions(facultad, created_at);
CREATE INDEX idx_risk_level ON ai_predictions(risk_level);
```

---

## 📌 Configurar Alertas en Grafana

Para alertar automáticamente cuando un usuario está en riesgo:

1. **Panel**: Query 8 (Usuarios en Riesgo Alto)
2. **Alert Rule**:
   - Condition: `dropout_probability > 0.7`
   - For: `5m`
   - Contact Point: Slack / Email
   - Notification: "🚨 Estudiante {{NAME}} en riesgo crítico de deserción"
