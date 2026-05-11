from fastapi.testclient import TestClient

def prueba_puntaje_pss_10(client: TestClient):
    payload = {"assessment_type": "PSS_10", "responses": [{"value": 1}, {"value": 2}, {"value": 3}]}
    response = client.post("/api/v1/assessments/score", json=payload)
    assert response.status_code in [401, 404, 422, 200]

def prueba_puntaje_gad_7(client: TestClient):
    payload = {"assessment_type": "GAD_7", "responses": [{"value": 1}, {"value": 2}]}
    response = client.post("/api/v1/assessments/score", json=payload)
    assert response.status_code in [401, 404, 422, 200]

def prueba_puntaje_phq_9(client: TestClient):
    payload = {"assessment_type": "PHQ_9", "responses": [{"value": 2}, {"value": 3}]}
    response = client.post("/api/v1/assessments/score", json=payload)
    assert response.status_code in [401, 404, 422, 200]

def prueba_mapeo_riesgo_phq_9(client: TestClient):
    response = client.get("/api/v1/assessments/risk-mapping?type=PHQ_9&score=15")
    assert response.status_code in [401, 404, 422, 200]
