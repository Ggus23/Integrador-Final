from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.schemas.subject import SubjectDB


class AcademicSubjectGradeBase(BaseModel):
    subject_id: int
    hito_number: int
    procesual_score: float = 0.0
    milestone_score: float = 0.0


class AcademicSubjectGradeCreate(AcademicSubjectGradeBase):
    pass


class AcademicSubjectGradeUpdate(BaseModel):
    subject_id: Optional[int] = None
    procesual_score: Optional[float] = None
    milestone_score: Optional[float] = None


class AcademicSubjectGrade(AcademicSubjectGradeBase):
    id: int
    user_id: int

    # Relational data
    subject: Optional["SubjectDB"] = None

    model_config = ConfigDict(from_attributes=True)
