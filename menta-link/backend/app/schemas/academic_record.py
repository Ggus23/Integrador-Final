from typing import Optional

from pydantic import BaseModel, ConfigDict


class AcademicRecordBase(BaseModel):
    gpa: float = 0.0
    enrolled_credits: int = 0
    failed_classes: int = 0

    # Global semester hitos
    hito2_procesual: Optional[float] = 0.0
    hito2_nota: Optional[float] = 0.0
    hito3_procesual: Optional[float] = 0.0
    hito3_nota: Optional[float] = 0.0
    hito4_procesual: Optional[float] = 0.0
    hito4_nota: Optional[float] = 0.0
    hito5_procesual: Optional[float] = 0.0
    hito5_nota: Optional[float] = 0.0


class AcademicRecordCreate(AcademicRecordBase):
    pass


class AcademicRecordUpdate(AcademicRecordBase):
    pass


class AcademicRecord(AcademicRecordBase):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)
