from sqlalchemy import (
    JSON,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base


class EmotionalDiary(Base):
    """
    Model for Daily Emotional Diary entries.
    Allows students to record their experiences, activities, and emotions.
    """

    __tablename__ = "emotional_diary"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    date = Column(Date, nullable=False, default=func.current_date())
    experience = Column(Text, nullable=True)
    activities = Column(Text, nullable=True)
    emotion = Column(String, nullable=False)  # e.g., "Muy feliz"
    emotion_color = Column(String, nullable=False)  # e.g., "Verde"
    wellbeing_level = Column(Integer, nullable=False)  # Scale 1-5

    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    # AI Sentiment Analysis Fields
    emotion_ai = Column(String, nullable=True)  # Dominant emotion from AI
    emotion_scores = Column(JSON, nullable=True)  # JSON scores
    analysis_created_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", back_populates="emotional_diary_entries")
