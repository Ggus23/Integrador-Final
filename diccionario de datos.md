# Diccionario de Datos — MenTaLink

## 1. Gestión de Usuarios

### `users`
Almacena los datos de autenticación y perfil básico de todos los usuarios del sistema (estudiantes, psicólogos y administradores).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Integer PK | Identificador único del usuario |
| `full_name` | String | Nombre completo del usuario |
| `email` | String UNIQUE | Correo electrónico (usado para inicio de sesión) |
| `hashed_password` | Text | Contraseña cifrada (Argon2/Bcrypt) |
| `role` | Enum | Rol del usuario: `student`, `psychologist`, `admin` |
| `is_active` | Boolean | Indica si la cuenta está activa |
| `is_email_verified` | Boolean | Indica si el correo fue verificado |
| `must_change_password` | Boolean | Obliga al usuario a cambiar la contraseña en el próximo inicio de sesión |
| `expo_push_token` | String | Token para notificaciones push en móvil |
| `created_at` | DateTime | Fecha de registro |
| `updated_at` | DateTime | Última actualización del perfil |

### `consents`
Almacena el consentimiento informado aceptado por cada usuario para el tratamiento de datos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Integer PK | Identificador único |
| `user_id` | Integer FK → users.id | Usuario asociado (relación 1:1) |
| `has_accepted` | Boolean | Indica si aceptó el consentimiento |
| `accepted_at` | DateTime | Fecha de aceptación |
| `version` | String | Versión del consentimiento (ej. "1.0") |

### `email_verification_tokens`
Almacena los tokens para verificar la dirección de correo electrónico.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Integer PK | Identificador único |
| `user_id` | Integer FK → users.id | Usuario que solicita la verificación |
| `token_hash` | String | Hash del token de verificación |
| `expires_at` | DateTime | Fecha de expiración del token |
| `created_at` | DateTime | Fecha de creación del token |
| `used_at` | DateTime | Fecha en que se usó el token (nullable) |

### `password_reset_tokens`
Almacena los tokens para restablecer la contraseña olvidada.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Integer PK | Identificador único |
| `user_id` | Integer FK → users.id | Usuario que solicita el restablecimiento |
| `token_hash` | String | Hash del token de restablecimiento |
| `expires_at` | DateTime | Fecha de expiración del token |
| `created_at` | DateTime | Fecha de creación del token |
| `used_at` | DateTime | Fecha en que se usó el token (nullable) |

---

## 2. Dominio Académico

### `academic_profiles`
Almacena el perfil académico general de cada estudiante (un registro por estudiante).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Integer PK | Identificador único |
| `user_id` | Integer FK → users.id | Estudiante asociado (relación 1:1) |
| `course` | String | Carrera universitaria (ej. "Computer Science") |
| `scholarship_holder` | Boolean | Indica si el estudiante tiene beca |
| `tuition_fees_up_to_date` | Boolean | Indica si las colegiaturas están al día |
| `current_semester` | Integer | Semestre actual cursado |
| `units_approved` | Integer | Unidades/materias aprobadas |
| `current_gpa` | Float | Promedio general (escala 0–100) |
| `age_at_enrollment` | Integer | Edad al momento de la inscripción |
| `gender` | Integer | Género (0 = Femenino, 1 = Masculino) |
| `hito2_procesual` | Float | Nota procesual del hito 2 |
| `hito2_nota` | Float | Nota final del hito 2 |
| `hito3_procesual` | Float | Nota procesual del hito 3 |
| `hito3_nota` | Float | Nota final del hito 3 |
| `hito4_procesual` | Float | Nota procesual del hito 4 |
| `hito4_nota` | Float | Nota final del hito 4 |
| `hito5_procesual` | Float | Nota procesual del hito 5 |
| `hito5_nota` | Float | Nota final del hito 5 |

### `academic_records`
Almacena un resumen del récord académico semestral del estudiante.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Integer PK | Identificador único |
| `user_id` | Integer FK → users.id | Estudiante asociado (relación 1:1) |
| `gpa` | Float | Promedio acumulado |
| `enrolled_credits` | Integer | Créditos inscritos en el semestre |
| `failed_classes` | Integer | Número de materias reprobadas |
| `hito2_procesual` a `hito5_nota` | Float | Notas por hito (8 columnas) |

### `academic_subject_grades`
Almacena las calificaciones del estudiante desglosadas por materia.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Integer PK | Identificador único |
| `user_id` | Integer FK → users.id | Estudiante asociado |
| `subject_name` | String | Nombre de la materia |
| `hito2_procesual` a `hito5_nota` | Float | Notas por hito para cada materia (8 columnas) |

### `subjects`
Catálogo de materias disponibles en la universidad.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Integer PK | Identificador único |
| `name` | String UNIQUE | Nombre de la materia |

---

## 3. Monitoreo Emocional

### `assessments`
Catálogo de instrumentos de evaluación psicométrica disponibles en el sistema.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Integer PK | Identificador único |
| `title` | String UNIQUE | Título del instrumento |
| `description` | Text | Descripción del instrumento |
| `type` | String | Tipo de instrumento: `PSS-10`, `DASS-21`, `GAD-7`, `PHQ-9` |
| `items` | JSON | Arreglo de preguntas del instrumento |

### `assessment_responses`
Almacena las respuestas que los estudiantes dan a los instrumentos de evaluación.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Integer PK | Identificador único |
| `user_id` | Integer FK → users.id | Estudiante que respondió |
| `assessment_id` | Integer FK → assessments.id | Instrumento respondido |
| `answers` | JSON | Respuestas crudas del estudiante |
| `total_score` | Float | Puntaje total obtenido |
| `risk_level` | String | Nivel de riesgo: `Low`, `Medium`, `High` |
| `dropout_probability` | Float | Probabilidad de deserción (0.0–1.0) |
| `share_with_psychologist` | Boolean | Indica si el estudiante comparte los resultados con el psicólogo |
| `created_at` | DateTime | Fecha de la evaluación |

### `emotional_checkins`
Almacena los registros diarios de estado de ánimo de los estudiantes (check-in rápido).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Integer PK | Identificador único |
| `user_id` | Integer FK → users.id | Estudiante que realiza el check-in |
| `mood_score` | Integer | Estado de ánimo (escala 1–5) |
| `energy_level` | Integer | Nivel de energía (escala 1–5) |
| `sleep_hours` | Integer | Horas de sueño de la noche anterior |
| `academic_pressure` | Integer | Presión académica percibida (escala 1–5) |
| `note` | Text | Nota opcional del estudiante |
| `created_at` | DateTime | Fecha y hora del check-in |

### `emotional_diary`
Almacena las entradas del diario emocional donde los estudiantes describen su día.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Integer PK | Identificador único |
| `user_id` | Integer FK → users.id | Estudiante que escribe la entrada |
| `date` | Date | Fecha de la entrada |
| `experience` | Text | Descripción de la experiencia del día |
| `activities` | Text | Actividades realizadas |
| `emotion` | String | Emoción principal seleccionada por el estudiante |
| `emotion_color` | String | Color asociado a la emoción |
| `wellbeing_level` | Integer | Nivel de bienestar (escala 1–5) |
| `emotion_ai` | String | Emoción dominante detectada por IA (nullable) |
| `emotion_scores` | JSON | Puntuaciones de emociones detectadas por IA (nullable) |
| `analysis_created_at` | DateTime | Fecha del análisis de IA (nullable) |
| `created_at` | DateTime | Fecha de creación del registro |

### `emotions`
Catálogo de emociones predefinidas con su color asociado.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Integer PK | Identificador único |
| `name` | String UNIQUE | Nombre de la emoción |
| `color` | String | Color representativo de la emoción |

---

## 4. Alertas e Intervención

### `alerts`
Almacena las alertas tempranas generadas por el sistema ante la detección de riesgo académico o emocional.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Integer PK | Identificador único |
| `user_id` | Integer FK → users.id | Estudiante asociado a la alerta |
| `severity` | String | Severidad: `Low`, `Medium`, `High` |
| `message` | String | Mensaje descriptivo de la alerta |
| `is_resolved` | Boolean | Indica si la alerta fue resuelta |
| `created_at` | DateTime | Fecha de generación de la alerta |
| `resolved_at` | DateTime | Fecha de resolución (nullable) |

### `appointments`
Almacena las citas entre estudiantes y psicólogos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Integer PK | Identificador único |
| `user_id` | Integer FK → users.id | Estudiante que solicita la cita |
| `psychologist_id` | Integer FK → users.id | Psicólogo asignado (nullable) |
| `appointment_date` | DateTime | Fecha y hora de la cita |
| `reason` | String | Motivo de la consulta |
| `status` | String | Estado: `pending`, `confirmed`, `cancelled`, `completed` |
| `created_at` | DateTime | Fecha de solicitud |
| `updated_at` | DateTime | Última actualización |

### `clinical_notes`
Almacena las notas clínicas redactadas por los psicólogos después de las sesiones con los estudiantes.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Integer PK | Identificador único |
| `student_id` | Integer FK → users.id | Estudiante atendido |
| `psychologist_id` | Integer FK → users.id | Psicólogo que redactó la nota (nullable) |
| `content` | Text | Contenido de la nota clínica |
| `created_at` | DateTime | Fecha de creación |
| `updated_at` | DateTime | Última modificación |

---

## 5. IA y Predicciones

### `risk_summaries`
Almacena el resumen actual de riesgo para cada estudiante (un registro por estudiante).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Integer PK | Identificador único |
| `user_id` | Integer FK → users.id | Estudiante asociado (relación 1:1) |
| `current_risk_level` | String | Nivel de riesgo actual: `Low`, `Medium`, `High`, `Critical` |
| `prediction_confidence` | Float | Confianza de la predicción (0.0–1.0) |
| `dropout_probability` | Float | Probabilidad de deserción (0.0–1.0) |
| `dropout_risk` | String | Riesgo de deserción: `Low`, `Medium`, `High` |
| `recommendations` | JSON | Arreglo de recomendaciones generadas por IA |
| `last_updated` | DateTime | Última actualización del resumen |

### `ai_predictions`
Almacena el histórico de predicciones realizadas por los modelos de IA para cada estudiante.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Integer PK | Identificador único |
| `user_id` | Integer FK → users.id | Estudiante evaluado |
| `model_name` | String | Modelo usado: `RiskClassifier`, `DropoutPredictor`, `SentimentCNN` |
| `model_version` | String | Versión del modelo (ej. "v1") |
| `gpa` | Float | Promedio del estudiante al momento de la predicción |
| `enrolled_credits` | Integer | Créditos inscritos |
| `failed_classes` | Integer | Materias reprobadas |
| `hito2_nota` a `hito5_nota` | Float | Notas de hitos |
| `checkin_score` | Float | Puntaje agregado de check-ins emocionales |
| `test_score` | Float | Puntaje agregado de evaluaciones psicométricas |
| `pss_score` | Float | Puntaje de escala de estrés percibido |
| `gad_score` | Float | Puntaje de escala de ansiedad |
| `phq_score` | Float | Puntaje de escala de depresión |
| `mood_avg` | Float | Promedio de estado de ánimo reciente |
| `confidence` | Float | Confianza del modelo en la predicción |
| `risk_level` | String | Nivel de riesgo predecido: `LOW`, `MEDIUM`, `HIGH` |
| `dropout_probability` | Float | Probabilidad de deserción predecida |
| `heuristic_score` | Float | Puntaje heurístico complementario |
| `facultad` | String | Facultad del estudiante (para filtros) |
| `sentiment` | String | Sentimiento detectado en análisis de texto |
| `created_at` | DateTime | Fecha de la predicción |
