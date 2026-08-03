# Integración de Datos de IA a PostgreSQL y Grafana

**Fecha:** 28 de mayo de 2026  
**Estado:** ✅ Listo para Grafana y PostgreSQL  
**Responsables de Siguiente Paso:**
- Equipo PostgreSQL: Verificar que los datos se guarden correctamente
- Equipo Grafana: Configurar dashboards y seguridad de acceso

---

## 📋 Resumen de Cambios Realizados en Backend

### 1. **Modelo de Base de Datos Actualizado**
**Archivo:** `app/models/ai_prediction.py`

Se expandió la tabla `ai_predictions` con nuevos campos para capturar toda la telemetría de los modelos IA:

```sql
-- Nuevos campos agregados:
- model_name (VARCHAR): Identifica qué modelo hizo la predicción
- pss_score (FLOAT): Puntaje de estrés percibido (0-40)
- mood_avg (FLOAT): Promedio de humor (1-5)
- confidence (FLOAT): Confianza del modelo en su predicción
- heuristic_score (FLOAT): Score alternativo si el modelo falla
- facultad (VARCHAR): Programa académico (para filtrado)
- sentiment (VARCHAR): Clasificación emocional (para CNN)

-- Índices optimizados para Grafana:
- idx_user_created: (user_id, created_at)
- idx_model_created: (model_name, created_at)
- idx_facultad_created: (facultad, created_at)
```

**Migración Alembic:** `alembic/versions/b1c2d3e4f5g6_add_telemetry_fields_to_ai_predictions.py`

✅ **Ya ejecutada:** `alembic upgrade head`

### 2. **Sistema de Persistencia de Predicciones**
**Archivo:** `app/utils/influx_logger.py` (antes era solo InfluxDB)

**CAMBIO CRÍTICO:** Se cambió de InfluxDB a PostgreSQL

```python
# Antes (InfluxDB):
log_prediction_to_influx()  → InfluxDB

# Ahora (PostgreSQL):
log_prediction_to_influx()  → PostgreSQL (tabla ai_predictions)
```

**Cómo funciona:**
- Los modelos IA llaman a `log_prediction_to_influx(model_name, student_id, fields, tags)`
- Internamente guarda en PostgreSQL (no en InfluxDB)
- Se ejecuta en background (threading) para no bloquear la API
- Maneja excepciones silenciosamente

**Compatibilidad:** El nombre de la función no cambió para minimizar cambios en:
- `app/ml/risk_classifier.py`
- `app/ml/dropout_predictor.py`
- `app/ml/emotion/predictor.py`

### 3. **Datos Capturados por Modelo**

#### RiskClassifier (Clasificador de Riesgo Emocional)
```python
log_prediction_to_influx(
    model_name="RiskClassifier",
    student_id=user_id,
    fields={
        "confidence": 0.92,        # Confianza (0-1)
        "pss_score": 28,           # Estrés percibido
        "mood_avg": 3.5,           # Promedio de humor (1-5)
        "heuristic_score": 0.65    # Score alternativo
    },
    tags={
        "risk_level": "HIGH",      # LOW, MEDIUM, HIGH
        "facultad": "Ingeniería"   # Programa académico
    }
)
```

#### DropoutPredictor (Predictor de Deserción)
```python
log_prediction_to_influx(
    model_name="DropoutPredictor",
    student_id=user_id,
    fields={
        "dropout_probability": 0.65,   # Prob. de deserción (0-1)
        "heuristic_score": 0.63,       # Score alternativo
        "confidence": 0.88
    },
    tags={
        "risk_level": "MEDIUM",
        "facultad": "Medicina"
    }
)
```

#### SentimentCNN (Análisis de Emociones)
```python
log_prediction_to_influx(
    model_name="SentimentCNN",
    student_id=user_id,
    fields={
        "confidence": 0.95
    },
    tags={
        "sentiment": "ANXIETY",        # HAPPY, SAD, ANXIETY, ANGER
        "facultad": "Psicología"
    }
)
```

---

## 🔐 Seguridad - Restricción de Acceso

### Arquitectura de Acceso

```
┌─────────────────────────────────────────┐
│ Backend (API FastAPI)                   │
│ ├─ Datos guardados en PostgreSQL        │
│ │  └─ Tabla: ai_predictions             │
│ └─ NO expone endpoints para estudiantes │
│    ni psicólogos que lean estas datos   │
└─────────────────────────────────────────┘
          ↓ (ConnectionString + Auth)
┌─────────────────────────────────────────┐
│ PostgreSQL                              │
│ └─ Tabla: ai_predictions (datos IA)     │
└─────────────────────────────────────────┘
          ↓ (SOLO conexión Grafana)
┌─────────────────────────────────────────┐
│ Grafana (SuperAdmin only)               │
│ ├─ Data Source → PostgreSQL             │
│ ├─ Dashboards por usuario               │
│ └─ Authentication → SuperAdmin          │
└─────────────────────────────────────────┘
```

### Restricciones de Acceso en Backend

✅ **Los datos NO son accesibles vía API para:**
- Estudiantes (rol: `Student`)
- Psicólogos (rol: `Psychologist`)
- Directores (rol: `Director`)

✅ **Acceso SOLO a través de Grafana:**
- SuperAdmin en Grafana puede ver todas las predicciones
- Las variables de dashboard pueden filtrar por usuario
- Grafana usa conexión segura a PostgreSQL

### Cómo Configurar en Grafana

1. **Data Source PostgreSQL:**
   - Host: `localhost` (o IP del servidor)
   - Port: `5432`
   - Database: `mentalink_db` (confirmar nombre)
   - SSL Mode: `require` (recomendado)

2. **Autenticación de Grafana:**
   - SOLO SuperAdmin puede crear/editar dashboards de predicciones
   - Los usuarios regulares no ven estas métricas

3. **Variables de Dashboard:**
   ```
   $user_id       → SELECT id FROM users (filtro por estudiante)
   $facultad      → SELECT DISTINCT facultad FROM ai_predictions
   $model_name    → Opciones: RiskClassifier, DropoutPredictor, SentimentCNN
   ```

---

## 📊 Consultas SQL Listos para Grafana

**Ubicación:** `docs/grafana_queries.md`

Se proporcionan 8 consultas SQL completas y listas para usar:

1. **Series de Tiempo** - Evolución del riesgo por usuario
2. **Gauge** - Probabilidad actual de deserción
3. **Métricas Emocionales** - Estrés y humor en el tiempo
4. **Tabla Histórico** - Todas las predicciones del usuario
5. **Comparativa Cohort** - Riesgo promedio por facultad
6. **Heatmap** - Cuándo reportan más estrés
7. **Estadísticas** - Métricas clave del usuario
8. **Alertas** - Usuarios en riesgo crítico (>0.7)

---

## 🗄️ Información de Base de Datos

### Tabla: `ai_predictions`

```sql
-- Estructura simplificada
CREATE TABLE ai_predictions (
  id BIGINT PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  
  -- Identificación de la predicción
  model_name VARCHAR,           -- RiskClassifier, DropoutPredictor, SentimentCNN
  model_version VARCHAR,
  
  -- Features de entrada (académicos)
  gpa FLOAT,
  enrolled_credits INTEGER,
  failed_classes INTEGER,
  hito2_nota FLOAT, hito3_nota FLOAT, hito4_nota FLOAT, hito5_nota FLOAT,
  checkin_score FLOAT,
  test_score FLOAT,
  
  -- Features de entrada (emocionales)
  pss_score FLOAT,              -- Escala de Estrés Percibido
  mood_avg FLOAT,               -- Promedio de humor
  
  -- Resultados
  risk_level VARCHAR,           -- LOW, MEDIUM, HIGH
  dropout_probability FLOAT,    -- 0.0 a 1.0
  confidence FLOAT,             -- Confianza del modelo
  heuristic_score FLOAT,        -- Score alternativo
  
  -- Metadatos para Grafana
  facultad VARCHAR,             -- Programa académico
  sentiment VARCHAR,            -- HAPPY, SAD, ANXIETY, ANGER
  
  created_at TIMESTAMP PRIMARY KEY
);

-- Índices para queries eficientes
CREATE INDEX idx_user_created ON ai_predictions(user_id, created_at);
CREATE INDEX idx_model_created ON ai_predictions(model_name, created_at);
CREATE INDEX idx_facultad_created ON ai_predictions(facultad, created_at);
CREATE INDEX idx_risk_level ON ai_predictions(risk_level);
```

---

## 🔄 Flujo de Datos

```
1. Usuario (Estudiante/Psicólogo) interactúa con API
   ↓
2. Endpoints académicos/emocionales se ejecutan
   ↓
3. Modelos IA generan predicción (RiskClassifier, DropoutPredictor, etc.)
   ↓
4. Backend llama: log_prediction_to_influx(...)
   ↓
5. Predicción se guarda en PostgreSQL (tabla ai_predictions)
   ↓
6. SuperAdmin ve en Grafana (NOT visible en API)
```

---

## ✅ Checklist - Qué Está Listo

### Backend (Proyecto de Grado)
- ✅ Modelo `AIPrediction` expandido con todos los campos
- ✅ Sistema de persistencia en PostgreSQL implementado
- ✅ Migración Alembic creada y ejecutada
- ✅ Código comentado para auditoría de proyecto
- ✅ Compatibilidad mantenida con modelos IA existentes
- ✅ Seguridad: NO expone datos a estudiantes/psicólogos

### PostgreSQL (Equipo PostgreSQL)
- ⏳ Verificar que la migración se aplicó correctamente
- ⏳ Confirmar permisos de usuario de Grafana
- ⏳ Validar índices creados correctamente
- ⏳ Hacer backups de la estructura

### Grafana (Equipo Grafana)
- ⏳ Crear Data Source → PostgreSQL
- ⏳ Configurar autenticación → SuperAdmin only
- ⏳ Crear dashboards usando las 8 consultas SQL provided
- ⏳ Configurar alertas automáticas (>0.7 deserción)
- ⏳ Crear variables de dashboard para filtrado

---

## 📝 Documentación Adicional

- **Modelo AI:** `docs/ai_models/AI_MODEL.md`
- **Queries Grafana:** `docs/grafana_queries.md`
- **Especificaciones Técnicas:** `especificaciones_tecnicas_analitica.md`
- **Migración:** `alembic/versions/b1c2d3e4f5g6_add_telemetry_fields_to_ai_predictions.py`

---

## 🤝 Responsabilidades

### Tu Proyecto de Grado
- ✅ Sistema de persistencia de predicciones
- ✅ Captura de telemetría de modelos IA
- ✅ Datos guardados para auditoría

### Equipo PostgreSQL
- ⏳ Gestionar permisos y backups
- ⏳ Monitoreo de rendimiento

### Equipo Grafana
- ⏳ Visualización y dashboards
- ⏳ Configuración de alertas
- ⏳ Control de acceso (SuperAdmin only)

---

## 🚀 Próximos Pasos

1. **Equipo PostgreSQL:** Validar que las tablas se crearon correctamente
2. **Equipo Grafana:** Crear Data Source a PostgreSQL
3. **Todos:** Hacer pruebas end-to-end
4. **Documentación:** Actualizar con URLs/credenciales finales

---

**Nota Final:** Este documento es parte del proyecto de grado. Todo lo realizado en backend está comentado y documentado para fines académicos.
