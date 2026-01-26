from sqlalchemy import Column, DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base


class EmotionalCheckin(Base):
    """
    Model for Daily Emotional Check-ins.
    Allows users to quickly record their mood and a small note.
    Useful for longitudinal risk analysis.
    """

    __tablename__ = "emotional_checkins"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Mood score usually 1 to 5 (1: Very Bad, 5: Very Good)
    mood_score = Column(Integer, nullable=False)
    # Energy level 1 to 5
    energy_level = Column(Integer, nullable=True, default=3)
    # Sleep hours
    sleep_hours = Column(Integer, nullable=True)
    # Optional note from the user
    note = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    # Relationship back to the user
    user = relationship("User", back_populates="emotional_checkins")
