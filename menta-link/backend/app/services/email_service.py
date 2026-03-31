import logging
import smtplib
from abc import ABC, abstractmethod
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings

logger = logging.getLogger(__name__)


class EmailService(ABC):
    @abstractmethod
    def send_verification_email(self, to_email: str, token: str):
        pass

    @abstractmethod
    def send_password_reset_email(self, to_email: str, token: str):
        pass


class MockEmailService(EmailService):
    def send_verification_email(self, to_email: str, token: str):
        # Fallback to logging
        base_url = (
            settings.BACKEND_CORS_ORIGINS[0]
            if settings.BACKEND_CORS_ORIGINS
            else "http://localhost:3000"
        )
        logger.warning(
            f"EMAIL_MOCK: Verification Link -> {base_url}/auth/verify-email?"
            f"token={token}"
        )
        print(
            f"EMAIL_MOCK: Sending Verification Token to {to_email}: {token}", flush=True
        )

    def send_password_reset_email(self, to_email: str, token: str):
        base_url = (
            settings.BACKEND_CORS_ORIGINS[0]
            if settings.BACKEND_CORS_ORIGINS
            else "http://localhost:3000"
        )
        logger.warning(
            f"EMAIL_MOCK: Reset Link -> {base_url}/reset-password?token={token}"
        )
        print(
            f"EMAIL_MOCK: Sending Password Reset Token to {to_email}: {token}",
            flush=True,
        )


class SMTPEmailService(EmailService):
    def _send_email(self, to_email: str, subject: str, html_content: str) -> bool:
        if not settings.SMTP_HOST or not settings.SMTP_USER:
            logger.error("SMTP credentials not configured.")
            return False

        msg = MIMEMultipart()
        msg["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
        msg["To"] = to_email
        msg["Subject"] = subject

        msg.attach(MIMEText(html_content, "html", "utf-8"))

        try:
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
            if settings.SMTP_TLS:
                server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
            server.quit()
            logger.info(f"Email sent successfully to {to_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False

    def send_verification_email(self, to_email: str, token: str):
        # Assuming frontend is on localhost:3000 or the first allowed origin
        base_url = (
            settings.BACKEND_CORS_ORIGINS[0]
            if settings.BACKEND_CORS_ORIGINS
            else "http://localhost:3000"
        )
        link = f"{base_url}/auth/verify-email?token={token}"

        subject = "Verifica tu cuenta en MENTA-LINK"
        html = f"""
        <h1>Bienvenido a MENTA-LINK</h1>
        <p>Por favor verifica tu correo haciendo clic en el siguiente enlace:</p>
        <a href="{link}">Verificar Cuenta</a>
        <p>Si no puedes hacer clic, copia este enlace:</p>
        <p>{link}</p>
        """
        success = self._send_email(to_email, subject, html)

        # Fallback if SMTP fails
        if not success:
            MockEmailService().send_verification_email(to_email, token)

    def send_password_reset_email(self, to_email: str, token: str):
        base_url = (
            settings.BACKEND_CORS_ORIGINS[0]
            if settings.BACKEND_CORS_ORIGINS
            else "http://localhost:3000"
        )
        link = f"{base_url}/reset-password?token={token}"

        subject = "Recuperación de Contraseña - MENTA-LINK"
        html = f"""
        <h1>Restablecer Contraseña</h1>
        <p>Has solicitado restablecer tu contraseña. Haz clic aquí:</p>
        <a href="{link}">Restablecer Contraseña</a>
        <p>Este enlace expira en 15 minutos.</p>
        """
        success = self._send_email(to_email, subject, html)

        # Fallback if SMTP fails
        if not success:
            MockEmailService().send_password_reset_email(to_email, token)


# Factory logic
def get_email_service() -> EmailService:
    if settings.SMTP_HOST:
        return SMTPEmailService()
    return MockEmailService()


email_service = get_email_service()
