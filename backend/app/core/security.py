from datetime import datetime, timedelta
from typing import Any, Union

from jose import jwt
from passlib.context import CryptContext

from app.core.config import settings

# Setup password hashing context using argon2 and bcrypt
# Argon2 is the winner of the Password Hashing Competition (PHC).
# bcrypt is kept for backward compatibility during migration.
pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")


def create_access_token(
    subject: Union[str, Any], role: str, expires_delta: timedelta = None
) -> str:
    """
    Generates an encoded JSON Web Token (JWT) for a user.
    The payload includes the 'sub' (user ID) and 'role' to enable
    efficient Role-Based Access Control (RBAC) at the gateway or middleware level.
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    # Payload of the token
    # Including 'role' here is a common practice to reduce database hits
    # during authorization checks.
    to_encode = {"exp": expire, "sub": str(subject), "role": role}

    # Sign the token using the secret key and algorithm defined in config
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Helper function to verify a plain text password against its hash.
    It uses the same salt that was used when hashing the password.
    Handle UnknownHashError safely.
    """
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        # If the hash is invalid/unknown (e.g. truncated or plain text), return False
        return False


def verify_and_update_password(
    plain_password: str, hashed_password: str
) -> tuple[bool, str | None]:
    """
    Verifies password and checks if the hash needs an update (e.g. depreciated scheme).
    Returns (verified, new_hash).
    """
    try:
        return pwd_context.verify_and_update(plain_password, hashed_password)
    except Exception:
        # On error (Truncated hash, Unknown scheme), fail safe
        return False, None


def get_password_hash(password: str) -> str:
    """
    Generates a secure hash for a plain text password.
    Never store plain text passwords in the database!
    """
    return pwd_context.hash(password)
