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
        await send_alert_email(user_email, f"Nivel de Riesgo: {risk_level}. {details}")

    @staticmethod
    async def notify_cabinet(user_email: str, risk_level: str, details: str):
        """
        Sends a notification to the psychologist cabinet about a student in risk.
        Only called if student gives consent.
        """
        from app.core.config import settings
        
        subject = f"ALERTA: Estudiante con Riesgo {risk_level}"
        message = (
            f"Se ha detectado un nivel de riesgo {risk_level} en el estudiante: {user_email}.\n"
            f"Contexto: {details}\n\n"
            f"El estudiante ha autorizado el envío de esta información para recibir apoyo."
        )
        
        if settings.EMAILS_CABINET_EMAIL:
            await send_email(
                [settings.EMAILS_CABINET_EMAIL], 
                subject=subject, 
                environment={"msg": message}
            )



notification_service = NotificationService()
