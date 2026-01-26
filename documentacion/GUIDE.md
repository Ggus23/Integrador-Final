# Guía de Uso del Sistema MENTA-LINK

Bienvenido a MENTA-LINK, el sistema de detección temprana de riesgo psicoemocional para estudiantes universitarios alineado con el ODS 3.

---

## 🔍 ¿Cómo funciona el proyecto? (Visión Técnica y de Flujo)

MENTA-LINK opera bajo un modelo de **Vigilancia Activa y Detección Temprana**. A diferencia de los sistemas tradicionales donde el alumno debe pedir ayuda (modelo reactivo), nuestra plataforma monitorea constantemente el bienestar para identificar señales de alarma antes de que se conviertan en crisis (modelo preventivo).

### El Ciclo de Datos
1.  **Ingesta de Datos (Input)**:
    *   **Evaluaciones Psicométricas**: Test estandarizados (PSS-10, GAD-7) que miden niveles clínicos de estrés o ansiedad.
    *   **Check-ins Diarios**: Termómetros emocionales rápidos ("¿Cómo te sientes hoy?") que detectan *cambios de tendencia* (ej. 3 días seguidos de mal sueño).
2.  **Procesamiento (Caja Negra/Blanca)**:
    *   El motor de análisis (`checkin_service`, `risk_service`) procesa las respuestas.
    *   Aplica algoritmos ponderados para calcular un **Score de Riesgo** en tiempo real.
3.  **Triaje Automático (Output)**:
    *   El sistema clasifica al estudiante en: **Sin Riesgo**, **Riesgo Leve**, **Riesgo Moderado**, o **Riesgo Alto**.

---

## 👥 La Necesidad del Rol Profesor y Psicólogo

Aunque el sistema es automatizado, la intervención humana es insustituible. MENTA-LINK no reemplaza a los profesionales; **los potencia**.

### 1. El Rol del Profesor (Tutor)
*   **¿Por qué es necesario?**
    *   Los problemas de salud mental en estudiantes a menudo se manifiestan primero en lo académico (caída de notas, faltas).
    *   Los profesores son la "primera línea de defensa": tienen el contacto diario y la confianza.
*   **Función en el Sistema**:
    *   Recibe alertas de **Riesgo Leve/Moderado** vinculadas a estrés académico.
    *   **Acción**: Intervenir pedagógicamente (flexibilizar una entrega, preguntar "¿Todo bien?") para reducir la carga alostática del alumno antes de que enferme.

### 2. El Rol del Psicólogo (Clínico)
*   **¿Por qué es necesario?**
    *   **Ética y Legalidad**: Un algoritmo no puede (ni debe) diagnosticar ni manejar crisis suicidas o depresiones mayores.
    *   **Empatía y Juicio**: El sistema detecta *datos*, el psicólogo entiende *contextos*.
*   **Función en el Sistema**:
    *   Recibe alertas de **Riesgo Alto/Crítico**.
    *   El sistema actúa como una herramienta de **Triaje Inteligente**: en lugar de esperar a que colapse el gabinete psicopedagógico, el psicólogo recibe una lista priorizada de quién necesita atención *hoy*.
    *   **Acción**: Activar protocolos de emergencia, citar al alumno, o derivar a psiquiatría externa.

---

## 🛠️ Guía Rápida de Uso

### 1. Registro e Inicio de Sesión

#### Estudiantes
1.  **Registro**: 
    - Navega a la página principal.
    - Haz clic en "¿No tienes una cuenta? Crear una".
    - Ingresa tu **Nombre Completo**.
    - Ingresa tu **Correo Universitario** (Debe terminar en `@gmail.com` para esta demo).
    - Selecciona el rol **Estudiante**.
    - Crea una contraseña segura (mínimo 8 caracteres, al menos 1 número).
2.  **Consentimiento**: Al ingresar por primera vez, deberás leer y aceptar el Consentimiento Informado.
3.  **Dashboard**: Serás redirigido a tu panel principal.

#### Profesores / Psicólogos
1.  **Credenciales de Prueba**:
    - **Email**: `profesor@mentalink.edu` (Rol Tutor) o `psicologo@mentalink.edu` (Rol Psicólogo)
    - **Contraseña**: `Profe123!` o `Psico123!`
2.  **Acceso**: Inicia sesión directamente en `/login`.

### 2. Funcionalidades para Estudiantes

#### Evaluaciones (Assessments)
- Desde el Dashboard, haz clic en **"Realizar Evaluación"** (o ve a `/assessments`).
- Encontrarás escalas psicométricas disponibles (ej. **PSS-10** para estrés, **DASS-21**).
- Responde todas las preguntas y envía tus respuestas.
- El sistema calculará tu nivel de riesgo automáticamente y actualizará tu Dashboard.

#### Check-ins Emocionales
- Haz clic en **"Registrar Check-in"**.
- Registra cómo te sientes hoy en una escala rápida (Ánimo, Estrés, Sueño).
- Esto ayuda a construir un historial de tu bienestar diario.

#### Alertas
- Si tus respuestas indican un riesgo elevado (ej. Estrés Alto), el sistema generará una **Alerta**.
- Puedes ver tus alertas activas en **"Ver Alertas"**.
- Un psicólogo o tutor podrá contactarte si la alerta requiere seguimiento.

### 3. Funcionalidades para Profesores/Psicólogos

- **Visión Global**: Accede a `/admin/dashboard` (o vista equivalente según permisos).
- **Gestión de Alertas**:
    - Ve a la sección de Alertas.
    - Filtra por gravedad (Alto, Medio, Bajo).
    - Revisa el detalle de los estudiantes en riesgo.
    - Marca alertas como "Resueltas" después de intervenir.
- **Reportes**: Visualiza estadísticas agregadas del bienestar estudiantil.

---

## 4. Notas Técnicas

- **Seguridad**: Las contraseñas se almacenan hasheadas (bcrypt/argon2).
- **Datos**: La base de datos es PostgreSQL local.
- **Privacidad**: Solo el staff autorizado puede ver datos sensibles individuales (RBAC estricto).
