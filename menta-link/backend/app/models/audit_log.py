from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base


class AuditLog(Base):
    """
    Records sensitive data access for ethical compliance (GDPR/SDG).
    Tracks WHO accessed WHAT and WHEN.
    """

    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(
        Integer, ForeignKey("users.id"), nullable=False
    )  # The Staff/Admin viewing data
    action = Column(String, nullable=False)  # e.g., "VIEW_STUDENT", "RESOLVE_ALERT"
    resource_id = Column(String, nullable=True)  # ID of the student/alert viewed
    details = Column(Text, nullable=True)  # JSON or text description

    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship back to the user (the actor)
    actor = relationship("User", back_populates="audit_logs")
