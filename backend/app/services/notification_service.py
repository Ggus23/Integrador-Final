from typing import List

from app.core.config import settings
from app.utils.email import send_alert_email, send_email


class NotificationService:
    @staticmethod
    async def send_notification(user_email: str, subject: str, message: str):
        """
        Sends a general notification to a user.
        """
        await send_email([user_email], subject=subject, environment={"msg": message})

    @staticmethod
    async def send_risk_alert(user_email: str, risk_level: str, details: str):
        """
        Sends a risk alert.
        """
        await send_alert_email(user_email, f"Risk Level: {risk_level}. {details}")


notification_service = NotificationService()
