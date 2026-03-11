from app.db.base_class import Base
from sqlalchemy import Boolean, Column, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship


class AcademicProfile(Base):
    """
    Model for storing student academic information relevant for dropout prediction.
    """

    __tablename__ = "academic_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    course = Column(String, nullable=True)  # e.g., "Computer Science"
    scholarship_holder = Column(Boolean, default=False)
    tuition_fees_up_to_date = Column(Boolean, default=True)

    # Academic performance
    current_semester = Column(Integer, default=1)
    units_approved = Column(Integer, default=0)
    current_gpa = Column(Float, default=0.0)  # Total 0-100 calculated from hitos

    # Hitos System (H2 to H5)
    # Each Hito: 15 (Processual) + 10 (Milestone Grade) = 25 total
    hito2_procesual = Column(Float, default=0.0)
    hito2_nota = Column(Float, default=0.0)

    hito3_procesual = Column(Float, default=0.0)
    hito3_nota = Column(Float, default=0.0)

    hito4_procesual = Column(Float, default=0.0)
    hito4_nota = Column(Float, default=0.0)

    hito5_procesual = Column(Float, default=0.0)
    hito5_nota = Column(Float, default=0.0)

    age_at_enrollment = Column(Integer, nullable=True)
    gender = Column(Integer, nullable=True)  # 0: Female, 1: Male (matching dataset)

    # Relationship back to the user
    user = relationship("User", back_populates="academic_profile")
