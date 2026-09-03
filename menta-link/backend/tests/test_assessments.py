from fastapi.testclient import TestClient

from app.core.constants import RiskLevel
from app.services import assessment_service, scoring_service


def prueba_seguridad_listar_cuestionarios(client: TestClient):
    response = client.get("/api/v1/assessments/")
    assert response.status_code == 401


def prueba_seguridad_historial_respuestas(client: TestClient):
    response = client.get("/api/v1/assessments/responses/me")
    assert response.status_code == 401


def prueba_puntaje_dass_21(client: TestClient):
    # DASS-21 se calcula por duplicado (x2) segun scoring_service
    responses = [{"value": 1}, {"value": 2}, {"value": 3}]
    total = scoring_service.scoring_service.calculate_score("DASS-21", responses)
    # (1 + 2 + 3) * 2 = 12
    assert total == 12


def prueba_puntaje_pss_10_con_inversion():
    # PSS-10 invierte los items q4, q5, q7, q8 (valor 4 - valor)
    answers = {"q1": 3, "q4": 3, "q5": 3}
    score = assessment_service.assessment_service.calculate_score("PSS-10", answers)
    # q1=3 + q4(4-3=1) + q5(4-3=1) = 5
    assert score == 5.0


def prueba_mapeo_riesgo_pss_10():
    assert (
        assessment_service.assessment_service.get_risk_level("PSS-10", 10)
        == RiskLevel.LOW
    )
    assert (
        assessment_service.assessment_service.get_risk_level("PSS-10", 20)
        == RiskLevel.MEDIUM
    )
    assert (
        assessment_service.assessment_service.get_risk_level("PSS-10", 30)
        == RiskLevel.HIGH
    )


def prueba_mapeo_riesgo_gad_7():
    assert (
        assessment_service.assessment_service.get_risk_level("GAD-7", 5)
        == RiskLevel.LOW
    )
    assert (
        assessment_service.assessment_service.get_risk_level("GAD-7", 30)
        == RiskLevel.HIGH
    )


def prueba_mapeo_riesgo_phq_9():
    assert (
        assessment_service.assessment_service.get_risk_level("PHQ-9", 8)
        == RiskLevel.LOW
    )
    assert (
        assessment_service.assessment_service.get_risk_level("PHQ-9", 25)
        == RiskLevel.HIGH
    )


def prueba_scoring_service_suma_simple():
    responses = [{"value": 1}, {"value": 2}, {"value": 3}]
    total = scoring_service.scoring_service.calculate_score("PSS-10", responses)
    assert total == 6
