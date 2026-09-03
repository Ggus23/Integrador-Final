from app.core.security import get_password_hash
from app.models.user import User, UserRole


def prueba_creacion_psicologo_por_admin(client, db_session):
    admin_data = {
        "email": "admin_maker@gmail.com",
        "hashed_password": get_password_hash("AdminPass123"),
        "full_name": "Admin Maker",
        "role": UserRole.ADMIN,
        "is_active": True,
        "is_email_verified": True,
    }

    admin = User(**admin_data)
    db_session.add(admin)
    db_session.commit()

    login_res = client.post(
        "/api/v1/auth/login",
        data={"username": admin_data["email"], "password": "AdminPass123"},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    psy_payload = {
        "full_name": "Dr. Psych",
        "email": "psych@gmail.com",
        "password": "Password123",
        "role": "psychologist",
    }

    response = client.post("/api/v1/users/internal", json=psy_payload, headers=headers)
    assert response.status_code == 201

    data = response.json()
    assert data["role"] == "psychologist"
    assert data["email"] == "psych@gmail.com"

    user_db = db_session.query(User).filter(User.email == "psych@gmail.com").first()
    assert user_db is not None
    assert user_db.role == UserRole.PSYCHOLOGIST
    assert user_db.is_active is True
    assert user_db.is_email_verified is True


def prueba_registro_publico_bloquea_psicologo(client):
    payload = {
        "full_name": "Hacker",
        "email": "hacker@gmail.com",
        "password": "Password123",
        "role": "psychologist",
    }
    response = client.post("/api/v1/users/", json=payload)
    assert response.status_code == 422
    assert "Solo se permite el registro de estudiantes" in response.text
