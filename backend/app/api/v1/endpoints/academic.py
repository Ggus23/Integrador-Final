from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.api import deps

router = APIRouter()


@router.get("/me", response_model=schemas.academic_profile.AcademicProfile)
def read_academic_profile_me(
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get the academic profile of the current user.
    """
    profile = (
        db.query(models.AcademicProfile)
        .filter(models.AcademicProfile.user_id == current_user.id)
        .first()
    )
    if not profile:
        # Create an empty profile if it doesn't exist
        profile = models.AcademicProfile(
            user_id=current_user.id,
            hito2_procesual=0.0,
            hito2_nota=0.0,
            hito3_procesual=0.0,
            hito3_nota=0.0,
            hito4_procesual=0.0,
            hito4_nota=0.0,
            hito5_procesual=0.0,
            hito5_nota=0.0,
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.put("/me", response_model=schemas.academic_profile.AcademicProfile)
def update_academic_profile_me(
    profile_in: schemas.academic_profile.AcademicProfileUpdate,
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Update the academic profile of the current user.
    """
    profile = (
        db.query(models.AcademicProfile)
        .filter(models.AcademicProfile.user_id == current_user.id)
        .first()
    )
    if not profile:
        profile = models.AcademicProfile(user_id=current_user.id)
        db.add(profile)

    # Update fields
    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.get("/{student_id}", response_model=schemas.academic_profile.AcademicProfile)
def read_academic_profile(
    student_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_staff_user),
) -> Any:
    """
    Get the academic profile of a specific student (Staff only).
    """
    profile = (
        db.query(models.AcademicProfile)
        .filter(models.AcademicProfile.user_id == student_id)
        .first()
    )
    if not profile:
        raise HTTPException(status_code=404, detail="Perfil académico no encontrado")
    return profile
