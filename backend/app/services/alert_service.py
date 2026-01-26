from app.core.constants import RiskLevel
from app.services.notification_service import notification_service


class AlertService:
    @staticmethod
    async def process_risk_alert(user_email: str, risk_level: RiskLevel, context: str):
        """
        Triggers an alert if the risk level is high or critical.
        """
        if risk_level in [RiskLevel.HIGH, RiskLevel.CRITICAL]:
            await notification_service.send_risk_alert(
                user_email, risk_level.value, f"High risk detected during: {context}"
            )


alert_service = AlertService()
