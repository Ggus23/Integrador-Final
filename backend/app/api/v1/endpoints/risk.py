from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models, schemas
from app.api import deps

router = APIRouter()


@router.get("/me/summary", response_model=schemas.risk_summary.RiskSummary)
def read_my_risk_summary(
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get the current risk status of the logged-in user.
    """
    summary = (
        db.query(models.risk_summary.RiskSummary)
        .filter(models.risk_summary.RiskSummary.user_id == current_user.id)
        .first()
    )
    if not summary:
        # Default low risk if no data yet
        return {
            "current_risk_level": "Low",
            "prediction_confidence": 1.0,
            "user_id": current_user.id,
            "id": 0,
            "last_updated": "2024-01-01T00:00:00",
        }
    return summary
