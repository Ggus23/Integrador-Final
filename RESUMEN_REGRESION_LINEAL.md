# 🎯 RESUMEN EJECUTIVO: REGRESIÓN LINEAL IMPLEMENTADA

## ¿Qué se Implementó?

Se agregó un **análisis de regresión lineal** completo que correlaciona:
- **Eje X**: Nivel de estrés (PSS Score 0-40)
- **Eje Y**: Promedio académico (0-100)

Esto permite visualizar matemáticamente la relación entre estrés emocional y desempeño académico de los estudiantes.

---

## 📍 Ubicaciones de Implementación

### 1️⃣ **Backend - Endpoint API** ✅
**Archivo**: `menta-link/backend/app/api/v1/endpoints/analysis.py`

```
GET /api/v1/analysis/linear-regression
```

**Respuesta JSON**:
```json
{
  "points": [
    {"student_id": 1, "student_name": "Juan", "stress_score": 25.5, "academic_avg": 78.2},
    {"student_id": 2, "student_name": "María", "stress_score": 15.3, "academic_avg": 92.1}
  ],
  "regression_line": {
    "slope": -1.234,
    "intercept": 120.5,
    "r_value": -0.856,
    "r_squared": 0.732,
    "p_value": 0.001
  },
  "equation": "y = -1.234x + 120.50",
  "interpretation": "Correlación fuerte y negativa...",
  "data_count": 45,
  "correlation": "negativa",
  "strength": "fuerte"
}
```

---

### 2️⃣ **Frontend - Componente Gráfico** ✅
**Archivo**: `menta-link/frontend/components/dashboard/LinearRegressionChart.tsx`

**Características**:
- ✓ Gráfico scatter plot (puntos dispersos)
- ✓ Línea de regresión lineal
- ✓ Ecuación matemática mostrada
- ✓ R² (coeficiente de determinación)
- ✓ Interpretación automática
- ✓ Estadísticas interactivas

**Ubicación en UI**: Dashboard → Panel Admin/Psicólogo

---

### 3️⃣ **Integración en Dashboard** ✅
**Archivo**: `menta-link/frontend/app/dashboard/page.tsx`

- Importado el componente `LinearRegressionChart`
- Mostrado en la sección Admin/Psychologist
- Junto a otros gráficos de análisis

---

### 4️⃣ **Registro de Router** ✅
**Archivo**: `menta-link/backend/app/api/v1/api.py`

```python
from app.api.v1.endpoints import analysis
api_router.include_router(analysis.router, prefix="/analysis", tags=["analysis"])
```

---

### 5️⃣ **Script de Generación de Datos** ✅
**Archivo**: `menta-link/backend/scripts/generate_test_data_regression.py`

**Genera**: 100 estudiantes con datos realistas y correlacionados

```bash
# Ejecutar para generar datos de prueba
cd menta-link/backend
python scripts/generate_test_data_regression.py
```

---

## 📊 ¿Cómo Funciona?

### Flujo de Datos

```
┌─────────────────────────────────────────────────────────┐
│ 1. BASE DE DATOS                                        │
│    - assessment_responses (PSS scores)                 │
│    - academic_subject_grades (calificaciones)          │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│ 2. BACKEND ENDPOINT                                     │
│    GET /api/v1/analysis/linear-regression              │
│    - Recolecta datos de BD                             │
│    - Aplica scipy.stats.linregress()                   │
│    - Calcula: slope, intercept, R², p-value           │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│ 3. FRONTEND COMPONENT                                   │
│    LinearRegressionChart.tsx                            │
│    - Dibuja scatter plot                               │
│    - Dibuja línea de regresión                         │
│    - Muestra estadísticas                              │
└─────────────────────────────────────────────────────────┘
```

### Cálculo Matemático

```
y = slope * x + intercept

Ejemplo:
y = -1.234 * PSS_score + 120.50

Si un estudiante tiene PSS=25:
y = -1.234 * 25 + 120.50 = 89.65 (promedio académico esperado)
```

### Interpretación de R²

- **R² = 0.73 (73%)** → La ecuación explica el 73% de la variación de calificaciones
- Mayor R² = Relación más fuerte entre estrés y desempeño

---

## 🚀 Cómo Usar

### Opción A: Con Datos de la BD Existente

1. Asegúrate que hay al menos 2 estudiantes con:
   - PSS assessment (últimas respuestas)
   - Calificaciones académicas registradas

2. Accede al Dashboard como Psicólogo/Admin

3. Verás el gráfico de regresión lineal automáticamente

### Opción B: Generar Datos de Prueba (100 usuarios)

```bash
# 1. Ir al directorio backend
cd menta-link/backend

# 2. Ejecutar el script
python scripts/generate_test_data_regression.py

# Salida esperada:
# ✓ 100/100 usuarios creados...
# ✅ 100 usuarios de prueba generados exitosamente
#    - PSS scores: 10-40 (estrés percibido)
#    - Desempeño académico correlacionado negativamente
#    - Datos listos para análisis de regresión lineal
```

3. Recarga el Dashboard → Verás la regresión con 100 puntos

---

## 📈 Ejemplo de Salida Esperada

### Con 100 estudiantes de prueba:

```
📊 CORRELACIÓN: ESTRÉS vs DESEMPEÑO ACADÉMICO

Ecuación: y = -1.847x + 105.32
R²: 75.8% (Correlación fuerte)
Estudiantes: 100

Interpretación:
- Correlación fuerte y negativa entre estrés y desempeño
- R² = 0.758 (explica 75.8% de la varianza)
- P-valor = 0.0001 (estadísticamente significativo)
- Por cada punto de aumento en estrés, el desempeño baja ~1.85 puntos

Fuerza: Fuerte
Correlación: Negativa
```

---

## ✨ Características Implementadas

- ✅ Cálculo de regresión lineal usando scipy
- ✅ Validación de datos mínimos (≥2 puntos)
- ✅ Gráfico scatter plot interactivo
- ✅ Línea de regresión visualizada
- ✅ Estadísticas automáticas (R², ecuación, p-valor)
- ✅ Interpretación en lenguaje natural
- ✅ Generación de datos de prueba
- ✅ RBAC (Acceso: Psicólogo/Admin)
- ✅ Manejo de errores robusto

---

## 🔍 Debugging

### Ver Datos en BD:

```sql
-- Verificar estudiantes
SELECT COUNT(*) FROM users WHERE role = 'student';

-- Verificar PSS assessments
SELECT COUNT(*) FROM assessment_responses WHERE assessment_id = 1;

-- Verificar calificaciones
SELECT COUNT(*) FROM academic_subject_grades;
```

### Test del Endpoint:

```bash
curl -X GET http://localhost:8000/api/v1/analysis/linear-regression \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 📝 Tecnologías Usadas

- **Backend**: FastAPI, SQLAlchemy, Scipy, Numpy, PostgreSQL
- **Frontend**: React, Next.js, TypeScript, Recharts
- **Estadística**: Scipy.stats.linregress
- **Algoritmo**: Regresión lineal por mínimos cuadrados

---

## ✅ Checklist de Verificación

```
[✓] Backend endpoint implementado
[✓] Cálculo de regresión lineal funcional
[✓] Frontend component creado
[✓] Integración en dashboard
[✓] Router registrado
[✓] Script de datos de prueba
[✓] Documentación completa
[✓] Manejo de errores
[✓] RBAC implementado
[✓] Código listo para producción
```

---

## 🎓 Próximos Pasos (Opcionales)

- [ ] Agregar filtros por fecha
- [ ] Comparación entre grupos/cohortes
- [ ] Predicción de riesgo basada en regresión
- [ ] Análisis de residuos
- [ ] Regresión polinomial
- [ ] Análisis de múltiples variables

---

**Fecha de Implementación**: 3 de Junio, 2026  
**Estado**: ✅ Completado y Listo para Usar  
**Versión**: 1.0
