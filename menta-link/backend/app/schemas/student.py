from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict

from app.core.constants import RiskLevel


class StudentSummary(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    risk_level: str = RiskLevel.LOW.value
    active_alerts: int = 0
    last_assessment_date: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


from app.schemas.academic_profile import AcademicProfile
from app.schemas.alert import Alert
from app.schemas.assessment_response import AssessmentResponse
from app.schemas.emotional_checkin import EmotionalCheckin as Checkin
from app.schemas.risk_summary import RiskSummary


class StudentDetail(StudentSummary):
    risk_summary: Optional[RiskSummary] = None
    academic_profile: Optional[AcademicProfile] = None
    alerts: List[Alert] = []
    assessment_responses: List[AssessmentResponse] = []
    recent_checkins: List[Checkin] = []
    risk_factors: Dict[str, float] = {}


class StudentHistoryItem(BaseModel):
    type: str  # 'diary' or 'assessment'
    date: datetime
    text: Optional[str] = None
    emotion: Optional[str] = None
    confidence: Optional[float] = None
    score: Optional[float] = None
    risk_level: Optional[str] = None


class StudentTrends(BaseModel):
    distribution: Dict[str, float]
    weekly_evolution: List[Dict[str, Any]]
    ari_score: float
    ari_level: str
