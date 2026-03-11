from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.core.constants import RiskLevel
from app.services.alert_service import alert_service


@pytest.mark.asyncio
async def test_process_risk_alert_high():
    with patch(
        "app.services.notification_service.notification_service.send_risk_alert",
        new_callable=AsyncMock,
    ) as mock_notify:
        db_mock = MagicMock()
        await alert_service.process_risk_alert(
            db_mock, 1, "user@example.com", RiskLevel.HIGH, "Test Context"
        )
        mock_notify.assert_called_once_with(
            "user@example.com",
            RiskLevel.HIGH.value,
            "Evaluación preventiva: Test Context",
        )


@pytest.mark.asyncio
async def test_process_risk_alert_low():
    with patch(
        "app.services.notification_service.notification_service.send_risk_alert",
        new_callable=AsyncMock,
    ) as mock_notify:
        db_mock = MagicMock()
        await alert_service.process_risk_alert(
            db_mock, 1, "user@example.com", RiskLevel.LOW, "Test Context"
        )
        mock_notify.assert_not_called()
