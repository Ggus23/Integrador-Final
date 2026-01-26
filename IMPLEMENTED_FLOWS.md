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

## 4. Backend Core y Estabilidad
- **Consolidación de Servicios**: Servicios principales (`Checkin`, `Risk`, `Alert`) totalmente implementados y testeados.
- **Calidad de Codebase**: 16 tests automatizados cubriendo Auth, Flujos, Errores y Lógica de Negocio.
- **Estado**: Servicios validados y listos para integración completa con frontend.

## 5. Inteligencia Artificial (Core)
- **Modelo Implementado**: `RandomForestClassifier` (Scikit-Learn).
- **Dataset Base**: `med dataset.csv` (887 estudiantes de medicina con métricas de depresión/ansiedad reales).
- **Features**: PSS-10 (Estrés), Promedio de Ánimo, Frecuencia de Días Malos, Presión Académica (Proxy).
- **Performance**:
    - Accuracy Global: ~73-79%.
    - Precisión (Alto Riesgo): >80%.
    - *Estado*: Integrado en `RiskClassifier` con fallback a sistema experto.

## 6. Visualización Explicable (XAI)
- **Perfil Estudiante (Admin/Psicólogo)**:
    - Gráfico de barras horizontal implementado con `Recharts`.
    - Muestra la **Importancia Global de Factores** del modelo de IA (Nivel de Estrés, Ánimo, Presión Académica).
    - Permite a los especialistas entender qué variables tienen mayor peso en la predicción de riesgo general.
    - Integrado en la vista de detalle del estudiante (`/admin/students/[id]`).

