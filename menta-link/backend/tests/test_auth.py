from app.core.security import get_password_hash
from app.models.user import User


def prueba_inicio_sesion_token_acceso(client, db_session):
    email = "test@gmail.com"
    password = "password123"

    user = User(
        email=email,
        hashed_password=get_password_hash(password),
        full_name="Usuario Prueba",
        is_active=True,
        is_email_verified=True,
    )
    db_session.add(user)
    db_session.commit()

    login_data = {"username": email, "password": password}
    response = client.post("/api/v1/auth/login", data=login_data)

    assert response.status_code == 200
    tokens = response.json()
    assert "access_token" in tokens


def prueba_login_bloqueado_email_no_verificado(client, db_session):
    email = "sinverificar@gmail.com"
    user = User(
        email=email,
        hashed_password=get_password_hash("password123"),
        full_name="Sin Verificar",
        is_active=True,
        is_email_verified=False,
    )
    db_session.add(user)
    db_session.commit()

    response = client.post(
        "/api/v1/auth/login", data={"username": email, "password": "password123"}
    )
    assert response.status_code == 400
    assert "verificar" in response.json()["detail"].lower()


def prueba_inicio_sesion_contrasena_incorrecta(client, db_session):
    email = "test2@gmail.com"
    user = User(
        email=email,
        hashed_password=get_password_hash("realpass"),
        full_name="Usuario Prueba 2",
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()

    login_data = {"username": email, "password": "wrongpassword"}
    response = client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 401
