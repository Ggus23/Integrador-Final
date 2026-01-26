from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.api import deps
from app.services.assessment_service import assessment_service

router = APIRouter()


@router.get("/", response_model=List[schemas.assessment.Assessment])
def read_assessments(
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get the list of available psychometric assessments (PSS-10, DASS-21, etc.)
    """
    return db.query(models.assessment.Assessment).all()


@router.get("/{key}", response_model=schemas.assessment.Assessment)
def read_assessment_by_key(
    key: str,
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get a specific assessment by its type key (e.g. 'PSS-10').
    """
    assessment = (
        db.query(models.assessment.Assessment)
        .filter(models.assessment.Assessment.type == key)
        .first()
    )
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return assessment


@router.post(
    "/responses", response_model=schemas.assessment_response.AssessmentResponse
)
def submit_assessment_response(
    *,
    db: Session = Depends(deps.get_db),
    response_in: schemas.assessment_response.AssessmentResponseCreate,
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Submit answers for an assessment.
    Triggers automatic scoring and risk level calculation.
    """
    response = assessment_service.process_response(db, current_user.id, response_in)
    if not response:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return response


@router.get(
    "/responses/me", response_model=List[schemas.assessment_response.AssessmentResponse]
)
def read_my_responses(
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get history of assessments completed by the current user.
    """
    return (
        db.query(models.assessment_response.AssessmentResponse)
        .filter(
            models.assessment_response.AssessmentResponse.user_id == current_user.id
        )
        .all()
    )
