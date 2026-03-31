from typing import Optional

from pydantic import BaseModel, ConfigDict


class AcademicProfileBase(BaseModel):
    course: Optional[str] = None
    scholarship_holder: bool = False
    tuition_fees_up_to_date: bool = True
    current_semester: int = 1
    units_approved: int = 0
    current_gpa: float = 0.0

    # Hitos fields
    hito2_procesual: Optional[float] = 0.0
    hito2_nota: Optional[float] = 0.0
    hito3_procesual: Optional[float] = 0.0
    hito3_nota: Optional[float] = 0.0
    hito4_procesual: Optional[float] = 0.0
    hito4_nota: Optional[float] = 0.0
    hito5_procesual: Optional[float] = 0.0
    hito5_nota: Optional[float] = 0.0

    age_at_enrollment: Optional[int] = None
    gender: Optional[int] = None


class AcademicProfileCreate(AcademicProfileBase):
    pass


class AcademicProfileUpdate(AcademicProfileBase):
    pass


class AcademicProfile(AcademicProfileBase):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)
