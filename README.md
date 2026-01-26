# MentaLink - Monorepo

Bienvenido al repositorio de **MentaLink**. Este proyecto es un monorepo que integra tanto el Frontend (Next.js) como el Backend (FastAPI) bajo una única estructura de desarrollo unificada.

## 📂 Estructura del Proyecto

*   **frontend/**: Aplicación web construida con Next.js + React + Tailwind CSS.
*   **backend/**: API RESTful construida con FastAPI + Python.
*   **documentacion/**: Documentación técnica y funcional del proyecto.

## 🛠 Prerrequisitos

Asegúrate de tener instalado lo siguiente antes de comenzar:

*   **Node.js**: v18 o superior.
*   **Python**: v3.10 o superior.
*   **Git**: Para control de versiones (Git Bash recomendado en Windows).

---

## 🚀 Guía de Inicio Rápido

Sigue estos pasos para configurar tu entorno de desarrollo local desde cero.

### 1. Configuración Inicial (Raíz)
Instala las dependencias globales y herramientas de gestión del monorepo:

```bash
npm install
```

### 2. Configuración del Backend (Python)

Necesitas crear un entorno virtual para aislar las dependencias de Python.

#### **En Linux / macOS:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### **En Windows (CMD / PowerShell):**
```powershell
cd backend
python -m venv venv
# Activar en CMD:
venv\Scripts\activate.bat
# O Activar en PowerShell:
.\venv\Scripts\Activate.ps1
# Luego instalar dependencias:
pip install -r requirements.txt
```

> **Nota Importante:** Una vez activado el entorno, verás `(venv)` al principio de tu línea de comandos. Asegúrate de crear un archivo `.env` en la carpeta `backend/` duplicando el archivo `.env.example`.

### 3. Configuración del Frontend (Next.js)

Las dependencias del frontend se instalan automáticamente con el paso 1, pero necesitas configurar tus variables de entorno.

1.  Ve a la carpeta `frontend/`.
2.  Crea un archivo `.env.local` (puedes copiar `.env.local.example` si existe o definir las variables necesarias).

### 4. Control de Calidad (Pre-commit)

Este proyecto usa `pre-commit` para asegurar que el código cumpla con los estándares de calidad antes de subirlo.

```bash
# Ejecutar desde la raíz del proyecto
pre-commit install
```
Ahora, cada vez que intentes hacer un commit, se verificarán automáticamente tus archivos.

---

## ▶️ Ejecutar la Aplicación

Gracias a la configuración del monorepo, puedes ejecutar **todo** (Frontend + Backend) con un solo comando desde la raíz:

```bash
npm run dev
```
Este comando se encargará automáticamente de:
1.  Limpiar los puertos necesarios (3000, 3001, 8000).
2.  Iniciar el servidor de Backend con `uvicorn`.
3.  Iniciar el servidor de Frontend con `next dev`.

**URLs de acceso:**
*   🌐 **Frontend (Web):** [http://localhost:3000](http://localhost:3000) (o 3001 si el puerto está ocupado)
*   ⚙️ **Backend (API):** [http://127.0.0.1:8000](http://127.0.0.1:8000)
    *   📄 **Documentación Interactiva:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### Comandos Individuales
Si solo necesitas correr una parte del proyecto:

*   **Solo Frontend:** `npm run dev:web`
*   **Solo Backend:** `npm run dev:api`

---

## 🧪 Testing y Linting

Para asegurarte de que todo funciona correctamente:

*   **Verificar todo el código (Lint):**
    ```bash
    pre-commit run --all-files
    ```

*   **Correr Tests de Frontend:**
    ```bash
    cd frontend
    npm test
    ```

*   **Correr Tests de Backend:**
    ```bash
    cd backend
    pytest
    ```
