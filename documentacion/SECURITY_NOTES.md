# Notas de Seguridad

## 1. Gestión de Tokens
- **Almacenamiento**: Los tokens NUNCA se almacenan en texto plano. Guardamos hashes `SHA-256` en la base de datos (`token_hash`).
- **Generación**: El uso de `secrets.token_urlsafe(32)` provee alta entropía.
- **Expiración**:
  - Tokens de Verificación: 24 horas.
  - Tokens de Restablecimiento: 15 minutos.
- **Uso Único**: Los tokens tienen una marca de tiempo `used_at`. Una vez usados, se invalidan inmediatamente.

## 2. Limitación de Velocidad (Rate Limiting)
- **Implementación**: `slowapi` (Redis/En-memoria).
- **Política**:
  - Login: 5 intentos / minuto por IP.
  - La recuperación de contraseña debería limitarse similarmente (implementación actual focada en lógica central).

## 3. Política de Verificación de Email
- Actualmente, el sistema permite Login incluso si `is_email_verified=False`.
- **Para Enforzar Verificación Estricta**:
  - Descomentar el chequeo en `app/api/v1/endpoints/auth.py`:
    ```python
    if not user.is_email_verified:
        raise HTTPException(status_code=400, detail="Email not verified")
    ```

## 4. Protección contra Enumeración de Usuarios
- El endpoint `/recover-password` siempre retorna `200 OK` ("Si el email existe...") independientemente de si el usuario está en la base de datos. Esto previene que atacantes verifiquen qué correos están registrados.
