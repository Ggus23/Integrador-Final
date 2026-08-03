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


class AcademicSubjectGradeUpdate(BaseModel):
    subject_name: Optional[str] = None
    hito2_procesual: Optional[float] = None
    hito2_nota: Optional[float] = None
    hito3_procesual: Optional[float] = None
    hito3_nota: Optional[float] = None
    hito4_procesual: Optional[float] = None
    hito4_nota: Optional[float] = None
    hito5_procesual: Optional[float] = None
    hito5_nota: Optional[float] = None


class AcademicSubjectGrade(AcademicSubjectGradeBase):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)
