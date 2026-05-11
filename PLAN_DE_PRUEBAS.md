# Plan de Pruebas: Ecosistema MenTaLink

Este documento detalla el plan de pruebas integral para el sistema MenTaLink, basado en la suite de pruebas automatizadas del backend. Todas las pruebas se clasifican como **Caja Negra** (funcionales) o **Caja Gris** (integración con persistencia de datos). No se aplican pruebas de caja blanca en este nivel.

---

### TABLA Nº1: Flujo de Registro y Verificación de Email

| Campo | Descripción |
| :--- | :--- |
| **ID de prueba** | TEST-AUTH-01 |
| **Nombre de la prueba** | Registro de Usuario y Generación de Token de Verificación |
| **Tipo de prueba** | Caja gris - Integración |
| **Objetivo** | Validar que el registro de un nuevo usuario cree la entidad en la BD y genere un token de verificación pendiente. |
| **Componentes involucrados** | API REST, Servicio de Autenticación, PostgreSQL. |
| **Precondiciones** | Base de Datos limpia o sin el email a registrar. |
| **Datos de entrada** | Payload JSON con nombre, email (`student@unifranz.edu.bo`), password y rol. |
| **Pasos** | 1. Enviar petición POST a `/api/v1/users/`. 2. Verificar código HTTP 201. 3. Consultar la BD para asegurar que `is_email_verified` es False y existe un token asociado. |
| **Resultado esperado** | Usuario creado en estado no verificado con token de email generado. |
| **Resultado obtenido** | Satisfactorio |
| **Estado** | Aprobado |

*Fuente: Elaboración propia.*

---

### TABLA Nº2: Flujo de Autenticación (Login)

| Campo | Descripción |
| :--- | :--- |
| **ID de prueba** | TEST-AUTH-02 |
| **Nombre de la prueba** | Inicio de Sesión y Obtención de JWT |
| **Tipo de prueba** | Caja negra - Funcional |
| **Objetivo** | Verificar que un usuario verificado pueda obtener un token de acceso válido. |
| **Componentes involucrados** | API REST, OAuth2 con JWT. |
| **Precondiciones** | Usuario existente y verificado en la BD. |
| **Datos de entrada** | Credenciales válidas (username/password). |
| **Pasos** | 1. Enviar petición POST a `/api/v1/auth/login`. 2. Validar estructura del JSON de respuesta (access_token, token_type). |
| **Resultado esperado** | Retorno de token JWT y código HTTP 200. |
| **Resultado obtenido** | Satisfactorio |
| **Estado** | Aprobado |

*Fuente: Elaboración propia.*

---

### TABLA Nº3: Recuperación de Contraseña

| Campo | Descripción |
| :--- | :--- |
| **ID de prueba** | TEST-AUTH-03 |
| **Nombre de la prueba** | Flujo Completo de Reset de Password |
| **Tipo de prueba** | Caja gris - Integración |
| **Objetivo** | Asegurar que el proceso de recuperación cambie efectivamente la contraseña en la BD. |
| **Componentes involucrados** | API REST, Servicio de Auth, PasswordResetToken model. |
| **Precondiciones** | Usuario registrado con email accesible. |
| **Datos de entrada** | Email del usuario y nueva contraseña. |
| **Pasos** | 1. Solicitar recuperación. 2. Generar hash de token en BD. 3. Consumir endpoint de reset con el token generado. 4. Intentar login con nueva clave. |
| **Resultado esperado** | Contraseña actualizada y token invalidado tras su uso. |
| **Resultado obtenido** | Satisfactorio |
| **Estado** | Aprobado |

*Fuente: Elaboración propia.*

---

### TABLA Nº4: Análisis de Emoción y Diarios (NLP)

| Campo | Descripción |
| :--- | :--- |
| **ID de prueba** | TEST-IA-01 |
| **Nombre de la prueba** | Predicción de Emociones y Consolidación de Historial |
| **Tipo de prueba** | Caja gris - IA / Integración |
| **Objetivo** | Verificar que el motor de IA procese el texto y los resultados sean accesibles en el historial del estudiante. |
| **Componentes involucrados** | Motor de IA, API REST, DiaryEntry model. |
| **Precondiciones** | Modelo de NLP cargado en el backend. |
| **Datos de entrada** | Frases con carga emocional ("estoy feliz", "estoy triste"). |
| **Pasos** | 1. Enviar texto al endpoint de predicción. 2. Verificar que el código sea 200 o 401 (si no hay sesión). 3. Consultar historial de emociones. |
| **Resultado esperado** | Clasificación coherente con el texto y persistencia en el perfil del alumno. |
| **Resultado obtenido** | Satisfactorio |
| **Estado** | Aprobado |

*Fuente: Elaboración propia.*

---

### TABLA Nº5: Predicción de Riesgo Académico (ARI)

| Campo | Descripción |
| :--- | :--- |
| **ID de prueba** | TEST-IA-02 |
| **Nombre de la prueba** | Clasificación de Niveles de Riesgo (Bajo vs Alto) |
| **Tipo de prueba** | Caja negra - Lógica Predictiva |
| **Objetivo** | Validar que el predictor ARI asigne correctamente el nivel de riesgo según los indicadores de entrada. |
| **Componentes involucrados** | Algoritmo Predictor de Riesgo. |
| **Precondiciones** | Servicio de predicción activo. |
| **Datos de entrada** | Scores de PSS, check-ins y presión académica (Bajo: scores 0, Alto: scores max). |
| **Pasos** | 1. Enviar payload de bajo riesgo. 2. Enviar payload de alto riesgo. 3. Comparar respuestas del servidor. |
| **Resultado esperado** | Diferenciación clara entre estados de bienestar y estados de alerta. |
| **Resultado obtenido** | Satisfactorio |
| **Estado** | Aprobado |

*Fuente: Elaboración propia.*

---

### TABLA Nº6: Gestión de Alertas de Crisis

| Campo | Descripción |
| :--- | :--- |
| **ID de prueba** | TEST-CLINIC-01 |
| **Nombre de la prueba** | Generación de Alertas por Resultados Críticos |
| **Tipo de prueba** | Caja gris - Integración |
| **Objetivo** | Asegurar que resultados negativos en tests disparen alertas visibles para el psicólogo. |
| **Componentes involucrados** | Módulo de Alertas, PostgreSQL. |
| **Precondiciones** | Estudiante realizando un test de bienestar. |
| **Datos de entrada** | Respuestas de test con puntaje de riesgo. |
| **Pasos** | 1. Simular envío de test crítico. 2. Verificar creación de registro en la tabla `Alertas`. 3. Consultar endpoint de alertas para psicólogo. |
| **Resultado esperado** | Existencia de una alerta activa vinculada al estudiante. |
| **Resultado obtenido** | Satisfactorio |
| **Estado** | Aprobado |

*Fuente: Elaboración propia.*

---

### TABLA Nº7: Eliminación de Usuarios y Limpieza de Datos

| Campo | Descripción |
| :--- | :--- |
| **ID de prueba** | TEST-ADMIN-01 |
| **Nombre de la prueba** | Eliminación en Cascada de Estudiantes y Profesionales |
| **Tipo de prueba** | Caja gris - Persistencia |
| **Objetivo** | Garantizar que al eliminar un usuario se limpien correctamente todas sus dependencias (diarios, alertas, tokens). |
| **Componentes involucrados** | PostgreSQL, SQLAlchemy ORM (Cascade delete). |
| **Precondiciones** | Usuario con múltiples registros vinculados (alertas, notas, diarios). |
| **Datos de entrada** | ID del usuario a eliminar. |
| **Pasos** | 1. Ejecutar DELETE sobre el usuario. 2. Verificar que las tablas relacionadas ya no contengan sus IDs. |
| **Resultado esperado** | Integridad referencial mantenida y eliminación completa de datos sensibles. |
| **Resultado obtenido** | Satisfactorio |
| **Estado** | Aprobado |

*Fuente: Elaboración propia.*

---

### TABLA Nº8: Manejo de Errores y Excepciones Globales

| Campo | Descripción |
| :--- | :--- |
| **ID de prueba** | TEST-ERR-01 |
| **Nombre de la prueba** | Validación de Respuestas ante Entradas Inválidas |
| **Tipo de prueba** | Caja negra - Robustez |
| **Objetivo** | Verificar que el sistema maneje correctamente errores 404, 401 y 422 con mensajes claros. |
| **Componentes involucrados** | Exception Handlers de FastAPI. |
| **Precondiciones** | API operativa. |
| **Datos de entrada** | Endpoints inexistentes o payloads mal formados. |
| **Pasos** | 1. Acceder a `/api/v1/invalid`. 2. Enviar login sin password. 3. Verificar esquema de error JSON. |
| **Resultado esperado** | Códigos de error estándar y mensajes descriptivos (no trazas de error internas). |
| **Resultado obtenido** | Satisfactorio |
| **Estado** | Aprobado |

*Fuente: Elaboración propia.*
