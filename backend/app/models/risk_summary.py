from app.db.base_class import Base
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func


class RiskSummary(Base):
    """
    Model for storing the overall risk status of a user.
    Aggregates data from assessments, check-ins, and ML predictions.
    """

    __tablename__ = "risk_summaries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    # Aggregated risk level predicted by the system
    current_risk_level = Column(String, default="Low")
    # Confidence score of the ML prediction (0.0 to 1.0)
    prediction_confidence = Column(Float, default=1.0)

    last_updated = Column(
        DateTime(timezone=True), onupdate=func.now(), server_default=func.now()
    )

    # Relationship back to the user
    user = relationship("User", back_populates="risk_summary")
