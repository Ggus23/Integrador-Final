from sqlalchemy import Column, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class AcademicSubjectGrade(Base):
    """
    Model for storing grades for a specific subject, broken down into 4 hitos (H2 to H5).
    """

    __tablename__ = "academic_subject_grades"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject_name = Column(String, nullable=False)
    
    # Hito 2
    hito2_procesual = Column(Float, default=0.0)
    hito2_nota = Column(Float, default=0.0)
    
    # Hito 3
    hito3_procesual = Column(Float, default=0.0)
    hito3_nota = Column(Float, default=0.0)
    
    # Hito 4
    hito4_procesual = Column(Float, default=0.0)
    hito4_nota = Column(Float, default=0.0)
    
    # Hito 5
    hito5_procesual = Column(Float, default=0.0)
    hito5_nota = Column(Float, default=0.0)

    # Relationships
    user = relationship("User", back_populates="subject_grades")
