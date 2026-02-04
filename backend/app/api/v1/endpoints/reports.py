from datetime import datetime
from typing import Any, Dict

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app import models
from app.api import deps

router = APIRouter()


@router.get("/aggregated", response_model=Dict[str, Any])
def get_institutional_report(
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_staff_user),
) -> Any:

    total_students = (
        db.query(models.user.User)
        .filter(models.user.User.role == models.user.UserRole.STUDENT)
        .count()
    )

    risk_stats = (
        db.query(
            models.RiskSummary.current_risk_level, func.count(models.RiskSummary.id)
        )
        .group_by(models.RiskSummary.current_risk_level)
        .all()
    )

    risk_dist = {level: count for level, count in risk_stats}

    avg_mood = db.query(func.avg(models.EmotionalCheckin.mood_score)).scalar() or 0.0

    return {
        "total_population": total_students,
        "risk_distribution": risk_dist,
        "average_mood_score": round(float(avg_mood), 2),
        "generated_at": datetime.utcnow(),
    }
