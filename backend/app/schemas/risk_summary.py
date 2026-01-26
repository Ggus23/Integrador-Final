from datetime import datetime

from pydantic import BaseModel, ConfigDict


class RiskSummaryBase(BaseModel):
    current_risk_level: str
    prediction_confidence: float


class RiskSummary(RiskSummaryBase):
    id: int
    user_id: int
    last_updated: datetime

    model_config = ConfigDict(from_attributes=True)
