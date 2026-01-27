# MenTaLink: Plataforma de Monitoreo de Bienestar Universitario

MenTaLink es un ecosistema tecnológico diseñado para la detección temprana y el monitoreo proactivo de la salud mental en entornos académicos. Alineado con el **Objetivo de Desarrollo Sostenible (ODS) 3: Salud y Bienestar**, el sistema utiliza algoritmos de análisis de riesgo y escalas psicométricas validadas para cerrar la brecha entre los estudiantes y los servicios de apoyo profesional.

## 🏗 Arquitectura del Proyecto

El repositorio está estructurado como un **Monorepo**, integrando dos componentes principales bajo una gestión de dependencias unificada:

-   **/backend**: API REST robusta desarrollada con **FastAPI**, utilizando **PostgreSQL** para persistencia de datos y **SQLAlchemy** como ORM. Implementa autenticación JWT, RBAC (Control de Acceso Basado en Roles) y validación estricta de datos con Pydantic v2.
-   **/frontend**: Interfaz de usuario de alta fidelidad construida con **Next.js (App Router)**, **TypeScript** y **Tailwind CSS**. Implementa una arquitectura reactiva con validación de formularios mediante React Hook Form y una integración fluida con el backend.

---

## � Requisitos del Entorno

Para garantizar la estabilidad del sistema, se requieren las siguientes versiones de software:

-   **Node.js**: v20.x o superior (LTS recomendada).
-   **Python**: v3.12.x o superior.
-   **PostgreSQL**: v15+.
-   **Entorno Linux/macOS** (En Windows se recomienda el uso de WSL2 o Git Bash).

---

## 🚀 Proceso de Instalación y Configuración

### 1. Preparación del Monorepo
Instale las dependencias globales y herramientas de gestión del espacio de trabajo desde la raíz del proyecto:
```bash
npm install
```

### 2. Configuración del Servidor de API (Backend)
Navegue al directorio de backend e inicialice el entorno de Python:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```
**Variables de Entorno:**
Debe crear un archivo `.env` basado en `.env.example`. Es imperativo configurar correctamente las credenciales de PostgreSQL:
```bash
cp .env.example .env
```

### 3. Configuración del Cliente Web (Frontend)
Navegue al directorio de frontend y configure la conexión con la API:
```bash
cd frontend
```
Cree un archivo `.env.local` con las siguientes definiciones mandatorias:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_API_PREFIX=/api/v1
NEXT_PUBLIC_AUTH_TOKEN_KEY=mentalink_token
```
*Nota: La omisión de `NEXT_PUBLIC_API_BASE_URL` provocará fallos críticos durante el proceso de compilación estática.*

---

## 🛠 Ejecución en Desarrollo

El proyecto cuenta con un sistema de ejecución concurrente. Desde la **raíz del monorepo**, inicie ambos servicios con un solo comando:

```bash
npm run dev
```

-   **Web Interface**: [http://localhost:3000](http://localhost:3000)
-   **API Endpoint**: [http://localhost:8000](http://localhost:8000)
-   **Documentación Interactiva (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🧪 Estrategia de Testing y Calidad

Para mantener la integridad del código, se ha implementado un pipeline de Integración Continua (CI) que debe ser replicado localmente antes de cualquier despliegue.

### Verificación Integral
Ejecute el script de auditoría para validar formateo, tipos y lógica de negocio:
```bash
./check_project.sh
```

### Gestión de Bases de Datos
El sistema implementa una arquitectura de base de datos dual para máxima seguridad:
-   **Desarrollo**: Conexión a la instancia local de **PostgreSQL** definida en `.env`.
-   **Testing**: Uso automatizado de **SQLite en memoria**. Esto asegura que las suites de pruebas (Pytest) no interfieran con los datos persistentes de desarrollo y permite una ejecución de CI sin dependencias externas en máquinas virtuales.

---

## 📋 Solución de Problemas (Troubleshooting)

| Error | Resolución |
| :--- | :--- |
| `NEXT_PUBLIC_API_BASE_URL undefined` | El proceso de Build de Next.js requiere esta variable. Verifique su archivo `.env.local`. |
| `OperationalError: Connection refused` | Verifique que el servicio de PostgreSQL esté activo en el puerto 5432. |
| `Middleware/Proxy deprecation` | El sistema utiliza la convención `proxy.ts` requerida por la versión actual de Turbopack. |
| `next-env.d.ts lint error` | Este archivo es autogenerado. Se ha configurado `.eslintignore` para excluirlo de las reglas de estilo de Prettier/ESLint. |

---
© 2026 MenTaLink. Todos los derechos reservados.
