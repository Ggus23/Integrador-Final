from app.core.security import get_password_hash
from app.models.alert import Alert
from app.models.user import User, UserRole


def prueba_eliminacion_usuario_cascada(client, db_session):
    """Verifica que al eliminar un estudiante se purgan sus alertas (cascade)."""
    admin = User(
        email="admin_test@gmail.com",
        hashed_password=get_password_hash("admin123"),
        full_name="Admin Test User",
        role=UserRole.ADMIN,
        is_email_verified=True,
        is_active=True,
    )
    db_session.add(admin)

    target = User(
        email="target_test@gmail.com",
        hashed_password=get_password_hash("target123"),
        full_name="Target Test User",
        role=UserRole.STUDENT,
        is_email_verified=True,
        is_active=True,
    )
    db_session.add(target)
    db_session.commit()
    db_session.refresh(target)

    target_id = target.id

    alert = Alert(user_id=target_id, severity="high", message="Risk detected")
    db_session.add(alert)
    db_session.commit()

    assert db_session.query(Alert).filter(Alert.user_id == target_id).count() == 1

    login_data = {"username": "admin_test@gmail.com", "password": "admin123"}
    r = client.post("/api/v1/auth/login", data=login_data)
    assert r.status_code == 200
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.delete(f"/api/v1/users/{target_id}", headers=headers)
    assert response.status_code == 204

    assert db_session.query(User).filter(User.id == target_id).first() is None
    assert db_session.query(Alert).filter(Alert.user_id == target_id).count() == 0


def prueba_cambio_estado_usuario_resuelve_alertas(client, db_session):
    """Al desactivar un usuario, sus alertas pendientes se marcan como resueltas."""
    admin = User(
        email="admin_toggle@gmail.com",
        hashed_password=get_password_hash("admin123"),
        full_name="Admin Toggle User",
        role=UserRole.ADMIN,
        is_email_verified=True,
        is_active=True,
    )
    db_session.add(admin)

    target = User(
        email="target_toggle@gmail.com",
        hashed_password=get_password_hash("target123"),
        full_name="Target Toggle User",
        role=UserRole.STUDENT,
        is_email_verified=True,
        is_active=True,
    )
    db_session.add(target)
    db_session.commit()
    db_session.refresh(target)

    target_id = target.id

    alert1 = Alert(user_id=target_id, message="Alert 1", is_resolved=False)
    alert2 = Alert(user_id=target_id, message="Alert 2", is_resolved=False)
    db_session.add(alert1)
    db_session.add(alert2)
    db_session.commit()

    login_data = {"username": "admin_toggle@gmail.com", "password": "admin123"}
    r = client.post("/api/v1/auth/login", data=login_data)
    assert r.status_code == 200
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.patch(f"/api/v1/users/{target_id}/status", headers=headers)
    assert response.status_code == 200
    assert response.json()["is_active"] is False

    db_session.expire_all()
    alerts = db_session.query(Alert).filter(Alert.user_id == target_id).all()
    assert len(alerts) == 2
    for a in alerts:
        assert a.is_resolved is True
        assert a.resolved_at is not None

    response_activate = client.patch(f"/api/v1/users/{target_id}/status", headers=headers)
    assert response_activate.status_code == 200
    assert response_activate.json()["is_active"] is True
