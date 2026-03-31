from typing import Dict, Optional

from pydantic import BaseModel


class EmotionRequest(BaseModel):
    text: str


class EmotionResponse(BaseModel):
    emotion: str
    confidence: float
    scores: Optional[Dict[str, float]] = None
