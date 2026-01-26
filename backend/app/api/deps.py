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

# OAuth2PasswordBearer is a class that tells FastAPI that the URL /api/v1/auth/login
# is where we get the token. It will look for the Authorization header.
reusable_oauth2 = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


def get_db() -> Generator:
    """
    Dependency function to provide a database session to each request.
    Ensures that the session is closed after the request is finished.
    """
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()


def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(reusable_oauth2)
) -> User:
    """
    Extracts the user from the JWT token provided in the request header.
    Validates the token signature and expiration.
    """
    try:
        # Decode the token using our secret key and algorithm
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (jwt.JWTError, ValidationError) as e:
        # Academic Note: Logging failed validation attempts helps identify
        # expired or tampered token usage.
        log_security_event("INVALID_TOKEN", f"Token validation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if the user exists in the database
    user = db.query(User).filter(User.id == token_data.sub).first()
    if not user:
        log_security_event(
            "USER_NOT_FOUND", f"User with ID {token_data.sub} not in database"
        )
        raise HTTPException(status_code=404, detail="User not found")

    # Check if user account is active
    if not user.is_active:
        log_security_event(
            "INACTIVE_USER", f"User {user.email} attempted access while inactive"
        )
        raise HTTPException(status_code=400, detail="Inactive user")

    return user


class RoleChecker:
    """
    Dependency class to enforce Role-Based Access Control (RBAC).
    Can be used to restrict access to specific roles.
    """

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


# Common role check dependencies
get_admin_user = RoleChecker([UserRole.ADMIN])
get_psychologist_user = RoleChecker([UserRole.ADMIN, UserRole.PSYCHOLOGIST])
get_tutor_user = RoleChecker([UserRole.ADMIN, UserRole.TUTOR])
get_staff_user = RoleChecker([UserRole.ADMIN, UserRole.PSYCHOLOGIST, UserRole.TUTOR])
