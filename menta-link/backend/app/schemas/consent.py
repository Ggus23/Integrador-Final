from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ConsentBase(BaseModel):
    has_accepted: bool = False
    version: str = "1.0"


class ConsentCreate(ConsentBase):
    pass


class ConsentUpdate(ConsentBase):
    pass


class Consent(ConsentBase):
    id: int
    user_id: int
    accepted_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
