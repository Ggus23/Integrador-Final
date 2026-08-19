import logging
import smtplib
import socket
from abc import ABC, abstractmethod
from contextlib import contextmanager
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings

logger = logging.getLogger(__name__)


# Context Manager para forzar IPv4 y evitar el error [Errno 101] en Railway
@contextmanager
def force_ipv4():
    old_getaddrinfo = socket.getaddrinfo

    def ipv4_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
        return old_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)

    socket.getaddrinfo = ipv4_getaddrinfo
    try:
        yield
    finally:
        socket.getaddrinfo = old_getaddrinfo


class EmailService(ABC):
    @abstractmethod
    def send_verification_email(self, to_email: str, token: str):
        pass

    @abstractmethod
    def send_password_reset_email(self, to_email: str, token: str):
        pass


class MockEmailService(EmailService):
    def send_verification_email(self, to_email: str, token: str):
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
            # Forzamos IPv4 y timeout de 10s para evitar congelamientos
            with force_ipv4():
                port = int(settings.SMTP_PORT or 587)

                if port == 465:
                    # Puerto 465 usa conexión SSL directa
                    server = smtplib.SMTP_SSL(settings.SMTP_HOST, port, timeout=10)
                else:
                    # Puerto 587 usa conexión TLS (STARTTLS)
                    server = smtplib.SMTP(settings.SMTP_HOST, port, timeout=10)
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
    if settings.EMAIL_ENABLED and settings.SMTP_HOST:
        return SMTPEmailService()
    return MockEmailService()


email_service = get_email_service()