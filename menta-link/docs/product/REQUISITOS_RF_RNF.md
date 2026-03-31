# Requisitos Funcionales y No Funcionales (RF y RNF) - MenTaLink

Este documento detalla los **Requisitos Funcionales (RF)** y **Requisitos No Funcionales (RNF)** del proyecto **MenTaLink**, una plataforma avanzada orientada al monitoreo del bienestar emocional y la prevención de riesgos en entornos universitarios.

---

## 1. Requisitos Funcionales (RF)

Los Requisitos Funcionales describen el comportamiento, funcionalidades y servicios que el sistema debe proporcionar a los usuarios (Estudiantes, Psicólogos/Staff y Administradores).

### Módulo del Estudiante

- **RF01 - Autenticación Institucional:** El sistema debe permitir el registro y acceso exclusivo mediante el correo electrónico universitario institucional.
- **RF02 - Consentimiento Informado:** El sistema debe presentar y requerir la aceptación de políticas de privacidad y uso de datos de forma obligatoria antes de acceder a las herramientas.
- **RF03 - Check-ins Emocionales Diarios:** El estudiante debe poder registrar diariamente sus estados de ánimo junto con apuntes o notas que sirvan como contexto.
- **RF04 - Evaluaciones Psicométricas con Contexto:** El sistema proporcionará evaluaciones enfocadas a la prevención, explicando el contexto y motivo de cada test/pregunta completados por el usuario.
- **RF05 - Asistente de IA Conversacional:** El estudiante podrá interactuar con una IA para comprender mejor su estado emocional y recibir recomendaciones preventivas (no sustitutivas del criterio clínico).
- **RF06 - Análisis Emocional mediante Voz:** La plataforma debe permitir al usuario grabar audios (que se convertirán de voz a texto), para que el sistema analice sentimientos y emociones, generando recursos visuales como nubes de palabras y frases.
- **RF07 - Análisis Emocional mediante Expresiones Faciales:** El sistema debe permitir (previa autorización) el uso de la cámara o de videos para procesar gestos faciales, extrayendo indicadores como estrés, tristeza o neutralidad.
- **RF08 - Perfil Emocional Longitudinal:** El sistema debe consolidar un perfil evolutivo donde el estudiante pueda visualizar sus registros en línea de tiempo (incluyendo métricas de evaluaciones, voz y rostro).
- **RF09 - Gestión Directa de Cita/Gabinete:** Si el análisis de sistema sitúa al estudiante en un nivel de riesgo "Medio" o "Alto", se le proveerá la opción o link directo para autogestionar una consulta con el gabinete psicológico.

### Módulo del Psicólogo/Staff (Área Psicológica)

- **RF10 - Clasificación de Riesgo IA:** El sistema debe procesar todos los datos (check-ins, tests, voz, rostros) a través de un modelo predictivo (Random Forest) para asignar un nivel preventivo de riesgo: Bajo, Medio, o Alto.
- **RF11 - Gestión y Monitoreo de Alertas:** El psicólogo debe recibir notificaciones o alertas en caso de que los alumnos presenten indicadores de riesgo, enfocándose en la desvinculación o deserción universitaria, para intervenir e interactuar de forma inmediata.
- **RF12 - Resumen Ejecutivo (Vista 360°):** El personal de salud mental debe contar con un dashboard detallado de cada estudiante, visualizando su historial de alertas, evaluaciones, y factores de riesgo generados por NLP de voz o DL facial.
- **RF13 - Notas de Seguimiento:** Los psicólogos deben tener un espacio confidencial para asentar notas de seguimientos preventivos de sus sesiones.
- **RF14 - Reportes Poblacionales:** El sistema entregará un panel agregado con datos anonimizados sobre los niveles globales de estado de ánimo y riesgo en la población estudiantil.

### Módulo de Administración

- **RF15 - Gestión de Usuarios y Roles:** Un administrador debe poder gestionar el alta, baja, modificación y asignación de roles de sistema.
- **RF16 - Trazabilidad (Audit Log) de Privacidad:** Toda acción u observación que involucre acceder a datos sensibles de los estudiantes quedará registrada de forma inmutable para auditoría.

---

## 2. Requisitos No Funcionales (RNF)

Los Requisitos No Funcionales definen cualidades globales, restricciones, rendimiento, usabilidad, seguridad y estándares arquitectónicos del sistema.

### Seguridad y Privacidad

- **RNF01 - Protección Rigurosa de Datos Sensibles:** La historia clínica virtual y datos obtenidos por video/audio deben estar estrictamente cifrados, respetando altos estándares éticos y previniendo el filtrado de información.
- **RNF02 - Segregación y Privilegios Estrictos:** El personal técnico/administrador bajo ninguna circunstancia puede visualizar informes, notas privadas de la IA y expedientes de pacientes (Roles cruzados bloqueados).
- **RNF03 - Protección de Accesos:** El sistema debe utilizar mecanismos de tokens o inicio de sesión seguros (JWT) junto con criptografía avanzada para resguardar las credenciales.

### Desempeño y Rendimiento

- **RNF04 - Tiempos de Respuesta con Entorno de IA:** Los resultados derivados de los análisis de Machine Learning (Random Forest) o de procesamiento de texto a voz y clasificación de gestos, deben mostrarse en un tiempo prudente que no afecte la experiencia visual del usuario móvil y web.
- **RNF05 - Disponibilidad Sostenida:** El sistema debe estar preparado para soportar el ingreso constante y masivo de estudiantes realizando operaciones diarias de check-ins en horarios concurrentes.

### Arquitectura Técnica y Tolerancia a Fallos

- **RNF06 - Modelo de Fallback IA:** Si los modelos pesados de Inteligencia Artificial (ML, NLP) sufren problemas para ser cargados o fallan, el backend actuará con un sistema experto ponderado (`heurística manual`) para no interrumpir el servicio de predicción de riesgo.
- **RNF07 - Stack Tecnológico Estandarizado:** El proyecto debe construirse bajo una arquitectura Monorepo robusta, usando Next.js para el Frontend (para SEO y usabilidad reactiva) y FastAPI para el Backend (para la velocidad y gestión eficiente de la IA).
- **RNF08 - Modelos Contextualizados al Español:** Los datasets y modelos usados en los submódulos de análisis de sentimiento por texto o voz deben estar curados y adaptados específicamente al contexto de español latino, promoviendo mayor fiabilidad clínica y cultural.

### Usabilidad y Claridad Ética

- **RNF09 - Enfoque de Diseño Preventivo:** Toda la aplicación (desde notificaciones hasta las respuestas generadas por llm) debe incluir los descargos de responsabilidad correspondientes indicando al estudiante que sus análisis son orientativos, buscando acompañamiento, pero **nunca** reemplazando atención profesional clínica.
- **RNF10 - Interfaz Multiplataforma (Móvil-First):** La interfaz deberá priorizar el diseño de alta respuesta celular debido a la demografía del público objetivo de estudiantes (empleando Tailwind CSS).
