-- Script inicial opcional para PostgreSQL (se ejecuta solo la primera vez)

-- Ejemplo: crear esquema separado para mentalink
CREATE SCHEMA IF NOT EXISTS mentalink AUTHORIZATION CURRENT_USER;

-- Opcional: crear extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";