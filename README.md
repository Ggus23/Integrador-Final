# MentaLink Monorepo

Welcome to the MentaLink repository. This project is a monorepo containing both the Frontend (Next.js) and Backend (FastAPI).

## Structure

*   **frontend/**: Next.js + React + Tailwind CSS application.
*   **backend/**: FastAPI + Python application.
*   **documentacion/**: Project documentation.

## Prerequisites

*   **Node.js**: v18 or higher
*   **Python**: v3.10 or higher
*   **Git Bash** (on Windows) or standard terminal (Linux/Mac)

## Getting Started

### 1. Root Setup
Install the root dependencies to manage the workspace:
```bash
npm install
```

### 2. Backend Setup
Navigate to the backend directory and set up the virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```
*Note: Make sure to create a `.env` file in `backend/` based on `.env.example`.*

### 3. Frontend Setup
The frontend dependencies are managed automatically by the root `npm install`, but you need to configure your environment variables:
1.  Go to `frontend/`.
2.  Copy `.env.local.example` to `.env.local` (if applicable) or create one.

### 4. Quality Control
This project uses **pre-commit** to ensure code quality (formatting, linting) before every commit.
Install the hooks once:
```bash
pre-commit install
```

## Running the Application

To run **both** the Frontend and Backend simultaneously:
```bash
npm run dev
```

*   **Frontend**: [http://localhost:3000](http://localhost:3000) (or 3001 if occupied)
*   **Backend API**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
    *   Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### Individual Commands
*   `npm run dev:web`: Run only Frontend.
*   `npm run dev:api`: Run only Backend.

## Testing & Linting

*   **Lint All**: `pre-commit run --all-files`
*   **Frontend Tests**: `cd frontend && npm test`
*   **Backend Tests**: `cd backend && pytest`
