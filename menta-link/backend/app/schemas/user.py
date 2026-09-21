from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator

from app.models.user import UserRole
from app.utils.phones import normalize_phone_number


class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = True
    full_name: Optional[str] = None
    role: Optional[UserRole] = UserRole.STUDENT
    consent_accepted: bool = False
    must_change_password: bool = False
    expo_push_token: Optional[str] = None
    phone_number: Optional[str] = None
    is_phone_verified: Optional[bool] = False
    is_email_verified: Optional[bool] = False
    avatar_url: Optional[str] = None


class UserCreateBase(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    phone_number: Optional[str] = None

    @field_validator("email")
    @classmethod
    def email_domain_must_be_accepted(cls, v: str) -> str:
        domain = v.lower().split("@")[-1]
        allowed_domains = ["unifranz.edu.bo", "gmail.com"]
        if domain not in allowed_domains:
            raise ValueError(
                "El correo debe ser institucional (@unifranz.edu.bo) o @gmail.com"
            )
        return v.lower()

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not any(char.isdigit() for char in v):
            raise ValueError("Password must contain at least one digit")
        return v

    @field_validator("phone_number")
    @classmethod
    def phone_number_valid(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return v
        normalized = normalize_phone_number(v)
        if normalized is None:
            raise ValueError(
                "El número de teléfono debe tener entre 7 y 15 dígitos "
                "(ej. 71234567 o +59171234567)."
            )
        return normalized


class UserCreate(UserCreateBase):
    phone_number: str
    role: UserRole = UserRole.STUDENT
    phone_verified_token: Optional[str] = None

    @field_validator("role")
    @classmethod
    def role_must_valid(cls, v: UserRole) -> UserRole:
        if v in [UserRole.ADMIN, UserRole.PSYCHOLOGIST]:
            raise ValueError(
                "Solo se permite el registro de estudiantes vía registro público"
            )
        return v

    @field_validator("phone_number")
    @classmethod
    def phone_number_required_public(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            raise ValueError(
                "Es obligatorio registrar un número de teléfono celular para "
                "verificar tu cuenta."
            )
        return v


class UserCreateAdmin(UserCreateBase):
    role: UserRole = UserRole.STUDENT


class UserUpdate(UserBase):
    password: Optional[str] = None


class UserInDBBase(UserBase):
    id: Optional[int] = None
    model_config = ConfigDict(from_attributes=True)


class User(UserInDBBase):
    created_at: Optional[object] = None
    updated_at: Optional[object] = None


# Additional properties stored in DB
class UserInDB(UserInDBBase):
    hashed_password: str
