from typing import Dict, List, Optional

from pydantic import BaseModel, ConfigDict


class AssessmentBase(BaseModel):
    title: str
    description: Optional[str] = None
    type: str  # PSS-10, DASS-21
    items: List[Dict]  # [{"id": 1, "text": "...", "options": [...]}]


class AssessmentCreate(AssessmentBase):
    pass


class Assessment(AssessmentBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
