from datetime import datetime
from typing import Dict

from pydantic import BaseModel, ConfigDict


class AssessmentResponseBase(BaseModel):
    assessment_id: int
    answers: Dict[str, int]  # e.g., {"1": 4, "2": 0}


class AssessmentResponseCreate(AssessmentResponseBase):
    pass


class AssessmentResponse(AssessmentResponseBase):
    id: int
    user_id: int
    total_score: float
    risk_level: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
