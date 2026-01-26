from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class StudentSummary(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    risk_level: str = "Low"
    active_alerts: int = 0
    last_assessment_date: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class StudentDetail(StudentSummary):
    pass
