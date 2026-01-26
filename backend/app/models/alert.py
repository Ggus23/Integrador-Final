from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base


class Alert(Base):
    """
    Model for System Alerts triggered by High-Risk detection.
    Intended for Psychologists/Tutors to follow up on students.
    These alerts are generated locally by the risk calculation logic.
    """

    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    severity = Column(String, default="Medium")  # Low, Medium, High
    message = Column(String, nullable=False)
    is_resolved = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    # Relationship back to the user
    user = relationship("User", back_populates="alerts")
