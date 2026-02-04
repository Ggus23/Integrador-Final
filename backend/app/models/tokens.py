from app.db.base_class import Base
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func


class EmailVerificationToken(Base):
    """
    Stores hashed tokens for email verification.
    """

    __tablename__ = "email_verification_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token_hash = Column(String, index=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # We delete used tokens or mark them? Prompt says "invalidate token (one-time)".
    # Deleting is checking for existence. Storing 'used_at' allows audit.
    used_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="verification_tokens")


class PasswordResetToken(Base):
    """
    Stores hashed tokens for password recovery.
    """

    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token_hash = Column(String, index=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    used_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="reset_tokens")
