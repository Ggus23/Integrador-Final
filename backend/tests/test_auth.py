from app.core.security import get_password_hash
from app.models.user import User


def test_login_access_token(client, db_session):
    """
    Test that we can login with a test user.
    """
    email = "test@gmail.com"
    password = "password123"

    # Create user manually in the test session
    user = User(
        email=email,
        hashed_password=get_password_hash(password),
        full_name="Test User",
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()

    login_data = {"username": email, "password": password}
    r = client.post("/api/v1/auth/login", data=login_data)

    assert r.status_code == 200
    tokens = r.json()
    assert "access_token" in tokens
    assert tokens["token_type"] == "bearer"


def test_login_incorrect_password(client, db_session):
    email = "test2@gmail.com"
    user = User(
        email=email,
        hashed_password=get_password_hash("realpass"),
        full_name="Test User 2",
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()

    login_data = {"username": email, "password": "wrongpassword"}
    r = client.post("/api/v1/auth/login", data=login_data)
    assert r.status_code == 401
