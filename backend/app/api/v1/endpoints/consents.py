from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.api import deps

router = APIRouter()


@router.get("/me", response_model=schemas.consent.Consent)
def read_my_consent(
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Check if the current user has already accepted the informed consent.
    """
    consent = (
        db.query(models.consent.Consent)
        .filter(models.consent.Consent.user_id == current_user.id)
        .first()
    )
    if not consent:
        raise HTTPException(status_code=404, detail="Consent not found for this user")
    return consent


@router.post("/", response_model=schemas.consent.Consent)
def accept_consent(
    *,
    db: Session = Depends(deps.get_db),
    consent_in: schemas.consent.ConsentCreate,
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Accept the informed consent. This is a prerequisite for using other
    platform features.
    """
    db_consent = (
        db.query(models.consent.Consent)
        .filter(models.consent.Consent.user_id == current_user.id)
        .first()
    )
    if db_consent:
        db_consent.has_accepted = consent_in.has_accepted
        db_consent.version = consent_in.version
    else:
        db_consent = models.consent.Consent(
            user_id=current_user.id,
            has_accepted=consent_in.has_accepted,
            version=consent_in.version,
        )
        db.add(db_consent)

    db.commit()
    db.refresh(db_consent)
    return db_consent
