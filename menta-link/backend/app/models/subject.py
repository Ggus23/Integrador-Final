from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Subject(Base):
    """
    Model for storing academic subjects/courses.
    Solves 3NF violation and string redundancy in AcademicSubjectGrade.
    """

    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)

    # Relationship back to subject grades (Comentado hasta completar migración)
    # grades = relationship("AcademicSubjectGrade", back_populates="subject")

    def __repr__(self):
        return f"<Subject {self.name}>"
