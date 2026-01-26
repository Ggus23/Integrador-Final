from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.api import deps
from app.services.audit_service import log_access

router = APIRouter()


@router.get("/", response_model=List[schemas.student.StudentSummary])
def read_students(
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_staff_user),
) -> Any:
    """
    Retrieve all students with their summary risk status.
    Accessible by: Admin, Psychologist.
    """
    # Get all student users
    students = (
        db.query(models.user.User)
        .filter(models.user.User.role == models.user.UserRole.STUDENT)
        .all()
    )

    summaries = []
    for student in students:
        # Get Risk Summary
        risk_summary = (
            db.query(models.RiskSummary)
            .filter(models.RiskSummary.user_id == student.id)
            .first()
        )

        # Get Active Alerts Count
        active_alerts = (
            db.query(models.Alert)
            .filter(
                models.Alert.user_id == student.id,
                models.Alert.is_resolved == False,  # noqa: E712
            )
            .count()
        )

        # Get Last Assessment
        last_assessment = (
            db.query(models.AssessmentResponse)
            .filter(models.AssessmentResponse.user_id == student.id)
            .order_by(models.AssessmentResponse.created_at.desc())
            .first()
        )

        summaries.append(
            {
                "id": student.id,
                "email": student.email,
                "full_name": student.full_name,
                "role": student.role,
                "risk_level": (
                    risk_summary.current_risk_level if risk_summary else "Low"
                ),
                "active_alerts": active_alerts,
                "last_assessment_date": (
                    last_assessment.created_at if last_assessment else None
                ),
            }
        )

    return summaries


@router.get("/{student_id}", response_model=schemas.student.StudentSummary)
def read_student_detail(
    student_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_staff_user),
) -> Any:
    """
    Get details for a specific student.
    """
    student = (
        db.query(models.user.User)
        .filter(
            models.user.User.id == student_id,
            models.user.User.role == models.user.UserRole.STUDENT,
        )
        .first()
    )

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Audit Log
    log_access(
        db=db,
        actor_id=current_user.id,
        action="VIEW_STUDENT_PROFILE",
        resource_id=str(student_id),
        details=f"Viewed profile of {student.email}",
    )

    risk_summary = (
        db.query(models.RiskSummary)
        .filter(models.RiskSummary.user_id == student.id)
        .first()
    )

    active_alerts = (
        db.query(models.Alert)
        .filter(
            models.Alert.user_id == student.id,
            models.Alert.is_resolved == False,  # noqa: E712
        )
        .count()
    )

    last_assessment = (
        db.query(models.AssessmentResponse)
        .filter(models.AssessmentResponse.user_id == student.id)
        .order_by(models.AssessmentResponse.created_at.desc())
        .first()
    )

    return {
        "id": student.id,
        "email": student.email,
        "full_name": student.full_name,
        "role": student.role,
        "risk_level": risk_summary.current_risk_level if risk_summary else "Low",
        "active_alerts": active_alerts,
        "last_assessment_date": last_assessment.created_at if last_assessment else None,
    }
