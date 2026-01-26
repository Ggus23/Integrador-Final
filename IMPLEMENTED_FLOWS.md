# Flujos Implementados

## 1. Registro y Verificación de Usuario
1.  **Usuario se Registra**:
    - Completa el formulario `/signup`.
    - La creación de la cuenta dispara `AuthService.create_verification_token()`.
    - El usuario ve la pantalla "Revisa tu correo".
2.  **Envío de Correo**:
    - El sistema (Mock) imprime un enlace de verificación en la consola/logs (ej. `EMAIL_MOCK: Sending Verification...`).
    - *En Producción*: Esto usaría SMTP/SendGrid.
3.  **Verificación**:
    - El usuario hace clic en el enlace: `/verify-email?token=xyz`.
    - El Frontend llama a `POST /api/v1/auth/verify-email`.
    - El Backend valida el hash del token y su expiración.
    - Éxito -> Usuario redirigido al Login.

## 2. Recuperación de Contraseña
1.  **Solicitud**:
    - El usuario va a `/forgot-password`, ingresa su email.
    - El Backend genera `PasswordResetToken` (expira en 15m).
    - Se envía email con enlace: `/reset-password?token=xyz`.
2.  **Restablecimiento**:
    - El usuario hace clic en el enlace, ingresa nueva contraseña.
    - El Frontend llama a `POST /api/v1/auth/reset-password`.
    - El Backend actualiza el hash de la contraseña.
    - El token se marca como usado.

## 3. Cómo Ejecutar
1.  **Iniciar Backend**: `uvicorn app.main:app --reload`
2.  **Iniciar Frontend**: `npm run dev`
3.  **Probar Registro**: 
    - Registrar un nuevo usuario. 
    - Revisar la terminal para ver el log `EMAIL_MOCK` y obtener el token.
    - Construir manualmente la URL: `http://localhost:3000/auth/verify-email?token=<TOKEN_DEL_LOG>`.
