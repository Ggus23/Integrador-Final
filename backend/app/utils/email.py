import logging
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


async def send_email(
    email_to: List[str],
    subject: str,
    template_name: Optional[str] = None,
    environment: Dict[str, Any] = None,
) -> None:
    """
    Mock function to send emails.
    In the future, integrate with SMTP or an email provider (SendGrid, SES).
    """
    logger.info(f"Sending email to {email_to} with subject '{subject}'")
    # Simulation of processing


async def send_reset_password_email(email_to: str, email: str, token: str) -> None:
    subject = "Restablecer tu contraseña"
    msg = f"Usa este token para restablecer tu contraseña: {token}"
    await send_email([email_to], subject=subject, environment={"msg": msg})


async def send_alert_email(email_to: str, alert_details: str) -> None:
    subject = "Alerta de MENTALINK"
    await send_email(
        [email_to], subject=subject, environment={"details": alert_details}
    )
