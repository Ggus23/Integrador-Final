
import pytest
from app.models.user import UserRole
from app.services.auth_service import auth_service
from app.core.security import get_password_hash

def test_create_psychologist_by_admin(client, db_session):
    # 1. Create Admim
    admin_data = {
        "email": "admin_maker@gmail.com",
        "hashed_password": get_password_hash("AdminPass123"),
        "full_name": "Admin Maker",
        "role": UserRole.ADMIN,
        "is_active": True,
        "is_email_verified": True
    }
    from app.models.user import User
    admin = User(**admin_data)
    db_session.add(admin)
    db_session.commit()
    
    # Login
    login_res = client.post("/api/v1/auth/login", data={"username": admin_data["email"], "password": "AdminPass123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Create Psychologist via Internal Endpoint
    psy_payload = {
        "full_name": "Dr. Psych",
        "email": "psych@gmail.com",
        "password": "Password123", # Meets requirements
        "role": "psychologist"
    }
    
    r = client.post("/api/v1/users/internal", json=psy_payload, headers=headers)
    assert r.status_code == 201
    data = r.json()
    assert data["role"] == "psychologist"
    assert data["email"] == "psych@gmail.com"
    
    # Verify in DB
    user_db = db_session.query(User).filter(User.email == "psych@gmail.com").first()
    assert user_db is not None
    assert user_db.role == UserRole.PSYCHOLOGIST
    assert user_db.is_active is True
    assert user_db.is_email_verified is True

def test_public_registration_blocks_psychologist(client):
    # Try to register as psychologist publicly
    payload = {
        "full_name": "Hacker",
        "email": "hacker@gmail.com",
        "password": "Password123",
        "role": "psychologist"
    }
    r = client.post("/api/v1/users/", json=payload)
    assert r.status_code == 422
    assert "Solo se permite el registro de estudiantes" in r.text
