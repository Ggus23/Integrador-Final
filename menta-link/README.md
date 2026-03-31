# MenTaLink: Plataforma de Monitoreo de Bienestar Universitario

**MenTaLink** es un ecosistema tecnológico avanzado diseñado para la detección temprana, monitoreo continuo y gestión proactiva de la salud mental en entornos académicos. Este proyecto alinea **ingeniería de software e inteligencia artificial con el enfoque preventivo de bienestar emocional universitario**, sin realizar diagnósticos clínicos ni sustituir la labor de profesionales de la salud mental.

---

## 🌟 Funcionalidades Principales y Módulos

El sistema opera bajo un modelo de **Control de Acceso Basado en Roles (RBAC)**, ofreciendo experiencias diferenciadas:

### 1. 🎓 Módulo del Estudiante
Herramientas para el autoconocimiento y la señalización temprana de riesgos.
- **Emotional Check-ins**: Registro diario de estados de ánimo con notas personales.
- **Análisis Emocional CNN**: Motor local que clasifica el texto del diario en 6 categorías (Feliz, Neutral, Triste, Ansioso, Frustrado, Motivado).
- **Evaluaciones Psicométricas**: Rastreo preventivo para medir niveles de ansiedad, depresión o estrés (PHQ-9, GAD-7, PSS-10).
- **Panel de Bienestar Personal**: Visualización de su propio nivel de riesgo y recomendaciones.

### 2. 🧠 Módulo del Psicólogo/Staff
Panel preventivo de monitoreo para la gestión eficiente de la población estudiantil.
- **Academic Risk Index (ARI)**: Nuevo motor que analiza patrones longitudinales en los check-ins y evaluaciones.
- **Dashboard de Monitoreo**: Vista consolidada de la evolución emocional y resultados de tests.
- **Gestión de Alertas**: Notificaciones automáticas cuando un estudiante supera umbrales de riesgo.
- **Historial Detallado**: Acceso controlado a la evolución de cada estudiante.

### 3. 🛡️ Módulo de Administración
Control infraestructural y seguridad operativa.
- **Gestión de Usuarios**: Control total sobre roles y accesos.
- **Audit Log**: Registro inmutable de accesos a datos sensibles (`log_access`).
- **Configuración de Parámetros**: Ajuste de umbrales de alerta y variables del sistema.

---

## 🤖 Inteligencia Artificial y Modelos

MenTaLink integra una arquitectura híbrida de IA:
- **CNN de Emociones**: Red Neuronal Convolucional entrenada específicamente para detectar matices emocionales en lenguaje natural.
- **Predictor de Abandono**: Modelo basado en Random Forest que cruza datos académicos y emocionales.
- **ARI (Academic Risk Index)**: Algoritmo ponderado para la detección temprana de crisis basado en la frecuencia de indicadores negativos.

Para más detalles, consulte: [Modelos de IA (CNN y ARI)](documentacion/AI_MODEL.md)

---

## 🏗 Arquitectura Tecnológica
- **Backend**: FastAPI (Python 3.12+), PostgreSQL, SQLAlchemy, PyTorch (CNN), Scikit-Learn (RF).
- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Recharts.
- **Calidad**: Pipeline de CI/CD con Pytest, Flake8, Black e Isort.

---

## 🚀 Guía Rápida

1. **Instalar Dependencias**: `npm install` (raíz), `pip install -r requirements.txt` (backend).
2. **Configurar Entorno**: Crear archivos `.env` en `/backend` y `/frontend`.
3. **Ejecutar**: `npm run dev` desde la raíz para levantar ambos servicios.

---

## 🎓 Contexto Académico
Este proyecto fue desarrollado como **Proyecto de Grado** para la carrera de Ingeniería en Sistemas en la **Universidad Privada Franz Tamayo (UNIFRANZ)**, Cochabamba – Bolivia.

© 2026 MenTaLink - Desarrollado con 💚 para el bienestar estudiantil.
**Trazabilidad**: Todo acceso a datos de salud queda registrado.

---

© 2026 MenTaLink - Desarrollado con 💚 para el bienestar estudiantil.
