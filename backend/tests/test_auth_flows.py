from app.models.tokens import EmailVerificationToken, PasswordResetToken
from app.models.user import User
from app.services.auth_service import auth_service


def test_registration_creates_verification_token(client, db_session):
    # Register
    payload = {
        "full_name": "Test Student",
        "email": "student@gmail.com",
        "password": "Password123",
        "role": "student",
    }
    r = client.post("/api/v1/users/", json=payload)
    assert r.status_code == 201

    # Check DB for User
    user = db_session.query(User).filter(User.email == "student@gmail.com").first()
    assert user is not None
    assert user.is_email_verified is False

    # Check DB for Token
    token_entry = (
        db_session.query(EmailVerificationToken)
        .filter(EmailVerificationToken.user_id == user.id)
        .first()
    )
    assert token_entry is not None
    assert token_entry.used_at is None


def test_verify_email_flow(client, db_session):
    # 1. Create User & Token manually to skip registration overhead in this test unit
    user = User(
        email="verify@gmail.com",
        hashed_password="hashed",
        full_name="Verify",
        is_email_verified=False,
    )
    db_session.add(user)
    db_session.commit()

    # Create valid token via service
    token_str = auth_service.create_verification_token(db_session, user)

    # 2. Verify with valid token
    r = client.post(f"/api/v1/auth/verify-email?token={token_str}")
    assert r.status_code == 200
    assert r.json()["msg"] == "Email verified successfully"

    # Check User Updated
    db_session.refresh(user)
    assert user.is_email_verified is True

    # 3. Verify Idempotency / Re-use (Should fail or return success?
    # Prompt says "one-time use")
    # Implementation marks strict one-time.
    r = client.post(f"/api/v1/auth/verify-email?token={token_str}")
    assert r.status_code == 400


def test_password_recovery_flow(client, db_session):
    # 1. Register
    user = User(email="forgot@gmail.com", hashed_password="oldhash", full_name="Forgot")
    db_session.add(user)
    db_session.commit()

    # 2. Request Forgot
    r = client.post("/api/v1/auth/recover-password", json={"email": "forgot@gmail.com"})
    assert r.status_code == 200

    # Check Token Created
    token_entry = (
        db_session.query(PasswordResetToken)
        .filter(PasswordResetToken.user_id == user.id)
        .first()
    )
    assert token_entry is not None

    # We can't easily get the raw token string since it's hashed in DB.
    # But for Integration Test, we can mock the Service or use the Service
    # method to verify logic.
    # Alternatively, we create the token manually to test the RESET endpoint.

    raw_token = auth_service._generate_token()
    hashed = auth_service._hash_token(raw_token)
    token_entry.token_hash = hashed
    db_session.commit()

    # 3. Reset Password
    new_pass = "NewPassword123"
    r = client.post(
        "/api/v1/auth/reset-password",
        json={"token": raw_token, "new_password": new_pass},
    )
    assert r.status_code == 200

    # Verify Login with new password (mock check)
    from app.core.security import verify_password

    db_session.refresh(user)
    assert verify_password(new_pass, user.hashed_password)

    # 4. Try to reuse token
    r = client.post(
        "/api/v1/auth/reset-password",
        json={"token": raw_token, "new_password": "OtherPassword"},
    )
    assert r.status_code == 400
