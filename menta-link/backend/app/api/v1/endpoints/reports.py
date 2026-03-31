from datetime import datetime
from typing import Any, Dict

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app import models
from app.api import deps
from app.models.audit_log import AuditLog

router = APIRouter()


@router.get("/audit")
def get_audit_report(
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_staff_user),
    skip: int = 0,
    limit: int = 1000,
) -> Any:
    """
    Reporte de Auditoría Completo (A cargo de QA).
    Retorna el historial de todo el registro de accesos en el sistema.
    """
    logs = (
        db.query(AuditLog)
        .order_by(AuditLog.timestamp.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return [
        {
            "id": log.id,
            "actor_id": log.actor_id,
            "action": log.action,
            "resource_id": log.resource_id,
            "details": log.details,
            "timestamp": log.timestamp,
        }
        for log in logs
    ]


@router.get("/aggregated", response_model=Dict[str, Any])
def get_institutional_report(
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_staff_user),
) -> Any:
    """
    Retorna un reporte institucional agregado.
    Incluye total de estudiantes, distribución de riesgo y promedio de ánimo.
    Requiere permisos de Staff (Admin o Psicólogo).
    """

    # Obtiene el total de usuarios con rol de estudiante
    total_students = (
        db.query(models.user.User)
        .filter(models.user.User.role == models.user.UserRole.STUDENT)
        .count()
    )

    # Obtiene estadísticas agrupadas por nivel de riesgo
    risk_stats = (
        db.query(
            models.RiskSummary.current_risk_level, func.count(models.RiskSummary.id)
        )
        .group_by(models.RiskSummary.current_risk_level)
        .all()
    )

    risk_dist = {level: count for level, count in risk_stats}

    # Calcula el promedio global de los puntajes de ánimo
    avg_mood = db.query(func.avg(models.EmotionalCheckin.mood_score)).scalar() or 0.0

    return {
        "total_population": total_students,
        "risk_distribution": risk_dist,
        "average_mood_score": round(float(avg_mood), 2),
        "generated_at": datetime.utcnow(),
    }
