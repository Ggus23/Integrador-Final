from datetime import datetime
from typing import Any, List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.constants import RiskLevel


class RiskSummaryBase(BaseModel):
    current_risk_level: str
    prediction_confidence: float
    dropout_probability: Optional[float] = 0.0
    dropout_risk: Optional[str] = RiskLevel.LOW.value
    recommendations: List[str] = Field(default_factory=list)

    @field_validator("recommendations", mode="before")
    @classmethod
    def ensure_list(cls, v: Any) -> List[str]:
        if v is None:
            return []
        return v


class RiskSummary(RiskSummaryBase):
    id: int
    user_id: int
    last_updated: datetime

    model_config = ConfigDict(from_attributes=True)
