## 1. Seguridad y Ética
- **Registro de Auditoría**: Implementado para `VIEW_STUDENT_PROFILE` y `RESOLVE_ALERT`.
- **Rate Limiting**: `slowapi` en Login (5 req/min).
- **Minimización de Datos**: Script de anonimización `scripts/anonymize_data.py`.
- **Arquitectura Simplificada**: Eliminación de rol Tutor; enfoque estricto Estudiante-Psicólogo.

## 2. Flujos Principales
- **Auth**: JWT, RBAC (OAuth2 Standard).
- **Recuperación de Contraseña**: Implementación completa SMTP + Token temporal único (con fallback Mock).
- **UX**: Redirección automática al Dashboard tras Login/Signup.
- **Validación de Roles**: Bloqueo de creación de Admin vía endpoint público.

## 3. Evaluaciones y Riesgo
- **Tests**: PSS-10, GAD-7, PHQ-9.
- **Riesgo**: Algoritmo ponderado (Caja Blanca) con Tests unitarios.
- **Endpoint**: `/api/v1/assessments/` (Corregido 307 Redirect).

## 4. Stack Técnico
- **Backend**: FastAPI, SQLAlchemy, Alembic.
- **Frontend**: Next.js 16 (App Router), TailwindCSS.

## 5. Infraestructura y Calidad de Código (Frontend)
- **Framework de Pruebas Unitarias**: Configurado `Vitest` + `React Testing Library`. Script: `npm run test`.
- **Pruebas End-to-End (E2E)**: Configurado `Playwright` para flujos críticos. Script: `npm run test:e2e`.
- **Linter y Formatter**: Implementado `ESLint` (v8) + `Prettier` + `eslint-config-next`. Scripts: `npm run lint`, `npm run format`.
- **Validación de Tipos (CI)**: Script de chequeo estricto `npm run type-check` (`tsc --noEmit`).
- **Accesibilidad (a11y)**: Auditoría de formularios (ids/labels) y etiquetas ARIA.
- **Internacionalización (i18n)**: Estructura base implementada con `LanguageContext` y diccionarios JSON (ES/EN).
- **Manejo de Errores UI**: `ErrorBoundary` global y componentes de `Error` específicos. Integración de `sonner` para Toasts.

## 6. Infraestructura Backend
- **Migraciones de Base de Datos**: Pipeline automatizado con `backend/scripts/run_migrations.sh`.
- **Servicios Core**: Implementados `NotificationService`, `ScoreService`, `RiskService`, `AlertService`, `CheckinService`.
- **Testing**: Suite completa `pytest` (Auth, Flows, Errors).
- **Optimización Base de Datos**: Índices estratégicos para `EmotionalCheckin` y `AssessmentResponse` (reportes históricos).
- **Logging Avanzado**: Integración de Sentry para monitoreo de errores en producción y logs estructurados.
- **Seguridad**: Implementación de *Refresh Tokens* y rotación de tokens para sesiones seguras.

## 7. DevOps & Monorepo 🚀
- **Estructura Monorepo**: Frontend y Backend unificados con gestión de `npm workspaces`.
- **CI/CD**: GitHub Actions separados para validación de cada stack (Frontend-CI / Backend-CI).
- **Pre-commit**: Hooks automáticos para limpieza de código (Black, Isort, Prettier).
- **Git**: `.gitignore` completo y limpieza de archivos innecesarios.
- **Herramientas de Calidad**: Script de verificación integral `check_project.sh` para validación local pre-push.

## 8. Funcionalidades de Gestión y Profesionalismo 💎
- **Notas Clínicas**: Sistema de registro privado para psicólogos vinculado a estudiantes (API + UI).
- **Cambio de Contraseña Obligatorio**: Flujo de seguridad que fuerza a nuevos usuarios (creados por admin) a cambiar su contraseña en el primer login.
- **Landing Page Profesional**: Página de inicio rediseñada con secciones de marketing, características y "Cómo funciona".
- **Centro Legal y Soporte**:
    - **Páginas Legales**: Políticas de Privacidad y Términos de Uso con diseño premium y estructurado.
    - **Contacto Directo**: Integración de chat inmediato vía WhatsApp y canal dedicado de soporte técnico por email.
    - **UX Premium**: Uso de micro-animaciones, iconos estilizados y diseño con enfoque en la confianza del usuario.
