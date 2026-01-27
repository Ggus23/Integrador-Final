# MenTaLink - Monorepo Principal 🚀

Bienvenido a **MenTaLink**, una plataforma integral de monitoreo de bienestar universitario construida con **FastAPI** (Backend) y **Next.js** (Frontend). Este repositorio utiliza una estructura de monorepo para facilitar el desarrollo coordinado.

## 📂 Estructura del repositorio

-   `/backend`: API RESTful basada en Python.
-   `/frontend`: Aplicación web moderna basada en React/Next.js.
-   `/documentacion`: Guías éticas, definiciones de escalas y especificaciones técnicas.

---

## 🛠️ Requisitos Previos

Asegúrate de tener instalado:
- **Node.js**: v20 o superior.
- **Python**: v3.12 o superior.
- **PostgreSQL**: Servidor corriendo en el puerto 5432 (para desarrollo).

---

## 🚀 Guía de Configuración Rápida

### 1. Clonar e Instalar Dependencias
Desde la raíz del proyecto, instala las herramientas de gestión del monorepo:
```bash
npm install
```

### 2. Configuración del Backend (API)
1. Entra a la carpeta: `cd backend`
2. Crea un entorno virtual: `python -m venv venv`
3. Actívalo: `source venv/bin/activate` (Linux/macOS) o `.\venv\Scripts\activate` (Windows)
4. Instala paquetes: `pip install -r requirements.txt`
5. **Variables de Entorno**: Copia el ejemplo y configura tus credenciales de Postgres.
   ```bash
   cp .env.example .env
   ```
   *Nota: Asegúrate de que `POSTGRES_SERVER=localhost` y los datos de acceso sean correctos.*

### 3. Configuración del Frontend (Web)
1. Entra a la carpeta: `cd frontend`
2. **Variables de Entorno**: Crea un archivo `.env.local`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   NEXT_PUBLIC_API_PREFIX=/api/v1
   ```
   *Importante: Sin estas variables, el proceso de compilación (build) fallará.*

---

## ▶️ Cómo ejecutar el proyecto

No necesitas abrir varias terminales. Desde la **raíz del monorepo**, ejecuta:

```bash
npm run dev
```

Esto iniciará automáticamente:
- **Frontend** en `http://localhost:3000`
- **Backend** en `http://localhost:8000`
- **Documentación API (Swagger)** en `http://localhost:8000/docs`

---

## 🧪 Calidad y Pruebas

Para asegurar que el código está listo para producción, hemos implementado un sistema de verificación integral.

### Verificación Automática (Recomendado)
Antes de hacer un `push`, ejecuta el script de salud del proyecto:
```bash
./check_project.sh
```
Este script formatea el código, verifica tipos de TypeScript y corre todos los tests corporativos.

### Gestión de Base de Datos en Tests
- **Desarrollo**: El sistema usa tu instancia local de **PostgreSQL**.
- **Pruebas (Pytest)**: El sistema utiliza automáticamente **SQLite en memoria**. Esto garantiza que los tests sean ultrarrápidos y que no borren ni modifiquen tus datos reales de PostgreSQL durante las pruebas.

---

## ⚠️ Solución de Problemas Comunes

- **Error: "NEXT_PUBLIC_API_BASE_URL is not defined"**: Ocurre durante el `build` si falta el archivo `.env.local` en el frontend. Asegúrate de que la variable esté definida incluso con un valor local.
- **Error: "Connection refused (localhost:5432)"**: Asegúrate de que tu servicio de PostgreSQL esté activo.
- **Error de Linting**: Si ESLint se queja de archivos autogenerados (como `next-env.d.ts`), estos ya están configurados para ser ignorados en `.eslintignore`.

---
*Desarrollado con enfoque en el ODS 3: Salud y Bienestar.*
