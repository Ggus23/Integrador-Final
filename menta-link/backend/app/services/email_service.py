import json
import logging
import urllib.request
from abc import ABC, abstractmethod
from html import escape
from urllib.parse import quote

from app.core.config import settings

logger = logging.getLogger(__name__)


def _frontend_base_url() -> str:
    return (
        settings.FRONTEND_BASE_URL
        or (
            settings.BACKEND_CORS_ORIGINS[0]
            if settings.BACKEND_CORS_ORIGINS
            else "http://localhost:3000"
        )
    ).rstrip("/")


def _verification_url(path: str, token: str) -> str:
    return f"{_frontend_base_url()}/{path}?token={quote(token, safe='')}"


class EmailService(ABC):
    @abstractmethod
    def send_verification_email(self, to_email: str, token: str):
        pass

    @abstractmethod
    def send_password_reset_email(self, to_email: str, token: str):
        pass


class MockEmailService(EmailService):
    def send_verification_email(self, to_email: str, token: str):
        logger.warning(
            "EMAIL_MOCK: Verification Link -> %s",
            _verification_url("auth/verify-email", token),
        )
        print(
            f"EMAIL_MOCK: Sending Verification Token to {to_email}: {token}", flush=True
        )

    def send_password_reset_email(self, to_email: str, token: str):
        logger.warning(
            "EMAIL_MOCK: Reset Link -> %s", _verification_url("reset-password", token)
        )
        print(
            f"EMAIL_MOCK: Sending Password Reset Token to {to_email}: {token}",
            flush=True,
        )


class BrevoEmailService(EmailService):
    def _send_email(self, to_email: str, subject: str, html_content: str) -> bool:
        api_key = settings.BREVO_API_KEY or settings.SMTP_PASSWORD

        if not api_key:
            logger.error("Brevo API Key no configurada.")
            return False

        payload = {
            "sender": {
                "name": settings.EMAILS_FROM_NAME or "MENTA-LINK",
                "email": settings.EMAILS_FROM_EMAIL or "pacaragustin@gmail.com",
            },
            "to": [
                {
                    "email": to_email,
                }
            ],
            "subject": subject,
            "htmlContent": html_content,
        }

        headers = {
            "api-key": api_key,
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

        try:
            # Petición HTTPS pura (Puerto 443 - Imposible de bloquear por Railway)
            req = urllib.request.Request(
                "https://api.brevo.com/v3/smtp/email",
                data=json.dumps(payload).encode("utf-8"),
                headers=headers,
                method="POST",
            )

            with urllib.request.urlopen(req, timeout=10) as response:
                if response.status in (200, 201):
                    logger.info(
                        f"Correo enviado exitosamente vía Brevo API a {to_email}"
                    )
                    return True
                else:
                    logger.error(f"Brevo API devolvió estado HTTP: {response.status}")
                    return False

        except urllib.error.HTTPError as e:
            error_body = e.read().decode("utf-8")
            logger.error(
                f"Failed to send email via Brevo to {to_email}: {e.code} - {error_body}"
            )
            return False
        except Exception as e:  # noqa: BLE001
            logger.error(f"Failed to send email via Brevo to {to_email}: {str(e)}")
            return False

    def send_verification_email(self, to_email: str, token: str):
        link = _verification_url("auth/verify-email", token)
        safe_link = escape(link, quote=True)

        subject = "Verifica tu cuenta en MENTA-LINK"
        html = f"""
        <h1>Bienvenido a MENTA-LINK</h1>
        <p>Por favor verifica tu correo haciendo clic en el siguiente enlace:</p>
        <p><a href="{safe_link}">Verificar Cuenta</a></p>
        <p>Si no puedes hacer clic, copia este enlace:</p>
        <p>{safe_link}</p>
        """
        success = self._send_email(to_email, subject, html)

        if not success:
            MockEmailService().send_verification_email(to_email, token)

    def send_password_reset_email(self, to_email: str, token: str):
        link = _verification_url("reset-password", token)
        safe_link = escape(link, quote=True)

        subject = "Recuperación de Contraseña - MENTA-LINK"
        html = f"""
        <h1>Restablecer Contraseña</h1>
        <p>Has solicitado restablecer tu contraseña. Haz clic aquí:</p>
        <p><a href="{safe_link}">Restablecer Contraseña</a></p>
        <p>Este enlace expira en 15 minutos.</p>
        """
        success = self._send_email(to_email, subject, html)

        if not success:
            MockEmailService().send_password_reset_email(to_email, token)


def get_email_service() -> EmailService:
    if settings.EMAIL_ENABLED:
        return BrevoEmailService()
    return MockEmailService()


email_service = get_email_service()
