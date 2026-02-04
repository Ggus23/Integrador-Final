# Estructura del Proyecto

Este documento detalla la organización de carpetas del proyecto, clasificadas por su rol funcional o no funcional.

## Backend

### Carpetas Funcionales

Estas carpetas contienen la lógica de negocio, reglas de la aplicación, modelos de datos y endpoints de la API.

- **app**: Contiene el núcleo de la aplicación Backend.
  - `api`: Definición de endpoints y rutas.
  - `core`: Configuraciones centrales y seguridad.
  - `db`: Configuración y gestión de la base de datos.
  - `docs`: Documentación de la API.
  - `ml`: Módulos de Machine Learning.
  - `models`: Modelos de base de datos (ORM).
  - `schemas`: Esquemas Pydantic para validación de datos.
  - `services`: Lógica de negocio y servicios.
  - `utils`: Utilidades y funciones auxiliares.

### Carpetas No Funcionales

Estas carpetas contienen configuraciones de infraestructura, pruebas, scripts de mantenimiento, archivos generados y dependencias.

- **alembic**: Scripts y versiones de migración de base de datos.
- **docker**: Archivos de configuración para Docker y despliegue.
- **scripts**: Scripts de utilidad para mantenimiento o configuración.
- **tests**: Test unitarios y de integración.
- **data**: Almacenamiento de datos locales (si aplica).
- **venv**: Entorno virtual de Python (dependencias).
- **.pytest_cache**: Caché de ejecución de pruebas.

---

## Frontend

### Carpetas Funcionales

Estas carpetas contienen el código fuente que compone la interfaz de usuario, lógica del cliente y estado de la aplicación.

- **app**: Rutas y páginas de la aplicación (Next.js App Router).
- **components**: Componentes de UI reutilizables.
- **context**: Contextos de React para manejo de estado global.
- **dictionaries**: Archivos de diccionarios o traducciones (si aplica).
- **hooks**: Custom Hooks de React para lógica encapsulada.
- **lib**: Librerías, utilidades y funciones de ayuda.

### Carpetas No Funcionales

Estas carpetas contienen assets estáticos, configuraciones globales, tests, herramientas de build y archivos temporales.

- **public**: Archivos estáticos públicos (imágenes, fuentes, favicon).
- **styles**: Hoja de estilos globales.
- ****tests****: Tests unitarios del frontend.
- **e2e**: Tests End-to-End (Playwright/Cypress).
- **playwright-report**: Reportes de ejecución de tests E2E.
- **test-results**: Resultados y artefactos de tests.
- **.husky**: Configuración de hooks de Git.
- **.next**: Archivos generados por el build de Next.js.
- **node_modules**: Dependencias del proyecto (Node.js).
