#!/bin/bash
# Script automatizado para gestionar migraciones de base de datos
# MENTA-LINK - ODS 3

set -e

echo "Iniciando proceso de migración de base de datos..."

# Activar entorno virtual si existe
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Generar nueva migración (si hay cambios en modelos)
# alembic revision --autogenerate -m "auto_migration_$(date +%Y%m%d)"

# Aplicar migraciones pendientes
echo "Aplicando cambios (alembic upgrade head)..."
alembic upgrade head

echo "Migración completada exitosamente."
