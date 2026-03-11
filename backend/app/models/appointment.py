from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.db.base_class import Base

class AppointmentStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class Appointment(Base):
    """
    Model for appointments between students and the counseling team.
    Matches the 'Agendar Cita' requirement from Trello.
    """
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Optional: assigned psychologist (can be null if it's just a request queue)
    psychologist_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    appointment_date = Column(DateTime(timezone=True), nullable=False)
    reason = Column(String, nullable=True)
    status = Column(String, default=AppointmentStatus.PENDING)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    student = relationship("User", foreign_keys=[user_id], back_populates="appointments")
    psychologist = relationship("User", foreign_keys=[psychologist_id])
