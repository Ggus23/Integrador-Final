# ⚡ GUÍA RÁPIDA: REGRESIÓN LINEAL

## 🎯 En 3 Pasos

### Paso 1: Generar Datos de Prueba (100 usuarios)
```bash
cd menta-link/backend
python scripts/generate_test_data_regression.py
```
✅ Resultado: 100 estudiantes con PSS scores y calificaciones

### Paso 2: Reiniciar el Servidor Backend
```bash
# El endpoint está automáticamente registrado
# Solo reinicia si hiciste cambios manuales
```

### Paso 3: Ver el Gráfico en el Dashboard
1. Login como **Psicólogo** o **Admin**
2. Ir a **Dashboard**
3. Bajar a la sección "Análisis"
4. Ver gráfico: **📊 Correlación: Estrés vs Desempeño Académico**

---

## 📊 Lo Que Verás

```
GRÁFICO:
- Puntos azules: Cada estudiante (estrés, calificación)
- Línea roja: Tendencia matemática
- Si está bajando: Más estrés = Menos desempeño ✓

ESTADÍSTICAS:
- Ecuación: y = -1.23x + 105.2
- R²: 75.8% (Fuerza de relación)
- Estudiantes: 100 (con datos completos)
- Interpretación: "Correlación fuerte y negativa"
```

---

## 🔧 Archivos Modificados/Creados

| Archivo | Tipo | Descripción |
|---------|------|-------------|
| `analysis.py` | ✨ NUEVO | Backend endpoint |
| `LinearRegressionChart.tsx` | ✨ NUEVO | Frontend component |
| `generate_test_data_regression.py` | ✨ NUEVO | Script de datos |
| `dashboard/page.tsx` | 📝 MODIFICADO | Integración |
| `api/v1/api.py` | 📝 MODIFICADO | Router |

---

## 🎨 Características

✅ Gráfico interactivo  
✅ Cálculo automático  
✅ Ecuación mostrada  
✅ R² (varianza explicada)  
✅ Interpretación automática  
✅ 100+ estudiantes de prueba  
✅ Datos correlacionados realistas  

---

## ❓ FAQ

### ¿Qué es R²?
Porcentaje de variación de calificaciones explicado por estrés.
- 75% = Buena relación
- 50% = Relación moderada
- 10% = Relación débil

### ¿Slope negativo?
Mayor estrés → Menor desempeño (relación negativa) ✓

### ¿Cuántos estudiantes necesito?
Mínimo 2. Script genera 100 para visualización clara.

### ¿Cómo actualizo datos?
Automático cada vez que accedes. Los nuevos PSS/calificaciones se incluyen.

### ¿Quién lo ve?
Solo Psicólogos y Admins (RBAC implementado).

---

## 📞 Soporte

Ver documentación completa:
- `RESUMEN_REGRESION_LINEAL.md` - Explicación detallada
- `REGRESION_LINEAL_IMPLEMENTACION.md` - Detalles técnicos

---

**¡Listo para usar! 🚀**
