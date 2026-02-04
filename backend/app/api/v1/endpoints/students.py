from typing import Any, List

from app import models, schemas
from app.api import deps
from app.ml.risk_classifier import risk_classifier
from app.services.audit_service import log_access
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/", response_model=List[schemas.student.StudentSummary])
def read_students(
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_staff_user),
) -> Any:

    students = (
        db.query(models.user.User)
        .filter(models.user.User.role == models.user.UserRole.STUDENT)
        .all()
    )

    summaries = []
    for student in students:

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


@router.get("/{student_id}", response_model=schemas.student.StudentDetail)
def read_student_detail(
    student_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_staff_user),
) -> Any:

    student = (
        db.query(models.user.User)
        .filter(
            models.user.User.id == student_id,
            models.user.User.role == models.user.UserRole.STUDENT,
        )
        .first()
    )

    if not student:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")

    log_access(
        db=db,
        actor_id=current_user.id,
        action="VIEW_STUDENT_PROFILE",
        resource_id=str(student_id),
        details=f"Viewed full profile of {student.email}",
    )

    risk_summary = (
        db.query(models.RiskSummary)
        .filter(models.RiskSummary.user_id == student.id)
        .first()
    )

    alerts = (
        db.query(models.Alert)
        .filter(models.Alert.user_id == student.id)
        .order_by(models.Alert.created_at.desc())
        .all()
    )

    active_alerts_count = sum(1 for a in alerts if not a.is_resolved)

    responses = (
        db.query(models.AssessmentResponse)
        .filter(models.AssessmentResponse.user_id == student.id)
        .order_by(models.AssessmentResponse.created_at.desc())
        .all()
    )

    checkins = (
        db.query(models.EmotionalCheckin)
        .filter(models.EmotionalCheckin.user_id == student.id)
        .order_by(models.EmotionalCheckin.created_at.desc())
        .limit(20)
        .all()
    )

    return {
        "id": student.id,
        "email": student.email,
        "full_name": student.full_name,
        "role": student.role,
        "risk_level": risk_summary.current_risk_level if risk_summary else "Low",
        "active_alerts": active_alerts_count,
        "last_assessment_date": responses[0].created_at if responses else None,
        "risk_summary": risk_summary,
        "alerts": alerts,
        "assessment_responses": responses,
        "recent_checkins": checkins,
        "risk_factors": risk_classifier.get_feature_importance(),
    }


@router.put("/{student_id}", response_model=schemas.student.StudentSummary)
def update_student(
    student_id: int,
    student_in: schemas.user.UserUpdate,
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_admin_user),
) -> Any:

    student = (
        db.query(models.user.User)
        .filter(
            models.user.User.id == student_id,
            models.user.User.role == models.user.UserRole.STUDENT,
        )
        .first()
    )

    if not student:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")

    if student_in.full_name is not None:
        student.full_name = student_in.full_name
    if student_in.email is not None:
        student.email = student_in.email

    db.add(student)
    db.commit()
    db.refresh(student)
    return student
