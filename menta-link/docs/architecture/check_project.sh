#!/bin/bash
set -e

echo "🔍 Verificando y arreglando Backend (Python)..."
cd backend
# Activar entorno virtual si existe
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Formatear código
echo "   - Formateando con Black e Isort..."
black .
isort .

# Correr tests
echo "   - Ejecutando pruebas (Pytest)..."
pytest

cd ..

echo "🔍 Verificando y arreglando Frontend (Next.js)..."
cd frontend
# Linting y Fix
echo "   - Ejecutando ESLint con auto-fix..."
npm run lint:fix

# Type Check (opcional pero recomendado)
echo "   - Verificando tipos (TypeScript)..."
npm run type-check

# Build check
echo "   - Verificando compilación (Build)..."
npm run build

echo "✅ ¡Todo listo! Tu código está limpio y probado. Puedes hacer git push con confianza."
