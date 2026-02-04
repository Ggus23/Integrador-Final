from typing import Generator, List

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.logging import log_security_event
from app.db.session import SessionLocal
from app.models.user import User, UserRole
from app.schemas.auth import TokenPayload


reusable_oauth2 = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


def get_db() -> Generator:

    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()


"""
# Con esta funcion Recibimos el token y conexion a DB. 
# Si falla muestra 401
# Se busca el ID, Si no existe el usuario muestra 404
# Si no esta activo muestra 400
# Si todo esta bien retorna el usuario
"""


def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(reusable_oauth2)
) -> User:

    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (jwt.JWTError, ValidationError) as e:
        log_security_event("INVALID_TOKEN", f"Token validation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.query(User).filter(User.id == token_data.sub).first()
    if not user:
        log_security_event(
            "USER_NOT_FOUND", f"User with ID {token_data.sub} not in database"
        )
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_active:
        log_security_event(
            "INACTIVE_USER", f"User {user.email} attempted access while inactive"
        )
        raise HTTPException(status_code=400, detail="Inactive user")

    return user


"""
La clase RoleChecker es una fabrica de dependencias que permite reutilizar
la logica de verificacion de roles en diferentes endpoints
"""


class RoleChecker:

    def __init__(self, allowed_roles: List[UserRole]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)):
        if current_user.role not in self.allowed_roles:
            log_security_event(
                "RBAC_DENIED",
                f"User {current_user.email} with role {current_user.role} tried to "
                f"access resource requiring {[r.value for r in self.allowed_roles]}",
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="The user doesn't have enough privileges",
            )
        return current_user


get_admin_user = RoleChecker([UserRole.ADMIN])
get_psychologist_user = RoleChecker([UserRole.ADMIN, UserRole.PSYCHOLOGIST])
get_staff_user = RoleChecker([UserRole.ADMIN, UserRole.PSYCHOLOGIST])
