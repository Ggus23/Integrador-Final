# FUNCIONALIDADES FALTANTES, MEJORAS Y DEUDA TÉCNICA

## 1. Prioridad Alta: Infraestructura y Calidad de Código 🚨

### Backend (FastAPI)
- **Optimización y Seguridad (Backend Core)**:
  - **Base de Datos**: Definir índices para consultas frecuentes (ej. reportes históricos).
  - **Auth**: Implementar *Refresh Tokens* para sesiones seguras de larga duración.
  - **Logging**: Integrar logs estructurados o Sentry para monitoreo en producción.

### Backend
- **Optimización y Seguridad (Backend Core)**:
  - **Base de Datos**: Definir índices para consultas frecuentes (ej. reportes históricos).
  - **Auth**: Implementar *Refresh Tokens* para sesiones seguras de larga duración.
  - **Logging**: Integrar logs estructurados o Sentry para monitoreo en producción.

### Frontend
- **Accesibilidad (a11y)**:
  - Auditoría completa con lector de pantalla pendiente (NVDA/VoiceOver).
  - Verificar contraste de colores y navegación por teclado en todos los formularios.
- **Internacionalización (i18n)**:
  - Preparar estructura para soporte multi-idioma (actualmente hardcoded en español/inglés mixto).
- **Manejo de Errores UI**:
  - Componentes de "Error Boundary" para capturar fallos de renderizado.
  - Toasts/Notificaciones consistentes para errores de red.

## 3. Estado Actual: En Progreso

- **Backend Core**:
  - *Consolidación de Servicios*: Servicios principales (`Checkin`, `Risk`, `Alert`) implementados y bajo pruebas.
  - *Estabilidad*: Cobertura de tests ampliada (16 tests pasando: Auth, Flows, Errors, Business Logic).
  - *Foco Actual*: Asegurar la robustez de la lógica de negocio antes de la integración masiva de frontend.

## 4. Estrategia de Implementación de Inteligencia Artificial (IA)

### Estado Actual: Sistema Experto (IA Heurística)
Actualmente, el sistema utiliza un **Modelo de Caja Blanca** basado en reglas ponderadas (`backend/app/ml/risk_classifier.py`).

*   **Implementación**: `Risk = (0.4 * PSS_Score) + (0.3 * Mood_Avg) + (0.3 * Bad_Days_Freq)`
*   **Justificación Ética (ODS 3)**: Prioriza la **explicabilidad** inmediata para un contexto académico. Evita sesgos ocultos de modelos pre-entrenados.
*   **Infraestructura ML**: Se han definido interfaces y protocolos en `app/ml/` (Predictor, Explainer, Features) como placeholders para facilitar la transición a modelos entrenados (Fase 2). Tests de casos borde pendientes de implementación real.

### Hoja de Ruta: Evolución a Machine Learning
1.  **Fase 1 (En curso)**: Recolección de datos etiquetados (Respuestas de estudiantes + Calificación clínica real).
2.  **Fase 2 (Futura)**: Entrenamiento de `RandomForestClassifier` (`scikit-learn`) usando los datos recolectados.
3.  **Fase 3 (Explicabilidad/XAI)**: Integración de **SHAP** para interpretar las predicciones del modelo de ML y mantener la transparencia.

## 5. Implementado 🚀

### Backend
- **Dependencias de Desarrollo**: Se agregaron `pytest`, `pytest-asyncio`, `black`, `isort`, `flake8`, `mypy` a `requirements.txt`.
- **Configuración de Linters**: Se creó `pyproject.toml` (Black, Isort) y `.flake8` (Flake8) con reglas estándar (line-length 88).
- **Documentación Base**: Se populó `README.md`, `ethics_guidelines.md` y `scales_definitions.md`.
- **Servicios Backend**: Implementados (con placeholders funcionales) `NotificationService`, `ScoreService`, `RiskService`, `AlertService`, `CheckinService`.
- **Nuevas Pruebas**: Agregados `test_checkins.py`, `test_assessments.py`, `test_alerts.py`, `test_errors.py` (Manejo de errores globales 404/500).
- **Manejo de Errores**: Implementados handlers centralizados en `app/core/errors.py` para respuestas JSON consistentes.
- **DevOps Completado**:
  - Configuración de Monorepo unificado.
  - CI/CD Implementado con GitHub Actions (Frontend y Backend separados).
  - Pre-commit hooks configurados para limpieza automatizada de código.
- **Arquitectura Simplificada**:
  - Eliminación de roles ambiguos (Tutor) para centrarse en la relación Estudiante-Psicólogo (ODS 3).
  - Validación de roles en creación de usuarios (Admin bloqueado en signup público).
- **Recuperación de Contraseña**:
  - Lógica de SMTP implementada (con fallback a Mock si no hay credenciales).
  - Tokens de un solo uso con expiración configurados y validados.
