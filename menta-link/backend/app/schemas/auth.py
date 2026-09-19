from typing import Optional

from pydantic import BaseModel, field_validator

from app.utils.phones import normalize_phone_number


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


class OTPRequest(BaseModel):
    phone_number: str

    @field_validator("phone_number")
    @classmethod
    def phone_valid(cls, v: str) -> str:
        normalized = normalize_phone_number(v)
        if normalized is None:
            raise ValueError(
                "El número de teléfono debe tener entre 7 y 15 dígitos "
                "(ej. 71234567 o +59171234567)."
            )
        return normalized


class OTPVerify(BaseModel):
    phone_number: str
    code: str

    @field_validator("phone_number")
    @classmethod
    def phone_valid(cls, v: str) -> str:
        normalized = normalize_phone_number(v)
        if normalized is None:
            raise ValueError(
                "El número de teléfono debe tener entre 7 y 15 dígitos "
                "(ej. 71234567 o +59171234567)."
            )
        return normalized

    @field_validator("code")
    @classmethod
    def code_valid(cls, v: str) -> str:
        if not v.isdigit() or len(v) != 6:
            raise ValueError("El código debe contener exactamente 6 dígitos.")
        return v


class OTPVerifyResponse(BaseModel):
    phone_number: str
    phone_verified_token: str
    expires_in: int
