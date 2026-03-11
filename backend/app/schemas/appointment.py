from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from enum import Enum

class AppointmentStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class AppointmentBase(BaseModel):
    appointment_date: datetime
    reason: Optional[str] = None
    status: AppointmentStatus = AppointmentStatus.PENDING

class AppointmentCreate(BaseModel):
    appointment_date: datetime
    reason: Optional[str] = None

class AppointmentUpdate(BaseModel):
    appointment_date: Optional[datetime] = None
    reason: Optional[str] = None
    status: Optional[AppointmentStatus] = None
    psychologist_id: Optional[int] = None

class Appointment(AppointmentBase):
    id: int
    user_id: int
    psychologist_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
