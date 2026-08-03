from typing import Dict, Optional

from pydantic import BaseModel, ConfigDict


class EmotionRequest(BaseModel):
    text: str


class EmotionResponse(BaseModel):
    emotion: str
    confidence: float
    scores: Optional[Dict[str, float]] = None


# --- DB Models ---
class EmotionBase(BaseModel):
    name: str
    color: str


class EmotionCreate(EmotionBase):
    pass


class EmotionDB(EmotionBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
