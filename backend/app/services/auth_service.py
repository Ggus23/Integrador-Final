import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models.tokens import EmailVerificationToken, PasswordResetToken
from app.models.user import User
from app.services.email_service import email_service


class AuthService:
    def __init__(self):
        self.mail = email_service

    def _generate_token(self) -> str:
        return secrets.token_urlsafe(32)

    def _hash_token(self, token: str) -> str:
        return hashlib.sha256(token.encode()).hexdigest()

    def create_verification_token(self, db: Session, user: User) -> str:
        token = self._generate_token()
        hashed = self._hash_token(token)

        # Expire in 24 hours
        expires = datetime.now(timezone.utc) + timedelta(hours=24)

        db_token = EmailVerificationToken(
            user_id=user.id, token_hash=hashed, expires_at=expires
        )
        db.add(db_token)
        db.commit()

        self.mail.send_verification_email(user.email, token)
        return token

    def verify_email(self, db: Session, token: str) -> bool:
        hashed = self._hash_token(token)
        db_token = (
            db.query(EmailVerificationToken)
            .filter(
                EmailVerificationToken.token_hash == hashed,
                EmailVerificationToken.used_at == None,  # noqa: E711
            )
            .first()
        )

        if not db_token:
            return False

        # Ensure we compare timezone-aware datetimes
        expiry = db_token.expires_at
        if expiry.tzinfo is None:
            expiry = expiry.replace(tzinfo=timezone.utc)
        if expiry < datetime.now(timezone.utc):
            return False

        # Mark token used
        db_token.used_at = datetime.now(timezone.utc)

        # Mark user verified
        user = db.query(User).filter(User.id == db_token.user_id).first()
        if user:
            user.is_email_verified = True

        db.commit()
        return True

    def request_password_reset(self, db: Session, email: str):
        user = db.query(User).filter(User.email == email).first()
        if not user:
            # Return silently to avoid enumeration
            return

        token = self._generate_token()
        hashed = self._hash_token(token)
        expires = datetime.now(timezone.utc) + timedelta(minutes=15)  # 15 min expiry

        db_token = PasswordResetToken(
            user_id=user.id, token_hash=hashed, expires_at=expires
        )
        db.add(db_token)
        db.commit()

        self.mail.send_password_reset_email(user.email, token)

    def reset_password(self, db: Session, token: str, new_hashed_password: str) -> bool:
        hashed = self._hash_token(token)
        db_token = (
            db.query(PasswordResetToken)
            .filter(
                PasswordResetToken.token_hash == hashed,
                PasswordResetToken.used_at == None,  # noqa: E711
            )
            .first()
        )

        # Ensure comparison is timezone-aware
        if not db_token:
            return False

        expiry = db_token.expires_at
        if expiry.tzinfo is None:
            expiry = expiry.replace(tzinfo=timezone.utc)

        if expiry < datetime.now(timezone.utc):
            return False

        user = db.query(User).filter(User.id == db_token.user_id).first()
        if not user:
            return False

        # Update password
        user.hashed_password = new_hashed_password

        # Mark token used
        db_token.used_at = datetime.now(timezone.utc)
        db.commit()
        return True


auth_service = AuthService()
