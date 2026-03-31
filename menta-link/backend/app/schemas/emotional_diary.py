from datetime import date as date_type
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class EmotionalDiaryBase(BaseModel):
    experience: Optional[str] = None
    activities: Optional[str] = None
    emotion: str = Field(..., description="e.g., 'Muy feliz'")
    emotion_color: str = Field(..., description="e.g., 'Verde'")
    wellbeing_level: int = Field(..., ge=1, le=5, description="Scale 1-5")


class EmotionalDiaryCreate(EmotionalDiaryBase):
    date: Optional[date_type] = None


class EmotionalDiaryUpdate(BaseModel):
    experience: Optional[str] = None
    activities: Optional[str] = None
    emotion: Optional[str] = None
    emotion_color: Optional[str] = None
    wellbeing_level: Optional[int] = Field(None, ge=1, le=5)


class EmotionalDiary(EmotionalDiaryBase):
    id: int
    user_id: int
    date: date_type
    created_at: datetime

    # AI Analysis fields
    emotion_ai: Optional[str] = None
    emotion_scores: Optional[dict] = None
    analysis_created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
