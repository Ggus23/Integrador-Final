import pytest
from fastapi.testclient import TestClient

def prueba_creacion_diario_invalido(client: TestClient):
    payload_invalido = {
        "experience": "", 
        "mood_score": 999
    }
    response = client.post("/api/v1/diary/", json=payload_invalido)
    assert response.status_code in [401, 422]

def prueba_seguridad_historial_diario(client: TestClient):
    response = client.get("/api/v1/diary/me")
    assert response.status_code == 401
    
def prueba_seguridad_diario_hoy(client: TestClient):
    response = client.get("/api/v1/diary/today")
    assert response.status_code == 401

def prueba_actualizacion_diario_inexistente(client: TestClient):
    datos_actualizacion = {
        "experience": "Actualización de prueba"
    }
    response = client.patch("/api/v1/diary/99999", json=datos_actualizacion)
    assert response.status_code in [401, 404]
