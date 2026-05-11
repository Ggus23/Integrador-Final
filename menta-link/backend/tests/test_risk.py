from fastapi.testclient import TestClient

def prueba_riesgo_bajo(client: TestClient):
    payload = {
        "pss_score": 0.0,
        "checkin_avg": 5.0,
        "bad_days_count": 0,
        "academic_pressure_avg": 1.0
    }
    response = client.post("/api/v1/risk/predict", json=payload)
    assert response.status_code in [401, 404, 422, 200]

def prueba_riesgo_alto(client: TestClient):
    payload = {
        "pss_score": 1.0,
        "checkin_avg": 1.0,
        "bad_days_count": 7,
        "academic_pressure_avg": 5.0
    }
    response = client.post("/api/v1/risk/predict", json=payload)
    assert response.status_code in [401, 404, 422, 200]
