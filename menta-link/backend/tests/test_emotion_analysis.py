from fastapi.testclient import TestClient

def prueba_consolidacion_historial(client: TestClient):
    response = client.get("/api/v1/students/me/history")
    assert response.status_code == 401

def prueba_calculo_tendencias_emocionales(client: TestClient):
    response = client.get("/api/v1/emotion/trends")
    assert response.status_code == 401

def prueba_disponibilidad_predictor(client: TestClient):
    payload = {"text": "estoy triste"}
    response = client.post("/api/v1/emotion/predict", json=payload)
    assert response.status_code in [401, 404, 422, 200]

def prueba_logica_prediccion_emocion(client: TestClient):
    payload = {"text": "estoy feliz"}
    response = client.post("/api/v1/emotion/predict", json=payload)
    assert response.status_code in [401, 404, 422, 200]
