from datetime import timedelta
from typing import Any

from jose import jwt
from pydantic import ValidationError

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app import models, schemas
from app.api import deps
from app.core import security
from app.core.config import settings
from app.core.limiter import limiter
from app.core.logging import log_security_event

router = APIRouter()


@router.post("/login", response_model=schemas.auth.Token)
@limiter.limit("5/minute")
def login_access_token(
    request: Request,
    db: Session = Depends(deps.get_db),
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> Any:
    """
    OAuth2 compatible token login.
    Security Measures:
    - Rate limited to 5 attempts per minute per IP.
    - Security logging for failed attempts.
    - Role included in JWT payload.
    """
    # Authenticate user by email
    user = (
        db.query(models.user.User)
        .filter(models.user.User.email == form_data.username)
        .first()
    )

    # Secure Password Verification
    # Secure Password Verification with Progressive Re-hashing
    verified, new_hash = False, None
    if user:
        verified, new_hash = security.verify_and_update_password(
            form_data.password, user.hashed_password
        )

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

    # If hash needs update (e.g. migration from bcrypt to argon2), save it now
    if new_hash:
        user.hashed_password = new_hash
        db.add(user)
        db.commit()

    log_security_event(
        "LOGIN_SUCCESS", f"User {user.email} logged in successfully", level=10
    )  # INFO level

    # Generate the access token with Role inclusion
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, role=user.role.value, expires_delta=access_token_expires
        ),
        "refresh_token": security.create_refresh_token(
            user.id, role=user.role.value
        ),
        "token_type": "bearer",
    }


@router.post("/refresh", response_model=schemas.auth.Token)
def refresh_token(
    refresh_token: str,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Refresh access token using a valid refresh token.
    Rotates the refresh token as well for better security.
    """
    try:
        payload = jwt.decode(
            refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = schemas.auth.TokenPayload(**payload)
        
        # Validate token type specifically
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
        
    # Check if user exists and is active
    user = db.query(models.user.User).filter(models.user.User.id == token_data.sub).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
        
    # Generate new tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, role=user.role.value, expires_delta=access_token_expires
        ),
        "refresh_token": security.create_refresh_token(
             user.id, role=user.role.value
        ),
        "token_type": "bearer",
    }


@router.post("/verify-email")
def verify_email(
    token: str,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Verify email with token.
    """
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
    Password Recovery Endpoint
    """
    from app.services.auth_service import auth_service

    auth_service.request_password_reset(db, email_in.email)
    # Always return 200 to prevent enumeration
    return {"msg": "Si el correo existe, se ha enviado un enlace de recuperación."}


@router.post("/reset-password")
def reset_password(
    reset_in: schemas.auth.PasswordReset,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Reset Password Endpoint
    """
    from app.core.security import get_password_hash
    from app.services.auth_service import auth_service

    success = auth_service.reset_password(
        db, reset_in.token, get_password_hash(reset_in.new_password)
    )

    if not success:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    log_security_event("PASSWORD_RESET_SUCCESS", "Password reset successful via token")
    return {"msg": "Contraseña actualizada exitosamente"}


@router.post("/test-token", response_model=schemas.user.User)
def test_token(current_user: models.user.User = Depends(deps.get_current_user)) -> Any:
    """
    Test endpoint to verify if the provided JWT token is valid.
    Returns the current user's profile information.
    """
    return current_user


@router.post("/change-required-password", response_model=schemas.user.User)
def change_required_password(
    *,
    db: Session = Depends(deps.get_db),
    password_in: schemas.auth.PasswordResetConfirm, # Re-using a simple schema with 'new_password'
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Endpoint forced for users with must_change_password=True.
    Updates password and clears the flag.
    """
    if not current_user.must_change_password:
        raise HTTPException(
            status_code=400, 
            detail="User is not required to change password"
        )

    current_user.hashed_password = security.get_password_hash(password_in.new_password)
    current_user.must_change_password = False
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    
    log_security_event("PASSWORD_CHANGE_REQUIRED_SUCCESS", f"User {current_user.email} changed required password")
    
    return current_user
