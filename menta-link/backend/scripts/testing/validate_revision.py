import sys
import os

# Ensure we can import the app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.risk_service import risk_service
from app.core.constants import RiskLevel

def test_dropout_correlation():
    print("\n--- Test de Correlación ---")
    
    # 1. Caso: Score Emocional Alto (9) + Materias Reprobadas (3) -> High Risk
    # (High risk in MentaLink usually means the condition is met)
    risk = risk_service.calculate_dropout_risk(
        emotional_risk_score=9,
        failed_classes=3,
        gpa_drop=False
    )
    print(f"Estudiante con Emoción Crítica y 3 reprobadas: Risk={risk}")
    assert risk is True, "Debería ser High Risk"

    # 2. Caso: Score Emocional Normal (4) + Materias Reprobadas (0) -> Low Risk
    risk = risk_service.calculate_dropout_risk(
        emotional_risk_score=4,
        failed_classes=0,
        gpa_drop=False
    )
    print(f"Estudiante estable emocional y académicamente: Risk={risk}")
    assert risk is False, "Debería ser Low Risk"

    # 3. Caso: Score Emocional Alto (9) + Gpa Drop -> High Risk
    risk = risk_service.calculate_dropout_risk(
        emotional_risk_score=9,
        failed_classes=0,
        gpa_drop=True
    )
    print(f"Estudiante con Emoción Crítica y descenso de GPA: Risk={risk}")
    assert risk is True, "Debería ser High Risk"

    print("✅ Test de Correlación: PASÓ")

if __name__ == "__main__":
    test_dropout_correlation()
