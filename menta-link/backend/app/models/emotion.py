from sqlalchemy import Column, Integer, String

from app.db.base_class import Base


class Emotion(Base):
    """
    Model for storing distinct emotions and their associated colors.
    Solves 3NF violation in EmotionalDiary.
    """

    __tablename__ = "emotions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    color = Column(String, nullable=False)

    # Relationship back to emotional diaries (Comentado hasta completar migración)
    # diaries = relationship("EmotionalDiary", back_populates="emotion")

    def __repr__(self):
        return f"<Emotion {self.name} ({self.color})>"
