# Guía de Pruebas

## 1. Ejecutando las Pruebas
El proyecto utiliza `pytest` para pruebas automatizadas.
Asegúrate de estar en el directorio `backend/` y tener el entorno virtual activado.

```bash
# Ejecutar todas las pruebas
pytest

# Ejecutar solo pruebas de flujo de autenticación
pytest tests/test_auth_flows.py
```

## 2. Cobertura de Pruebas

### Flujos de Auth (`tests/test_auth_flows.py`)
- **Registro**: Verifica que un nuevo usuario inicie con `is_email_verified=False` y se genere un token de verificación en la BD.
- **Verificación de Email**:
  - Camino exitoso: Un token válido marca al usuario como verificado.
  - Uso único: Reutilizar el mismo token falla (Requisito de seguridad).
- **Recuperación de Contraseña**:
  - Olvidé Contraseña: Genera un token de restablecimiento.
  - Restablecer Contraseña: Actualiza el hash de la contraseña correctamente e invalida el token.

### Lógica Central (`tests/test_risk.py`)
- **Clasificador de Riesgo**: Verifica que el algoritmo ponderado genere salidas correctas para escenarios de riesgo Bajo/Medio/Alto.

## 3. Infraestructura
- Las pruebas usan una base de datos **SQLite En-Memoria** (`sqlite:///:memory:`). Esto asegura que las pruebas sean rápidas, aisladas y no contaminen la base de datos de desarrollo.
- La Inyección de Dependencias sobreescribe `get_db` para apuntar a esta base de datos de prueba.
