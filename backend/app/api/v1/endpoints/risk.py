from datetime import datetime
from typing import Any

from app import models, schemas
from app.api import deps
from app.core.constants import RiskLevel
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/me/summary", response_model=schemas.risk_summary.RiskSummary)
def read_my_risk_summary(
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Retorna el resumen de riesgo del usuario autenicado.
    Muestra el nivel actual, la confianza de la predicción y la última actualización.
    """

    # Busca el resumen de riesgo en la DB
    summary = (
        db.query(models.risk_summary.RiskSummary)
        .filter(models.risk_summary.RiskSummary.user_id == current_user.id)
        .first()
    )

    # Si no existe, retorna un resumen con valores por defecto
    if not summary:
        return {
            "current_risk_level": RiskLevel.LOW.value,
            "prediction_confidence": 1.0,
            "dropout_probability": 0.0,
            "dropout_risk": RiskLevel.LOW.value,
            "user_id": current_user.id,
            "id": 0,
            "last_updated": datetime.now(),
        }
    return summary
