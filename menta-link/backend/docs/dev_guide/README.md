# Backend de MENTALINK

## Descripción General
MENTALINK es una plataforma de monitoreo de salud mental alineada con el ODS 3 (Salud y Bienestar). Este backend proporciona la API para la gestión de usuarios, evaluaciones, chequeos diarios y análisis de riesgos. Actualmente utiliza un enfoque no clínico, centrándose en el bienestar y la detección temprana en lugar del diagnóstico.

## Características
- **Autenticación de Usuario**: Inicio de sesión/registro seguro con OAuth2, tokens JWT y hash de contraseñas con Argon2/Bcrypt.
- **Evaluaciones**: gestión de escalas psicométricas (por ejemplo, PSS, DASS-21).
- **Chequeos Diarios**: Actualizaciones breves y periódicas del estado del usuario.
- **Análisis de Riesgos**: Algoritmos básicos para mapear puntuaciones de evaluación a niveles de riesgo.
- **Alertas**: Notificaciones por correo electrónico para detecciones de alto riesgo.

## Stack Tecnológico
- **Framework**: FastAPI
- **Base de Datos**: PostgreSQL (SQLAlchemy ORM, migraciones con Alembic)
- **Validación**: Pydantic v2
- **Pruebas**: Pytest

## Instrucciones de Configuración

### Prerrequisitos
- Python 3.10+
- PostgreSQL
- Herramienta de entorno virtual (venv, poetry, etc.)

### Instalación
1.  **Clonar el repositorio:**
    ```bash
    git clone <repository-url>
    cd menta-link/backend
    ```

2.  **Crear y activar el entorno virtual:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # Linux/Mac
    # .\venv\Scripts\activate  # Windows
    ```

3.  **Instalar dependencias:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Variables de Entorno:**
    Copie `.env.example` a `.env` y configure sus credenciales de base de datos y claves secretas.
    ```bash
    cp .env.example .env
    ```

### Ejecutando la Aplicación

1.  **Iniciar BD**: Asegúrese de que su servidor PostgreSQL esté funcionando y la base de datos creada.
2.  **Ejecutar Migraciones:**
    ```bash
    alembic upgrade head
    ```
3.  **Iniciar Servidor:**
    ```bash
    # Desarrollo
    uvicorn app.main:app --reload

    # Producción
    gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app
    ```

## Pruebas

Ejecute el conjunto de pruebas usando pytest:
```bash
pytest
```

## Documentación

- **Documentación API**: Disponible en `/docs` (Swagger UI) o `/redoc` cuando el servidor está en ejecución.
- **Escalas y Puntuación**: Ver `../documentacion/SCALES_DEFINITIONS.md`.
- **Ética y Privacidad**: Ver `../documentacion/ETHICS_GUIDELINES.md`.
- **Flujos Implementados**: Ver `../documentacion/IMPLEMENTED_FLOWS.md`.

## Solución de Problemas

- **Errores de Hash**: Si encuentra `UnknownHashError` o problemas de inicio de sesión con usuarios sembrados, ejecute `python scripts/fix_hashes.py` para actualizar hashes heredados.
- **SMTP/Correo**: Asegúrese de que `SMTP_HOST` y las credenciales sean correctas en `.env` para que funcionen las alertas por correo electrónico. Se utiliza simulación (mocking) en las pruebas.
