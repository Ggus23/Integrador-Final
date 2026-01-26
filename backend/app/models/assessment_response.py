from sqlalchemy import JSON, Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base


class AssessmentResponse(Base):
    """
    Model for storing user responses to psychometric assessments.
    Calculates and stores the total score and risk level.
    """

    __tablename__ = "assessment_responses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)

    # Store raw answers as JSON: {"1": 4, "2": 2, ...}
    answers = Column(JSON, nullable=False)

    # Calculated metrics
    total_score = Column(Float, nullable=False)
    # Risk Level: "Low", "Medium", "High"
    risk_level = Column(String, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="assessment_responses")
    assessment = relationship("Assessment", back_populates="responses")
