from app.db.base_class import Base
from sqlalchemy import JSON, Column, Integer, String, Text
from sqlalchemy.orm import relationship


class Assessment(Base):
    """
    Model for Psychometric Assessments (e.g., PSS-10, DASS-21).
    Stores the definition of the scale, instructions, and items.
    """

    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text)
    # Type of scale: 'PSS-10' (Stress), 'DASS-21' (Depression/Anxiety/Stress)
    type = Column(String, index=True)
    # JSON structure to store questions: [{"id": 1, "text": "..."}, ...]
    items = Column(JSON, nullable=False)

    # Relationship to responses
    responses = relationship("AssessmentResponse", back_populates="assessment")
