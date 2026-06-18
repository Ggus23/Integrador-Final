# 🧠 MenTaLink

## ¿De qué trata tu proyecto de grado?

**MenTaLink** es un **ecosistema tecnológico integral de detección temprana, monitoreo continuo y gestión proactiva del riesgo académico y bienestar emocional en entornos universitarios**. 

Combina ingeniería de software e inteligencia artificial para permitir que los departamentos de bienestar universitario intervengan de manera oportuna antes de que ocurran situaciones críticas como deserción académica o crisis emocionales. El sistema NO realiza diagnósticos clínicos ni sustituye a los profesionales de la salud.

### 📦 Módulos del Proyecto

1. **Módulo de Autenticación y Seguridad**: JWT, RBAC, consentimiento informado, audit log inmutable
2. **Módulo de Gestión de Datos Académicos**: Calificaciones, desempeño, becas, seguimiento institucional
3. **Módulo de Monitoreo Emocional** *(solo para Estudiantes - Web)*: Check-ins diarios, diarios de reflexión, evaluaciones psicométricas estandarizadas (PHQ-9 para depresión, GAD-7 para ansiedad, PSS-10 para estrés percibido)
4. **Módulo de Inteligencia Artificial**: Predictor de deserción (Random Forest), clasificador de riesgo emocional, análisis NLP de emociones
5. **Módulo de Intervención y Apoyo**: Alertas tempranas, gestión de citas, fichas longitudinales, notificaciones push

---

## ¿Cuántas personas integran el equipo de tesis?

**1 persona** - Trabajo unipersonal. El diseño, arquitectura, desarrollo de software, modelado de inteligencia artificial e integración de sistemas fue realizado completamente por un único desarrollador.

---

## ¿En qué país te encuentras?

**Bolivia 🇧🇴**

- **Universidad**: Privada Franz Tamayo (UNIFRANZ)
- **Sede**: Cochabamba
- **Carrera**: Ingeniería en Sistemas

---

## ¿Cuánto tiempo estima (o te ha tomado) el desarrollo?

El proyecto se desarrolló en **4 Integradores Académicos** (4 semestres):

| Integrador | Semestre | Duración | Hito Principal |
|-----------|---------|----------|----------------|
| **Integrador 1** | Semestre 1 (14-16 semanas) | ~4 semanas efectivas | Fundamentación, diseño de BD, estándares psicométricos |
| **Integrador 2** | Semestre 2 (14-16 semanas) | ~4 semanas efectivas | Recolección de datos, procesamiento, modelado IA inicial |
| **Integrador 3** | Semestre 3 (14-16 semanas) | ~4 semanas efectivas | Integración de modelos, desarrollo de APIs, interfaces |
| **Proyecto Final** | Semestre 4 (5-6 meses) | Refinamiento, tests, deployment, documentación |

**⏱️ Total**: **20-24 meses de desarrollo** (aproximadamente 2 años académicos) durante los 4 semestres.

Desglose:
- Integrador 1 (Semestre 1): 5-6 meses
- Integrador 2 (Semestre 2): 5-6 meses
- Integrador 3 (Semestre 3): 5-6 meses
- Proyecto Final (Semestre 4): 5-6 meses
- **Suma: (5-6) × 4 = 20-24 meses**

**Componentes Principales**:
- 🌐 **Frontend Web**: Next.js + TypeScript + Tailwind CSS
- ⚙️ **Backend API**: FastAPI (Python 3.12+) + PostgreSQL + SQLAlchemy
- 📱 **App Móvil**: React Native + Expo
- 🤖 **Motores IA**: PyTorch, Scikit-Learn (Random Forest), NLP
- 🗄️ **Base de Datos**: PostgreSQL con migraciones (Alembic)
- 🧪 **Testing**: Pytest (backend), Vitest + Playwright (frontend)

---

## 🔐 Ingreso del Administrador a la Plataforma

El inicio de sesión del administrador utiliza el mismo formulario de login que el resto de usuarios (estudiantes y psicólogos), accesible en la ruta `/login`. El flujo de autenticación es el siguiente:

### 1. Formulario de Ingreso
- El administrador ingresa su **correo electrónico** y **contraseña** en la página de login.
- No existe una página de login separada para administradores; la diferenciación se hace por el **rol** asignado al usuario en la base de datos.

### 2. Autenticación en el Backend
- El frontend envía las credenciales al endpoint `POST /api/v1/auth/login` en formato `application/x-www-form-urlencoded` (estándar OAuth2).
- El backend:
  - Aplica **rate limiting** (5 intentos por minuto por IP).
  - Busca al usuario por correo electrónico en la base de datos.
  - Verifica la contraseña usando **Argon2** (con soporte legacy para bcrypt).
  - Si falla la autenticación, retorna un error genérico ("Correo electrónico o contraseña incorrectos") para evitar enumeración de usuarios.
  - Si el usuario está inactivo, rechaza el acceso.

### 3. Generación de Tokens JWT
- En caso exitoso, el backend genera un **access token** (expira en 15 minutos) y un **refresh token** (expira en 7 días).
- Ambos tokens incluyen en su payload el **ID del usuario** y su **rol** (`admin`, `psychologist` o `student`).

### 4. Almacenamiento y Sesión
- El frontend almacena el access token en `localStorage` y en una cookie.
- Inmediatamente después del login, solicita los datos del usuario (`GET /api/v1/users/me`) para obtener el perfil completo, incluyendo el rol.
- Dependiendo del rol, el frontend redirige al dashboard correspondiente.

### 5. Protección de Rutas Administrativas
- Las rutas del panel de administración (`/admin/*`) están protegidas por el hook `useProtected()` que verifica que el usuario tenga rol `admin`.
- Si un usuario sin rol admin intenta acceder, es redirigido automáticamente al `/dashboard`.
- El backend refuerza la seguridad con el middleware `RoleChecker`, permitiendo solo a usuarios con rol `ADMIN` acceder a endpoints críticos como creación de usuarios, asignación de roles, activación/desactivación de cuentas, etc.

### 6. Páginas del Panel Administrativo
Una vez autenticado como administrador, se puede acceder a:
| Ruta | Descripción |
|------|-------------|
| `/admin/users` | Gestión de usuarios (crear, editar rol, activar/desactivar) |
| `/admin/students` | Listado de estudiantes con resumen de riesgo |
| `/admin/alerts` | Alertas tempranas generadas por el sistema |
| `/admin/appointments` | Gestión de citas psicológicas |
| `/admin/reports` | Reportes y estadísticas |

> **Nota:** El administrador no puede crearse a sí mismo desde el registro público. Las cuentas con rol `admin` son creadas directamente desde la base de datos o mediante el endpoint interno `POST /users/internal` por otro administrador.

---

**© 2026 MenTaLink** — *Desarrollado con 💚 para la gestión preventiva de bienestar y éxito académico estudiantil.*
