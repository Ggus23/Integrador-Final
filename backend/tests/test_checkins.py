from unittest.mock import AsyncMock, patch

import pytest
from app.core.constants import RiskLevel
from app.services.checkin_service import checkin_service


@pytest.mark.asyncio
async def test_process_checkin():
    # Mock services
    with patch(
        "app.services.alert_service.alert_service.process_risk_alert",
        new_callable=AsyncMock,
    ) as mock_alert:
        checkin_data = {"score": 3, "mood": "neutral"}
        result = await checkin_service.process_checkin(
            None, "user@example.com", checkin_data
        )

        assert result["status"] == "processed"
        # Based on logic: score 3 -> RiskLevel.MEDIUM
        assert result["risk"] == RiskLevel.MEDIUM

        # Verify alert was called
        mock_alert.assert_called_once()
