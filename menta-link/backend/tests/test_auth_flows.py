from app.models.tokens import EmailVerificationToken, PasswordResetToken
from app.models.user import User
from app.services.auth_service import auth_service

def prueba_registro_crea_token_verificacion(client, db_session):
    payload = {
        "full_name": "Test Student",
        "email": "student@unifranz.edu.bo",
        "password": "Password123",
        "role": "student",
    }
    response = client.post("/api/v1/users/", json=payload)
    assert response.status_code == 201

    user = db_session.query(User).filter(User.email == "student@unifranz.edu.bo").first()
    assert user is not None
    assert user.is_email_verified is False

    token_entry = db_session.query(EmailVerificationToken).filter(EmailVerificationToken.user_id == user.id).first()
    assert token_entry is not None
    assert token_entry.used_at is None

def prueba_flujo_verificacion_email(client, db_session):
    user = User(
        email="verify@gmail.com",
        hashed_password="hashed",
        full_name="Verify",
        is_email_verified=False,
    )
    db_session.add(user)
    db_session.commit()

    token_str = auth_service.create_verification_token(db_session, user)

    response = client.post(f"/api/v1/auth/verify-email?token={token_str}")
    assert response.status_code == 200
    assert response.json()["msg"] == "Email verified successfully"

    db_session.refresh(user)
    assert user.is_email_verified is True

    response_retry = client.post(f"/api/v1/auth/verify-email?token={token_str}")
    assert response_retry.status_code == 400

def prueba_flujo_recuperacion_contrasena(client, db_session):
    from app.core.security import verify_password
    user = User(email="forgot@gmail.com", hashed_password="oldhash", full_name="Forgot")
    db_session.add(user)
    db_session.commit()

    response = client.post("/api/v1/auth/recover-password", json={"email": "forgot@gmail.com"})
    assert response.status_code == 200

    token_entry = db_session.query(PasswordResetToken).filter(PasswordResetToken.user_id == user.id).first()
    assert token_entry is not None

    raw_token = auth_service._generate_token()
    hashed = auth_service._hash_token(raw_token)
    token_entry.token_hash = hashed
    db_session.commit()

    new_pass = "NewPassword123"
    response_reset = client.post(
        "/api/v1/auth/reset-password",
        json={"token": raw_token, "new_password": new_pass},
    )
    assert response_reset.status_code == 200

    db_session.refresh(user)
    assert verify_password(new_pass, user.hashed_password)

    response_retry = client.post(
        "/api/v1/auth/reset-password",
        json={"token": raw_token, "new_password": "OtherPassword"},
    )
    assert response_retry.status_code == 400
