import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from jose import jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.phone_otp import PhoneOTPCode
from app.models.tokens import EmailVerificationToken, PasswordResetToken
from app.models.user import User
from app.services.email_service import email_service
from app.services.sms_service import sms_service
from app.utils.phones import normalize_phone_number

OTP_CODE_LENGTH = 6
MAX_OTP_ATTEMPTS = 5
PHONE_VERIFY_TOKEN_MINUTES = 15


class AuthService:
    def __init__(self):
        self.mail = email_service
        self.sms = sms_service

    def _generate_token(self) -> str:
        return secrets.token_urlsafe(32)

    def _hash_token(self, token: str) -> str:
        return hashlib.sha256(token.encode()).hexdigest()

    # ------------------------------------------------------------------
    # Verificación por celular (SMS / OTP)
    # ------------------------------------------------------------------
    def request_otp(self, db: Session, phone_number: str, purpose: str = "signup") -> bool:
        """
        Genera un código OTP de 6 dígitos, lo persiste (hasheado) y lo envía
        por SMS al número indicado. Devuelve True si el envío fue exitoso.
        """
        phone_number = normalize_phone_number(phone_number) or phone_number
        if not phone_number:
            return False

        # Invalida códigos anteriores no usados para el mismo teléfono/propósito
        previous = (
            db.query(PhoneOTPCode)
            .filter(
                PhoneOTPCode.phone_number == phone_number,
                PhoneOTPCode.purpose == purpose,
                PhoneOTPCode.used_at == None,  # noqa: E711
            )
            .all()
        )
        now = datetime.now(timezone.utc)
        for otp in previous:
            otp.used_at = now
        db.flush()

        code = f"{secrets.randbelow(10 ** OTP_CODE_LENGTH):0{OTP_CODE_LENGTH}d}"
        expires = now + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)

        db_otp = PhoneOTPCode(
            phone_number=phone_number,
            code_hash=self._hash_token(code),
            purpose=purpose,
            expires_at=expires,
        )
        db.add(db_otp)
        db.commit()

        return self.sms.send_otp(phone_number, code)

    def verify_otp(
        self, db: Session, phone_number: str, code: str, purpose: str = "signup"
    ) -> str | None:
        """
        Valida el código OTP. Si es correcto, marca el código como usado y
        devuelve un token firmado que prueba que el teléfono fue verificado.
        """
        phone_number = normalize_phone_number(phone_number) or phone_number
        now = datetime.now(timezone.utc)

        otp = (
            db.query(PhoneOTPCode)
            .filter(
                PhoneOTPCode.phone_number == phone_number,
                PhoneOTPCode.purpose == purpose,
                PhoneOTPCode.used_at == None,  # noqa: E711
            )
            .order_by(PhoneOTPCode.id.desc())
            .first()
        )
        if not otp:
            return None

        expiry = otp.expires_at
        if expiry.tzinfo is None:
            expiry = expiry.replace(tzinfo=timezone.utc)

        if self._hash_token(code) != otp.code_hash or expiry < now:
            # Protección anti-fuerza bruta: tras N intentos el código se invalida
            otp.attempts += 1
            if otp.attempts >= MAX_OTP_ATTEMPTS:
                otp.used_at = now
            db.add(otp)
            db.commit()
            return None

        otp.used_at = now
        db.add(otp)
        db.commit()

        user = db.query(User).filter(User.phone_number == phone_number).first()
        if user:
            user.is_phone_verified = True
            db.add(user)
            db.commit()

        return self.create_phone_verification_token(phone_number, purpose)

    def create_phone_verification_token(
        self, phone_number: str, purpose: str = "signup"
    ) -> str:
        """Token firmado de corta duración que acredita la verificación del celular."""
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=PHONE_VERIFY_TOKEN_MINUTES
        )
        to_encode = {
            "exp": expire,
            "sub": phone_number,
            "purpose": purpose,
            "type": "phone_verify",
        }
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    def verify_phone_verification_token(self, token: str) -> dict | None:
        """
        Valida el token de verificación telefónica. Devuelve sus claims
        (incluye 'sub' con el teléfono) o None si es inválido/expirado.
        """
        try:
            payload = jwt.decode(
                token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
            )
        except Exception:  # noqa: BLE001
            return None
        if payload.get("type") != "phone_verify" or not payload.get("sub"):
            return None
        return payload

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
