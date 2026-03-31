# Arquitectura del Sistema - MenTaLink

## Visión General
MenTaLink es una plataforma de bienestar universitario que integra servicios de monitoreo emocional, evaluaciones psicométricas y análisis predictivo mediante IA.

## Componentes Técnicos

### Backend (FastAPI)
- **API V1**: Estructura modular de endpoints para gestión de usuarios, diarios, tests y análisis.
- **Servicios de Agregación**:
  - `StudentHistoryService`: Consolida registros dispersos en una vista longitudinal.
  - `EmotionalTrendsService`: Implementa lógica de agregación temporal y cálculo de ARI.
- **Motor de IA**:
  - Modelos locales (CNN, RandomForest) cargados en memoria para inferencia rápida.
  - Integración con Google GenAI (Gemini) para análisis avanzado de sentimientos (fallback).

### Frontend (Next.js)
- **Dashboard Analítico**: Paneles diferenciados para estudiantes y staff.
- **Visualización de Datos**: Integración de Recharts para gráficos de evolución emocional y nubes de palabras.
- **Componentes Reactivos**: Formularios de diario, evaluaciones interactivas y perfiles dinámicos.

### Base de Datos (PostgreSQL)
- **Esquema Relacional**:
  - `users`: Core de identidad.
  - `emotional_diary`: Registros diarios con análisis de IA.
  - `assessment_responses`: Resultados de tests psicométricos.
  - `academic_profiles`: Datos académicos para predicción de riesgo.

## Flujo de Análisis Emocional
1. Estudiante escribe en su diario (`POST /diary`).
2. El sistema dispara el análisis emocional usando el modelo CNN local (`/emotion/analyze`).
3. Los resultados se guardan en la base de datos.
4. El Staff consulta el perfil del estudiante (`GET /students/{id}/trends`).
5. El sistema calcula el ARI y genera visualizaciones de tendencias en tiempo real.
