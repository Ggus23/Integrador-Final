from typing import Optional

from pydantic import BaseModel, ConfigDict


class AcademicSubjectGradeBase(BaseModel):
    subject_name: str
    hito2_procesual: float = 0.0
    hito2_nota: float = 0.0
    hito3_procesual: float = 0.0
    hito3_nota: float = 0.0
    hito4_procesual: float = 0.0
    hito4_nota: float = 0.0
    hito5_procesual: float = 0.0
    hito5_nota: float = 0.0


class AcademicSubjectGradeCreate(AcademicSubjectGradeBase):
    pass


class AcademicSubjectGradeUpdate(AcademicSubjectGradeBase):
    subject_name: Optional[str] = None  # When updating, subject_name is optional


class AcademicSubjectGrade(AcademicSubjectGradeBase):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)
