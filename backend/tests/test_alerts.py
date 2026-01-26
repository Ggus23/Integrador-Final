from unittest.mock import AsyncMock, patch

import pytest

from app.core.constants import RiskLevel
from app.services.alert_service import alert_service


@pytest.mark.asyncio
async def test_process_risk_alert_high():
    with patch(
        "app.services.notification_service.notification_service.send_risk_alert",
        new_callable=AsyncMock,
    ) as mock_notify:
        await alert_service.process_risk_alert(
            "user@example.com", RiskLevel.HIGH, "Test Context"
        )
        mock_notify.assert_called_once_with(
            "user@example.com", "high", "High risk detected during: Test Context"
        )


@pytest.mark.asyncio
async def test_process_risk_alert_low():
    with patch(
        "app.services.notification_service.notification_service.send_risk_alert",
        new_callable=AsyncMock,
    ) as mock_notify:
        await alert_service.process_risk_alert(
            "user@example.com", RiskLevel.LOW, "Test Context"
        )
        mock_notify.assert_not_called()
