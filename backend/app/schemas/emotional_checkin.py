from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class EmotionalCheckinBase(BaseModel):
    mood_score: int = Field(
        ..., ge=1, le=5, description="Mood score from 1 (Very Bad) to 5 (Very Good)"
    )
    note: Optional[str] = None


class EmotionalCheckinCreate(EmotionalCheckinBase):
    pass


class EmotionalCheckin(EmotionalCheckinBase):
    id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
