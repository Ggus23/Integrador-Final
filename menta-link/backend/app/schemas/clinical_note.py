from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


# Shared properties
class ClinicalNoteBase(BaseModel):
    content: str


# Properties to receive on creation
class ClinicalNoteCreate(ClinicalNoteBase):
    student_id: int


# Properties to receive on update
class ClinicalNoteUpdate(ClinicalNoteBase):
    pass


# Properties to return to client
class ClinicalNote(ClinicalNoteBase):
    id: int
    student_id: int
    psychologist_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    # Nested psychologist details (simple)
    psychologist_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
