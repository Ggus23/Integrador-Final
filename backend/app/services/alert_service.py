import logging

from app.core.constants import RiskLevel
from app.models.alert import Alert
from app.services.notification_service import notification_service
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


class AlertService:
    """
    Generates differentiated alerts for every risk level.

    - LOW      → no alert record, only a structured log entry.
    - MEDIUM   → passive alert in DB (no email). Staff can monitor it.
    - HIGH     → active alert in DB + email notification to the student.
    - CRITICAL → active alert in DB + email notification, marked critical severity.
    """

    @staticmethod
    def _build_alert(
        db: Session,
        user_id: int,
        severity: str,
        message: str,
    ) -> Alert:
        """Persist an Alert row and flush (caller must commit)."""
        alert = Alert(
            user_id=user_id,
            severity=severity,
            message=message,
        )
        db.add(alert)
        return alert

    @staticmethod
    async def process_risk_alert(
        db: Session,
        user_id: int,
        user_email: str,
        risk_level: RiskLevel,
        context: str,
        notify_cabinet: bool = False,
    ) -> None:
        """
        Decide which action to take based on the risk level.
        `db` is passed so we can persist Medium alerts without a separate
        commit (caller owns the transaction).
        """

        if risk_level == RiskLevel.LOW:
            # No alert record needed — just trace.
            logger.info(
                "RiskAlert: user_id=%s level=Low context=%s — no action required.",
                user_id,
                context,
            )
            return

        # Common alert creation logic
        message = f"{risk_level.value} detectado durante: {context}."
        if risk_level == RiskLevel.CRITICAL:
            message = f"⚠️ RIESGO CRÍTICO detectado durante: {context}. Requiere atención inmediata."

        AlertService._build_alert(
            db,
            user_id,
            severity=risk_level.value,
            message=message,
        )

        # Notify student for High/Critical
        if risk_level in [RiskLevel.HIGH, RiskLevel.CRITICAL]:
            await notification_service.send_risk_alert(
                user_email,
                risk_level.value,
                f"{'CRÍTICO - ' if risk_level == RiskLevel.CRITICAL else ''}Evaluación preventiva: {context}",
            )

        # Notify Cabinet if consent was given and risk is significant
        if notify_cabinet and risk_level in [
            RiskLevel.MEDIUM,
            RiskLevel.HIGH,
            RiskLevel.CRITICAL,
        ]:
            await notification_service.notify_cabinet(
                user_email=user_email, risk_level=risk_level.value, details=context
            )
            logger.info(
                f"RiskAlert: Cabinet notified for user_id={user_id} (Consent given)"
            )


alert_service = AlertService()
