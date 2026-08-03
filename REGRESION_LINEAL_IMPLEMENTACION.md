# 📊 Regresión Lineal: Estrés vs Desempeño Académico

## ✅ Implementación Completada

Se ha agregado una análisis de **Regresión Lineal** que correlaciona el nivel de estrés (PSS Score) con el desempeño académico de los estudiantes.

### 📍 Ubicaciones de la Implementación

#### **Backend - Endpoint API**
- **Archivo**: `menta-link/backend/app/api/v1/endpoints/analysis.py`
- **Ruta**: `GET /api/v1/analysis/linear-regression`
- **Acceso**: Solo psicólogos, admins, o estudiantes (ven su propio dato)
- **Retorna**:
  - Lista de puntos (estrés, desempeño)
  - Parámetros de regresión (slope, intercept, r²)
  - Ecuación matemática
  - Interpretación estadística

#### **Frontend - Componente**
- **Archivo**: `menta-link/frontend/components/dashboard/LinearRegressionChart.tsx`
- **Ubicación**: Dashboard de Psicólogo/Admin
- **Features**:
  - Gráfico de dispersión (scatter plot) con Recharts
  - Línea de regresión visualizada
  - Estadísticas: R², Ecuación, Interpretación
  - Análisis de correlación (fuerza y dirección)

#### **Frontend - Integración**
- **Archivo**: `menta-link/frontend/app/dashboard/page.tsx`
- **Ubicación**: Sección Admin/Psychologist (línea ~415)

#### **Backend - Registración del Endpoint**
- **Archivo**: `menta-link/backend/app/api/v1/api.py`
- **Cambios**: Agregado import y router del endpoint analysis

### 🧪 Script de Generación de Datos

- **Archivo**: `menta-link/backend/scripts/generate_test_data_regression.py`
- **Genera**: 100 estudiantes con datos correlacionados
- **Características**:
  - PSS scores: 10-40 (estrés percibido)
  - Calificaciones: Correlación negativa con estrés
  - Múltiples materias por estudiante
  - Datos realistas con ruido gaussiano

### 🚀 Cómo Usar

#### Opción 1: Generar Datos de Prueba

```bash
cd menta-link/backend
python scripts/generate_test_data_regression.py
```

#### Opción 2: Usar Datos Existentes de BD

El endpoint automáticamente:
1. Busca todos los estudiantes activos
2. Obtiene su PSS score más reciente
3. Calcula promedio de calificaciones
4. Aplica regresión lineal
5. Retorna visualización

### 📊 Interpretación de Resultados

#### Ecuación: `y = slope * x + intercept`
- **x**: Nivel de estrés (PSS Score 0-40)
- **y**: Promedio académico (0-100)

#### R² (Coeficiente de Determinación)
- **0.0-0.3**: Correlación débil
- **0.3-0.7**: Correlación moderada
- **0.7-1.0**: Correlación fuerte

#### Correlación
- **Negativa**: Mayor estrés → Menor desempeño
- **Positiva**: Mayor estrés → Mayor desempeño
- **p-valor < 0.05**: Estadísticamente significativo

### 🔧 Cambios Realizados

```
✅ 1. Backend Endpoint (analysis.py)
   - GET /api/v1/analysis/linear-regression
   - Scipy linregress para cálculo matemático

✅ 2. Frontend Component (LinearRegressionChart.tsx)
   - Scatter plot con Recharts
   - Visualización de línea de regresión
   - Estadísticas interactivas

✅ 3. Integración en Dashboard
   - Importación en dashboard/page.tsx
   - Mostrado a psicólogos/admins

✅ 4. API Router
   - Registro en api.py
   - Prefix /analysis

✅ 5. Script de Datos
   - generate_test_data_regression.py
   - 100 usuarios con correlación realista
```

### 📈 Ejemplo de Datos Esperados

**Si hay 10+ estudiantes con datos PSS y académicos:**
- Gráfico mostrará puntos dispersos
- Línea de regresión atravesará la tendencia
- R² indicará fuerza de la relación
- Interpretación explicará la correlación

**Si hay < 2 estudiantes:**
- Mensaje: "Insuficientes datos"
- Recomendación: Ejecutar script de generación

### 🔍 Debugging

#### Verificar datos en BD:
```sql
SELECT COUNT(*) FROM users WHERE role = 'student';
SELECT COUNT(*) FROM assessment_responses WHERE assessment_id = 1;
SELECT COUNT(*) FROM academic_subject_grades;
```

#### Test del endpoint:
```bash
curl -X GET http://localhost:8000/api/v1/analysis/linear-regression \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📝 Notas Técnicas

- **Scipy**: Usa `scipy.stats.linregress()` para cálculo preciso
- **Numpy**: Para operaciones vectorizadas
- **RBAC**: Solo estudiantes ven su dato; psicólogos/admins ven todos
- **Error Handling**: Retorna mensaje claro si faltan datos
- **Performance**: Eficiente con índices en BD (user_id, assessment_id)

---

**Implementado**: 3 de Junio, 2026
**Estado**: ✅ Funcional y Listo para Usar
