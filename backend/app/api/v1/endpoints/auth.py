from datetime import timedelta
from typing import Any

from app import models, schemas
from app.api import deps
from app.core import security
from app.core.config import settings
from app.core.limiter import limiter
from app.core.logging import log_security_event
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt
from pydantic import ValidationError
from sqlalchemy.orm import Session

router = APIRouter()


@router.post("/login", response_model=schemas.auth.Token)
@limiter.limit("5/minute")
def login_access_token(
    # El request:Request es necesario par que el limiter sepa cual es el IP
    request: Request,
    db: Session = Depends(deps.get_db),
    # En el form_data  FastAPI usa OAuth2PasswordRequestForm para obtener datos
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> Any:
    """
    El limiter impide que alguien intente adivinar contaseñas por medio de scripts
    Solo permite 5 intentos de login por minuto desde la misma IP
    """
    user = (
        db.query(models.user.User)
        .filter(models.user.User.email == form_data.username)
        .first()
    )
    # El verified admite la contraseña como correcta
    # El new hash genera un nuevo hash si la contraseña es correcta pero el hash es viejo
    verified, new_hash = False, None
    if user:
        verified, new_hash = security.verify_and_update_password(
            form_data.password, user.hashed_password
        )
    """
    Este if not indica que si el usuario no existe o la contraseña es incorrecta
    muestre el erro 401 y no permita que el hacker sepa si el usuario existe o no
    """
    if not user or not verified:
        log_security_event(
            "LOGIN_FAILED",
            f"Failed attempt for email: {form_data.username} "
            f"from IP: {request.client.host}",
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo electrónico o contraseña incorrectos",
        )
    elif not user.is_active:
        log_security_event(
            "LOGIN_INACTIVE", f"Login attempt for inactive account: {user.email}"
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario inactivo",
        )
    """
    Si el hash es viejo, se actualiza, para mejor la seguridad en el login
    Si todo es correcto el access_token se genera para peticiones get_current_user y
    refresh_token solo se usa para pedir un nuevo access_token
    """
    if new_hash:
        user.hashed_password = new_hash
        db.add(user)
        db.commit()

    log_security_event(
        "LOGIN_SUCCESS", f"User {user.email} logged in successfully", level=10
    )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, role=user.role.value, expires_delta=access_token_expires
        ),
        "refresh_token": security.create_refresh_token(user.id, role=user.role.value),
        "token_type": "bearer",
    }


# Aqui no usamos depends(get_current_user) porque se espera un access_token en el body
@router.post("/refresh", response_model=schemas.auth.Token)
def refresh_token(
    refresh_token: str,
    db: Session = Depends(deps.get_db),
) -> Any:
    try:
        payload = jwt.decode(
            refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = schemas.auth.TokenPayload(**payload)

        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
            )

    except (jwt.JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    """
    Aunque el token sea valido verificamos la base de datos nueva
    para asegurarnos si el access_token es valido
    """
    user = (
        db.query(models.user.User).filter(models.user.User.id == token_data.sub).first()
    )
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    """
    Este return no solo entrega un nuevo access_token
    sino que tambien entrega un nuevo refresh_token para invalidar el viejo
    """
    return {
        "access_token": security.create_access_token(
            user.id, role=user.role.value, expires_delta=access_token_expires
        ),
        "refresh_token": security.create_refresh_token(user.id, role=user.role.value),
        "token_type": "bearer",
    }


@router.post("/verify-email")
def verify_email(
    token: str,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Esta def nos ayuda Recibir el token, lo desencripta, busca al usuario segun el correo
    si no existe el correo devuelve error 400
    Si existe el correo muestra el mensaje "Email verified successfully"
    """
    #
    from app.services.auth_service import auth_service

    success = auth_service.verify_email(db, token)
    if not success:
        raise HTTPException(
            status_code=400, detail="Invalid or expired verification token"
        )
    return {"msg": "Email verified successfully"}


@router.post("/recover-password")
def recover_password(
    email_in: schemas.auth.PasswordRecovery,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Este def maneja la solicitud  de recuperacion de contraseña
    Mediante el email_in se envia un JSON simple FastAPI valida que el formato sea correcto
    """

    from app.services.auth_service import auth_service

    # El auth_service busca si el email existe
    # Si existe genera un token temporal
    # Luego envia un correo al usuario con un enlace
    auth_service.request_password_reset(db, email_in.email)

    # Fija que el endpoint devuelva un 200 sin importar si el correo esta o no
    # Porque si responde Correo no encontrado seria inseguro y se haria la prueba para obtener emails
    return {"msg": "Si el correo existe, se ha enviado un enlace de recuperación."}


# El def reset_password es el final para recuperar la contraseña
@router.post("/reset-password")
def reset_password(
    # El reset_in contiene el token y el new_password
    reset_in: schemas.auth.PasswordReset,
    db: Session = Depends(deps.get_db),
) -> Any:

    # El from app.core.security antes de pasar la contraseña a cualquier otro lado aplica el hash
    from app.core.security import get_password_hash

    # El from app.services.auth_service llama a la logica de negocio pasando el token y el hash
    """
    Verifica si el token es valido y si no expiro
    Busca al usuario asociado
    Remplaza la contraseña
    Como metodo opcional invalida el token
    """
    from app.services.auth_service import auth_service

    success = auth_service.reset_password(
        db, reset_in.token, get_password_hash(reset_in.new_password)
    )
    # Valida si el token ya vencio o si existe manupalacion el servicio devuelve False
    if not success:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    # Este log deja un registro de que la operacion fue exitosa
    log_security_event("PASSWORD_RESET_SUCCESS", "Password reset successful via token")
    return {"msg": "Contraseña actualizada exitosamente"}


# Este def es util para la interfaz grafica
@router.post("/test-token", response_model=schemas.user.User)
# Se confia en el current_user que viene del token
# Si el token es invalido se muestra error 401
# Si el token es valido se retorna el usuario
def test_token(current_user: models.user.User = Depends(deps.get_current_user)) -> Any:
    """
    Esto es vital por que necesitamos validar la sesion, nos ayuda a obtener los datos del usuario y
    nos ayuda a depurar
    """

    return current_user


# Este def implementa el cambio de contraseña obligatorio para el usuario psicologo
@router.post("/change-required-password", response_model=schemas.user.User)
def change_required_password(
    *,
    db: Session = Depends(deps.get_db),
    password_in: schemas.auth.PasswordResetConfirm,  # Re-using a simple schema with 'new_password'
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    # Esta validacion es exclusivamente para cuando es obligatorio
    if not current_user.must_change_password:
        raise HTTPException(
            status_code=400, detail="User is not required to change password"
        )

    # Se toma el new_password se encripta y se reemplaza
    current_user.hashed_password = security.get_password_hash(password_in.new_password)
    # Este desbloquea la cuenta
    current_user.must_change_password = False

    """
    Esta auditoria guarda los cambios y deja un registro especifico indicando que 
    el usuario cumplio con el requisito de cambiar la contraseña
    """
    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    log_security_event(
        "PASSWORD_CHANGE_REQUIRED_SUCCESS",
        f"User {current_user.email} changed required password",
    )

    return current_user
