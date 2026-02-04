from typing import Any, Dict

from app.services.alert_service import alert_service
from app.services.risk_service import risk_service
from sqlalchemy.orm import Session


class CheckinService:
    async def process_checkin(
        self, db: Session, user_email: str, checkin_data: Dict[str, Any]
    ):
        """
        Process a daily checkin: save it, calculate risk, trigger alerts.
        """
        # 1. Save checkin (omitted for placeholder)

        # 2. Calculate risk (assuming 'score' is in data or calculated from it)
        score = checkin_data.get("score", 3)  # Default to neutral
        risk = risk_service.assess_risk("checkin", score)

        # 3. Alert if needed
        await alert_service.process_risk_alert(user_email, risk, "Daily Check-in")

        return {"status": "processed", "risk": risk}


checkin_service = CheckinService()
