# Características Implementadas - MENTA-LINK

## 1. Seguridad y Ética
- **Registro de Auditoría**: Implementado para `VIEW_STUDENT_PROFILE` y `RESOLVE_ALERT`.
- **Rate Limiting**: `slowapi` en Login (5 req/min).
- **Minimización de Datos**: Script de anonimización `scripts/anonymize_data.py`.

## 2. Flujos Principales
- **Auth**: JWT, RBAC, Recuperación de contraseña (Simulada).
- **UX**: Redirección automática al Dashboard tras Login/Signup.

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

## 6. Infraestructura Backend
- **Migraciones de Base de Datos**: Pipeline automatizado con `backend/scripts/run_migrations.sh`.
