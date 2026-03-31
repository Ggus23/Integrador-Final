from app.core.security import get_password_hash
from app.models.alert import Alert
from app.models.audit_log import AuditLog
from app.models.user import User, UserRole


def test_delete_user_cascades(client, db_session):
    # 1. Create an admin user to perform the deletion
    admin_pass = "admin123"
    admin = User(
        email="admin_test@gmail.com",
        hashed_password=get_password_hash(admin_pass),
        full_name="Admin Test User",
        role=UserRole.ADMIN,
        is_email_verified=True,
        is_active=True,
    )
    db_session.add(admin)

    # 2. Create a target user to be deleted
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

    # 3. Create related data for the target user
    audit = AuditLog(
        actor_id=target_id, action="LOGIN", resource_id="auth", details="User logged in"
    )
    alert = Alert(user_id=target_id, severity="high", message="Risk detected")
    db_session.add(audit)
    db_session.add(alert)
    db_session.commit()

    # Verify they exist
    assert (
        db_session.query(AuditLog).filter(AuditLog.actor_id == target_id).count() == 1
    )
    assert db_session.query(Alert).filter(Alert.user_id == target_id).count() == 1

    # 4. Login as admin to get token
    login_data = {"username": "admin_test@gmail.com", "password": admin_pass}
    r = client.post("/api/v1/auth/login", data=login_data)
    assert r.status_code == 200, f"Login failed: {r.text}"
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 5. Delete the target user
    r = client.delete(f"/api/v1/users/{target_id}", headers=headers)
    assert r.status_code == 204

    # 6. Verify user is gone
    assert db_session.query(User).filter(User.id == target_id).first() is None

    # 7. Verify related data is gone (Cascading delete)
    assert (
        db_session.query(AuditLog).filter(AuditLog.actor_id == target_id).count() == 0
    )
    assert db_session.query(Alert).filter(Alert.user_id == target_id).count() == 0


def test_toggle_user_status_resolves_alerts(client, db_session):
    # 1. Create an admin user
    admin_pass = "admin123"
    admin = User(
        email="admin_toggle@gmail.com",
        hashed_password=get_password_hash(admin_pass),
        full_name="Admin Toggle User",
        role=UserRole.ADMIN,
        is_email_verified=True,
        is_active=True,
    )
    db_session.add(admin)

    # 2. Create a target user
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

    # 3. Create pending alerts
    alert1 = Alert(user_id=target_id, message="Alert 1", is_resolved=False)
    alert2 = Alert(user_id=target_id, message="Alert 2", is_resolved=False)
    db_session.add(alert1)
    db_session.add(alert2)
    db_session.commit()

    # 4. Login as admin
    login_data = {"username": "admin_toggle@gmail.com", "password": admin_pass}
    r = client.post("/api/v1/auth/login", data=login_data)
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 5. Toggle status (Deactivate)
    r = client.patch(f"/api/v1/users/{target_id}/status", headers=headers)
    assert r.status_code == 200
    assert r.json()["is_active"] is False

    # 6. Verify alerts are resolved
    db_session.expire_all()
    alerts = db_session.query(Alert).filter(Alert.user_id == target_id).all()
    assert len(alerts) == 2
    for a in alerts:
        assert a.is_resolved is True
        assert a.resolved_at is not None

    # 7. Toggle status back (Activate)
    r = client.patch(f"/api/v1/users/{target_id}/status", headers=headers)
    assert r.status_code == 200
    assert r.json()["is_active"] is True

    db_session.expire_all()
    alerts = db_session.query(Alert).filter(Alert.user_id == target_id).all()
    for a in alerts:
        assert a.is_resolved is True  # Should remain resolved
