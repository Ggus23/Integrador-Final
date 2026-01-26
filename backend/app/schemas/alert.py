from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class AlertBase(BaseModel):
    severity: str
    message: str
    is_resolved: bool = False


class AlertUpdate(BaseModel):
    is_resolved: bool


class Alert(AlertBase):
    id: int
    user_id: int
    created_at: datetime
    resolved_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
