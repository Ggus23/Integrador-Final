# Documentación de la API - Nuevos Endpoints

## Análisis Emocional

### Analizar Texto (CNN)
`POST /api/v1/emotion/analyze`
- **Descripción**: Procesa un texto y devuelve la emoción dominante detectada por el modelo local.
- **Entrada**:
  ```json
  { "text": "Hoy me siento muy frustrado por los exámenes." }
  ```
- **Salida**:
  ```json
  {
    "emotion": "frustrado",
    "confidence": 0.89,
    "scores": { ... }
  }
  ```

---

## Perfil del Estudiante

### Historial Longitudinal
`GET /api/v1/students/{student_id}/history`
- **Descripción**: Retorna una línea de tiempo combinada de diarios y tests.
- **Respuesta**: Lista de objetos con `type` (diary/assessment), `date`, `emotion`, `score`, etc.

### Tendencias y ARI
`GET /api/v1/students/{student_id}/trends`
- **Descripción**: Retorna la distribución emocional, evolución semanal y el Academic Risk Index.
- **Salida**:
  ```json
  {
    "distribution": { "triste": 30.5, "feliz": 20.0, ... },
    "weekly_evolution": [ { "week": "S-1", "emotion": "triste", "avg_wellbeing": 2.5 }, ... ],
    "ari_score": 0.45,
    "ari_level": "Riesgo Medio"
  }
  ```

---

## Documentación Automática
Para ver el listado completo de endpoints y especificaciones OpenAPI, acceda a:
`http://localhost:8000/docs` (Swagger UI)
