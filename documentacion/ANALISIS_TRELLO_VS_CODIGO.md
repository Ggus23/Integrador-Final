# ANALISIS COMPARATIVO: TABLERO TRELLO VS. IMPLEMENTACIÓN REAL

He analizado el tablero de Trello **"Proyecto-MentaLink"** y lo he comparado con el estado actual del código en el repositorio. Aquí tienes el desglose detallado.

---

## 📌 Resumen de Situación

El tablero de Trello refleja una planificación lineal de **20 semanas**. Sin embargo, la implementación técnica ha avanzado de forma **no lineal**, priorizando el "cerebro" del sistema (la IA de abandono).

**Resultado:** Hemos completado funcionalidades de la **Semana 14** antes de terminar detalles de la **Semana 4**.

---

## 🔍 Desglose por Fases del Trello

### 🟦 FASE 1: Fundamento Psicológico (Semanas 1–4)

- **En Trello:** Se enfoca en la definición de variables y seguridad básica.
- **Estado Real:**
  - ✅ **Variables Académicas:** Implementado al 100% con el modelo `AcademicProfile` y el sistema de **Hitos**.
  - ✅ **Nivel de Riesgo:** Integrado en el motor de IA.
  - ❌ **Pendiente:** Botón de "Agendar Cita" y Validación de Dominio Institucional (Seguridad).

### 🟦 FASE 2: Piloto y Perfil Emocional (Semanas 5–7)

- **En Trello:** Preparación del piloto y gráficos de tendencia.
- **Estado Real:**
  - ✅ **Preparación Piloto:** Hemos adaptado los **Hitos (H2-H5)** específicamente para tu universidad, lo cual es el corazón del piloto.
  - 🔄 **Gráficos:** Ya existen gráficos de tendencia en el dashboard, pero falta conectar específicamente el gráfico de "Evolución de Riesgo de Abandono".

### 🟦 FASE 8–11: IA de Voz y Texto (Pendiente)

- **En Trello:** Speech-to-Text y Nubes de palabras.
- **Estado Real:**
  - ⌛ **Pendiente:** Esta es la siguiente frontera técnica. Aún no hay lógica de procesamiento de audio en el backend.

### 🟦 FASE 12–14: El Modelo Predictivo (Semana 12–14)

- **En Trello:** Entrenamiento de modelos y selección del mejor algoritmo.
- **Estado Real:**
  - 🚀 **SUPERADO/COMPLETO:** Esta fase ya está terminada en el código. Tenemos el modelo **Random Forest** entrenado, serializado en `.pkl` e integrado en la API. **Hemos ganado 3 meses de tiempo aquí**.

---

## ⚖️ Comparativa de Checklists

| Requisito Trello                    | Estado en Código | Ubicación Técnica                          |
| :---------------------------------- | :--------------- | :----------------------------------------- |
| Registro de Carrera/Semestre        | ✅ Completo      | `AcademicProfile` model / Formulario Hitos |
| Modelo Predictivo Random Forest     | ✅ Completo      | `backend/app/ml/dropout_predictor.py`      |
| Integración de Variables Académicas | ✅ Completo      | API `/academic/me`                         |
| Clasificación de Riesgo (B/M/A)     | ✅ Completo      | `RiskSummary` logic                        |
| IA de Voz (Speech-to-Text)          | ❌ Pendiente     | -                                          |
| Reconocimiento Facial (CNN)         | ❌ Pendiente     | -                                          |
| Chat de Consulta (LLM)              | ❌ Pendiente     | -                                          |

---

## 🎯 Recomendaciones para la Defensa

1.  **Destaca el adelanto:** Puedes decir que la arquitectura base permitió saltar del diseño a la implementación del modelo (Semana 12) mucho antes de lo previsto.
2.  **Sincronización:** Recomiendo marcar como "Hecho" en Trello las tarjetas de "Modelo Predictivo" y "Registro de Variables", ya que el código está listo para ser defendido.
3.  **Próximo Paso:** Si quieres seguir el Trello, deberíamos empezar con la **Fase de IA de Voz (Semana 8-11)** o el **Chat con LLM (Semana 12)**.

¿Te gustaría que actualicemos alguna de estas funcionalidades pendientes (como la IA de voz) o prefieres que sigamos puliendo el sistema de predicción actual?
