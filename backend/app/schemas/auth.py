from typing import Optional

from pydantic import BaseModel


class Token(BaseModel):
    """
    Schema for the token returned after successful authentication.
    """

    access_token: str
    refresh_token: str
    token_type: str


class TokenPayload(BaseModel):
    """
    Schema for the data contained within the JWT payload.
    """

    sub: Optional[int] = None
    role: Optional[str] = None


class PasswordRecovery(BaseModel):
    email: str


class PasswordReset(BaseModel):
    token: str
    new_password: str

class PasswordResetConfirm(BaseModel):
    new_password: str
