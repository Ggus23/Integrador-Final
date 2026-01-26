from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator

from app.models.user import UserRole


# Shared properties across all user schemas
class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = True
    full_name: Optional[str] = None
    role: Optional[UserRole] = UserRole.STUDENT
    consent_accepted: bool = False


# Properties to receive via API on creation - Restricted to specified fields
class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.STUDENT
    
    @field_validator("role")
    @classmethod
    def role_must_valid(cls, v: UserRole) -> UserRole:
        if v in [UserRole.ADMIN, UserRole.PSYCHOLOGIST]:
             raise ValueError("Solo se permite el registro de estudiantes vía registro público")
        return v

    @field_validator("email")
    @classmethod
    def email_must_be_gmail(cls, v: str) -> str:
        if not v.lower().endswith("@gmail.com"):
            raise ValueError("Email must be a @gmail.com address")
        return v.lower()

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not any(char.isdigit() for char in v):
            raise ValueError("Password must contain at least one digit")
        return v


# Properties to receive via API on update
class UserUpdate(UserBase):
    password: Optional[str] = None


class UserInDBBase(UserBase):
    id: Optional[int] = None
    model_config = ConfigDict(from_attributes=True)


# Additional properties to return via API (safe for client)
class User(UserInDBBase):
    created_at: Optional[object] = None
    updated_at: Optional[object] = None


# Additional properties stored in DB
class UserInDB(UserInDBBase):
    hashed_password: str
