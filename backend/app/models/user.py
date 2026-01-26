import enum

from sqlalchemy import Boolean, Column, DateTime, Enum, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base


class UserRole(str, enum.Enum):
    """
    Enumeration of user roles within the MENTALINK system.
    This helps in implementing Role-Based Access Control (RBAC).
    """

    STUDENT = "student"
    PSYCHOLOGIST = "psychologist"
    TUTOR = "tutor"
    ADMIN = "admin"


class User(Base):
    """
    SQLAlchemy model representing a User in the database.
    Contains profile information, authentication credentials, and roles.
    """

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(Text, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.STUDENT, nullable=False)
    is_active = Column(Boolean(), default=True)
    is_email_verified = Column(Boolean(), default=False)

    # Relationships
    consent = relationship("Consent", back_populates="user", uselist=False)
    assessment_responses = relationship("AssessmentResponse", back_populates="user")
    emotional_checkins = relationship("EmotionalCheckin", back_populates="user")
    risk_summary = relationship("RiskSummary", back_populates="user", uselist=False)
    alerts = relationship("Alert", back_populates="user")

    # Auth tokens relationships
    verification_tokens = relationship("EmailVerificationToken", back_populates="user")
    reset_tokens = relationship("PasswordResetToken", back_populates="user")

    # Audit timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    @property
    def consent_accepted(self) -> bool:
        """
        Calculated property to check if the user has accepted the informed consent.
        Crucial for frontend navigation logic.
        """
        return self.consent.has_accepted if self.consent else False

    def __repr__(self):
        return f"<User {self.email} ({self.role})>"
