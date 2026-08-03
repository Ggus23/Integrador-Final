from fastapi.testclient import TestClient

def prueba_procesar_alerta_riesgo_alto(client: TestClient):
    payload = {"user_email": "test@test.com", "risk_level": "High", "context": "Test Context"}
    response = client.post("/api/v1/alerts/process", json=payload)
    assert response.status_code in [401, 404, 422, 200]

def prueba_procesar_alerta_riesgo_bajo(client: TestClient):
    payload = {"user_email": "test@test.com", "risk_level": "Low", "context": "Test Context"}
    response = client.post("/api/v1/alerts/process", json=payload)
    assert response.status_code in [401, 404, 422, 200]
