from datetime import datetime
from typing import Dict, Optional

from pydantic import BaseModel, ConfigDict


class AssessmentResponseBase(BaseModel):
    assessment_id: int
    answers: Dict[str, int]  # e.g., {"1": 4, "2": 0}


class AssessmentResponseCreate(AssessmentResponseBase):
    share_with_psychologist: bool = False



class AssessmentResponse(AssessmentResponseBase):
    id: int
    user_id: int
    total_score: float
    risk_level: str
    dropout_probability: Optional[float] = 0.0
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
