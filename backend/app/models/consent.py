from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base


class Consent(Base):
    """
    Model for Informed Consent.
    In a bachelor thesis context, this is crucial for the ethical part of the research.
    Users must accept this before their data can be processed.
    """

    __tablename__ = "consents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    has_accepted = Column(Boolean, default=False, nullable=False)
    accepted_at = Column(DateTime(timezone=True), server_default=func.now())
    version = Column(String, default="1.0")

    # Relationship back to the user
    user = relationship("User", back_populates="consent")
