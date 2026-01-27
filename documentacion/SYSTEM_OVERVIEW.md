# VISIÓN GENERAL DEL SISTEMA: MENTA-LINK

## 1. Introducción
**MENTA-LINK** es un proyecto académico integrador diseñado para apoyar el **ODS 3 de la ONU (Salud y Bienestar)**. Provee un marco ético y no clínico para detectar riesgos psicoemocionales en estudiantes universitarios, cerrando la brecha entre la vida académica y el apoyo profesional de salud mental.

## 2. Arquitectura de Alto Nivel
El sistema emplea una arquitectura cliente-servidor desacoplada:

```
[ Estudiante / Personal ]
       | (Navegador)
       v
[ Frontend (Next.js 16) ]
       | (REST API / HTTPS)
       v
[ Backend (FastAPI) ]
       |--> [ Servicio de Auth (JWT/RBAC) ]
       |--> [ Servicio de Evaluación (Puntuación) ]
       |--> [ Clasificador de Riesgo (Modelo Ponderado) ]
       |
       v
[ Base de Datos (PostgreSQL) ]
   (Usuarios, Evaluaciones, Respuestas, Alertas, Logs)
```

## 3. Flujo de Datos End-to-End
1.  **Acceso y Consentimiento**:
    *   Usuario inicia sesión.
    *   Sistema verifica `consent_accepted`. Si es Falso, redirige a Página de Consentimiento obligatoria.
    *   *Salvaguarda Ética*: No ocurre recolección de datos antes del opt-in explícito.
2.  **Recolección de Datos**:
    *   **Evaluaciones**: Estudiante completa PSS-10 (Estrés), GAD-7 (Ansiedad), o PHQ-9 (Depresión).
    *   **Check-ins**: Estudiante registra estado emocional diario (puntaje de ánimo 1-5).
3.  **Análisis de Riesgo**:
    *   `AssessmentService` computa puntajes clínicos (ej. PSS-10 > 27 = Alto Estrés).
    *   `RiskClassifier` combina puntajes clínicos con tendencias longitudinales de ánimo.
    *   **Salida**: Nivel de Riesgo (Bajo / Medio / Alto).
4.  **Bucle de Intervención**:
    *   **Alerta**: Riesgo Alto dispara una entrada en la tabla `Alerts`.
    *   **Triaje**: Personal de psicología ve la alerta en Dashboard de Admin.
    *   **Acción**: Personal interviene fuera de la plataforma y resuelve la alerta en la plataforma.

## 4. Machine Learning y Explicabilidad
El proyecto evita explícitamente modelos de "Caja Negra" opacos para mantener estándares éticos.
*   **Enfoque**: Clasificación Ponderada Interpretable.
*   **Lógica**: Una combinación lineal de factores estandarizados (Puntajes de Test + Inestabilidad de Ánimo).
*   **Justificación**: Permite a los psicólogos rastrear exactamente *por qué* un estudiante fue marcado (ej. "Puntaje Alto de Estrés" vs "Caída Súbita de Ánimo"), facilitando conversaciones dirigidas.

## 5. Alineación con ODS 3
*   **Meta 3.4**: Reduce mortalidad prematura por enfermedades no transmisibles (salud mental) vía alerta temprana.
*   **Encuadre No Clínico**: La UI usa lenguaje neutral ("Chequeo de Bienestar" vs "Diagnóstico") para reducir estigma.
*   **Privacidad**: Reportes agregados permiten toma de decisiones institucionales sin comprometer la privacidad individual del estudiante.
