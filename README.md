# MenTaLink: Plataforma de Monitoreo de Bienestar Universitario

**MenTaLink** es un ecosistema tecnológico avanzado diseñado para la detección temprana, monitoreo continuo y gestión proactiva de la salud mental en entornos académicos. Este proyecto alinea **ingeniería de software e inteligencia artificial con el enfoque preventivo de bienestar emocional universitario**, sin realizar diagnósticos clínicos ni sustituir la labor de profesionales de la salud mental, cumpliendo con estándares de seguridad y privacidad rigurosos.

---

## 🌟 Funcionalidades Principales y Módulos

El sistema opera bajo un modelo de **Control de Acceso Basado en Roles (RBAC)**, ofreciendo experiencias diferenciadas para cada tipo de usuario:

### 1. 🎓 Módulo del Estudiante

Herramientas diseñadas para el autoconocimiento y la señalización temprana de riesgos.

- **Emotional Check-ins**: Registro diario de estados de ánimo con metadatos contextuales (notas personales). Permite al estudiante visualizar su historial emocional.
- **Evaluaciones Psicométricas (Assessments)**: Herramientas de rastreo preventivo para medir niveles de ansiedad, depresión o estrés.
- **Consentimiento Informado**: Gestión digital de acuerdos de privacidad y uso de datos antes de acceder a servicios sensibles.
- **Panel de Bienestar Personal**: Visualización de su propio nivel de riesgo y recomendaciones automáticas.

### 2. 🧠 Módulo del Psicólogo/Staff

Un **Panel preventivo de monitoreo de bienestar emocional** para la gestión eficiente de la población estudiantil.

- **Perfil de Riesgo IA**: Un potente motor de Inteligencia Artificial (`RiskClassifier`) analiza patrones en los check-ins y evaluaciones para asignar un nivel de riesgo preventivo (Bajo, Medio, Alto) a cada estudiante.
- **Gestión de Alertas**: Sistema de notificaciones automáticas cuando un estudiante supera umbrales de riesgo definidos, permitiendo intervención inmediata.
- **Notas de Seguimiento**: Expediente digital seguro donde los psicólogos registran observaciones y seguimientos preventivos de cada sesión.
- **Resumen Ejecutivo**: Vista de 360° de cada estudiante que integra:
  - Historial de alertas.
  - Últimas evaluaciones.
  - Tendencias de estado de ánimo.
  - Factores de riesgo identificados por la IA.
- **Reportes Institucionales**: Dashboard agregado con métricas sobre la salud mental general de la universidad (distribución de riesgo, promedios de ánimo).

### 3. 🛡️ Módulo de Administración

Control total sobre la infraestructura operativa de la plataforma.

- **Gestión de Usuarios**: Altas, bajas y modificación de credenciales y roles.
- **Auditoría de Seguridad (Audit Log)**: Registro inmutable de quién accedió a qué expediente y cuándo (`log_access`), garantizando el cumplimiento de normativas de protección de datos.
- **Configuración del Sistema**: Ajuste de parámetros globales y mantenimiento de la base de datos de usuarios.

---

## ⚠️ Alcance del Sistema

MenTaLink es una plataforma de apoyo preventivo orientada a la detección temprana de indicadores de riesgo psicoemocional.

El sistema:

- **NO** realiza diagnósticos clínicos
- **NO** reemplaza psicólogos
- **NO** proporciona tratamiento médico

Su propósito es exclusivamente preventivo y de monitoreo.

---

## 🎓 Contexto Académico

Este proyecto fue desarrollado como **Proyecto de Grado** para optar al título de Ingeniería en Sistemas en la **Universidad Privada Franz Tamayo (UNIFRANZ)**, Cochabamba – Bolivia.

Su objetivo es demostrar la aplicación de ingeniería de software e inteligencia artificial en el ámbito preventivo del bienestar emocional universitario.

---

## 🏗 Arquitectura Tecnológica

El proyecto se estructura como un **Monorepo** moderno, optimizado para escalabilidad y mantenibilidad.

### 🔙 Backend (`/backend`)

El núcleo lógico del sistema, construido para ser rápido, seguro y tipado.

- **Framework**: **FastAPI** (Python 3.12+).
- **Base de Datos**: **PostgreSQL** para producción, **SQLite** para pruebas en memoria.
- **ORM**: **SQLAlchemy** para la gestión robusta de modelos relacionales.
- **Seguridad**:
  - Autenticación JWT (JSON Web Tokens).
  - Hash de contraseñas con algoritmos estándar de la industria.
  - Middleware de CORS configurado para producción.
- **ML Integration**: Integración de modelos de Machine Learning (serializados en `.pkl`) para la clasificación de riesgo en tiempo real.
- **Calidad de Código**: Pipeline estricto con `Black` (formato), `Isort` (importaciones) y `Flake8` (linting).

### 🖥️ Frontend (`/frontend`)

Una interfaz de usuario reactiva, accesible y de alta fidelidad.

- **Framework**: **Next.js 14+** (App Router) para SSR y optimización SEO.
- **Lenguaje**: **TypeScript** para seguridad de tipos en todo el stack.
- **Estilos**: **Tailwind CSS** para un diseño moderno y responsive.
- **Gestión de Estado**: Hooks personalizados y React Query (implícito en la arquitectura de datos).

---

## 🚀 Guía de Instalación y Despliegue

### Requisitos Previos

- **Node.js**: v20+ (LTS).
- **Python**: v3.12+.
- **PostgreSQL**: v15+.
- **OS**: Linux/macOS recomendado (WSL2 en Windows).

### 1. Configuración Inicial

Instale las dependencias del monorepo:

```bash
npm install
```

### 2. Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edite .env con sus credenciales de PostgreSQL
```

### 3. Frontend Setup

```bash
cd frontend
cp .env.example .env.local
# Asegúrese de definir NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### 4. Ejecución (Modo Desarrollo)

Desde la raíz del proyecto, levante todo el ecosistema con un solo comando:

```bash
npm run dev
```

Acceda a:

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **API Swagger**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🧪 Calidad y Pruebas

El proyecto prioriza la estabilidad. Antes de cada commit, ejecute el script maestro de validación:

```bash
./check_project.sh
```

Este script audita automáticamente:

1.  Formato de código (Frontend y Backend).
2.  Análisis estático de tipos.
3.  Pruebas unitarias de backend.

---

## 🔒 Privacidad y Ética

MenTaLink maneja datos sensibles. El diseño del sistema prioriza la privacidad:

- **Consentimiento**: Obligatorio y versionado.
- **Segregación de Datos**: Los administradores técnicos no ven detalles clínicos.
- **Trazabilidad**: Todo acceso a datos de salud queda registrado.

---

© 2026 MenTaLink - Desarrollado con 💚 para el bienestar estudiantil.
