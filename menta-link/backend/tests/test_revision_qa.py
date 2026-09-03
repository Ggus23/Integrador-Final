import pytest
from fastapi.testclient import TestClient
from app.models.user import User


def prueba_registro_estudiante_valida_datos(client: TestClient):
    # El registro de estudiante requiere correo institucional @unifranz.edu.bo
    payload_invalido = {
        "full_name": "Estudiante Inválido",
        "email": "correo-invalido",
        "password": "Password123",
        "role": "student",
    }
    response = client.post("/api/v1/users/", json=payload_invalido)
    assert response.status_code in [401, 400, 409, 422]

    payload_valido = {
        "full_name": "Estudiante Válido",
        "email": "estudiante@unifranz.edu.bo",
        "password": "Password123",
        "role": "student",
    }
    response_ok = client.post("/api/v1/users/", json=payload_valido)
    assert response_ok.status_code == 201


def prueba_seguridad_resumen_riesgo(client: TestClient):
    response = client.get("/api/v1/risk/me/summary")
    assert response.status_code == 401


def prueba_acceso_resumen_riesgo(client: TestClient, db_session):
    user = User(
        email="prueba@estudiante.com",
        hashed_password="hashed",
        full_name="Estudiante Prueba",
        role="student",
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()

    # Sin token de autenticacion el resumen de riesgo sigue denegado (401)
    response = client.get("/api/v1/risk/me/summary")
    assert response.status_code == 401
