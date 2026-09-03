from fastapi.testclient import TestClient

from app.core.constants import RiskLevel
from app.models.alert import Alert
from app.models.user import User, UserRole
from app.services.alert_service import alert_service


def prueba_seguridad_listar_alertas(client: TestClient):
    response = client.get("/api/v1/alerts/")
    assert response.status_code == 401


def prueba_seguridad_mis_alertas(client: TestClient):
    response = client.get("/api/v1/alerts/me")
    assert response.status_code == 401


def prueba_procesar_alerta_riesgo_alto(client, db_session):
    user = User(
        email="estudiante@unifranz.edu.bo",
        hashed_password="hashed",
        full_name="Estudiante Alerta",
        role=UserRole.STUDENT,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    # Riesgo alto crea un registro de alerta en DB (logica real de alert_service)
    import asyncio

    asyncio.run(
        alert_service.process_risk_alert(
            db=db_session,
            user_id=user.id,
            user_email=user.email,
            risk_level=RiskLevel.HIGH,
            context="Test Context",
        )
    )
    db_session.commit()

    alerts = db_session.query(Alert).filter(Alert.user_id == user.id).all()
    assert len(alerts) == 1
    assert alerts[0].severity == RiskLevel.HIGH.value
    assert "Test Context" in alerts[0].message


def prueba_procesar_alerta_riesgo_bajo(client, db_session):
    user = User(
        email="estudiante_low@unifranz.edu.bo",
        hashed_password="hashed",
        full_name="Estudiante Bajo",
        role=UserRole.STUDENT,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    # Riesgo bajo: no crea registro de alerta (solo log)
    import asyncio

    asyncio.run(
        alert_service.process_risk_alert(
            db=db_session,
            user_id=user.id,
            user_email=user.email,
            risk_level=RiskLevel.LOW,
            context="Test Context",
        )
    )
    db_session.commit()

    alerts = db_session.query(Alert).filter(Alert.user_id == user.id).all()
    assert len(alerts) == 0
