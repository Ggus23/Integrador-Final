#!/bin/bash
set -euo pipefail

echo "Running Alembic migrations..."
migration_log="$(mktemp)"
trap 'rm -f "$migration_log"' EXIT

if alembic upgrade head >"$migration_log" 2>&1; then
	cat "$migration_log"
else
	cat "$migration_log" >&2
	if grep -Eqi 'DuplicateTable|relation ".*" already exists|already exists' "$migration_log"; then
		echo "Existing database schema detected; marking migrations as applied."
		alembic stamp head
	else
		echo "Alembic migration failed for a reason other than an existing schema." >&2
		exit 1
	fi
fi

echo "Starting Uvicorn server on port ${PORT:-8000}..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}" --workers 2
