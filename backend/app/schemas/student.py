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


from typing import Dict, List

from app.schemas.alert import Alert
from app.schemas.assessment_response import AssessmentResponse
from app.schemas.emotional_checkin import EmotionalCheckin as Checkin
from app.schemas.risk_summary import RiskSummary


class StudentDetail(StudentSummary):
    risk_summary: Optional[RiskSummary] = None
    alerts: List[Alert] = []
    assessment_responses: List[AssessmentResponse] = []
    recent_checkins: List[Checkin] = []
    risk_factors: Dict[str, float] = {}
