import pytest
from fastapi.testclient import TestClient
from app.models.user import User

def prueba_carga_masiva_estudiantes(client: TestClient):
    payload = [
        {
            "email": "correo-invalido",
            "gpa": 999.0,
            "failed_classes": "muchas"
        }
    ]
    response = client.post("/api/v1/students/bulk", json=payload)
    assert response.status_code in [401, 422]

def prueba_seguridad_resumen_riesgo(client: TestClient):
    response = client.get("/api/v1/risk/me/summary")
    assert response.status_code == 401

def prueba_acceso_resumen_riesgo(client: TestClient, db_session):
    user = User(
        email="prueba@estudiante.com",
        hashed_password="hashed",
        full_name="Estudiante Prueba",
        role="student",
        is_active=True
    )
    db_session.add(user)
    db_session.commit()

    response = client.get("/api/v1/risk/me/summary")
    assert response.status_code == 401
