from typing import Any, List

from app import models, schemas
from app.api import deps
from app.core.security import get_password_hash
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

router = APIRouter()


@router.post("/", response_model=schemas.user.User, status_code=status.HTTP_201_CREATED)
def create_user(
    *, db: Session = Depends(deps.get_db), user_in: schemas.user.UserCreate
) -> Any:

    user = (
        db.query(models.user.User)
        .filter(models.user.User.email == user_in.email)
        .first()
    )
    if user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un usuario con este correo electrónico en el sistema.",
        )

    db_obj = models.user.User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)

    from app.services.auth_service import auth_service

    auth_service.create_verification_token(db, db_obj)

    return db_obj


@router.post(
    "/internal", response_model=schemas.user.User, status_code=status.HTTP_201_CREATED
)
def create_user_by_admin(
    *,
    db: Session = Depends(deps.get_db),
    user_in: schemas.user.UserCreateAdmin,
    current_user: models.user.User = Depends(deps.get_admin_user),
) -> Any:

    user = (
        db.query(models.user.User)
        .filter(models.user.User.email == user_in.email)
        .first()
    )
    if user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un usuario con este correo electrónico en el sistema.",
        )

    db_obj = models.user.User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role,
        is_active=True,
        is_email_verified=True,
        must_change_password=True,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)

    return db_obj


@router.get("/me", response_model=schemas.user.User)
def read_user_me(
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:

    return current_user


@router.put("/me", response_model=schemas.user.User)
def update_user_me(
    *,
    db: Session = Depends(deps.get_db),
    user_in: schemas.user.UserUpdate,
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:

    if user_in.full_name:
        current_user.full_name = user_in.full_name

    if user_in.password:
        current_user.hashed_password = get_password_hash(user_in.password)

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/", response_model=List[schemas.user.User])
def read_users(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.user.User = Depends(deps.get_admin_user),
) -> Any:

    users = db.query(models.user.User).offset(skip).limit(limit).all()
    return users


@router.get("/psychologist-only", response_model=str)
def psychologist_feature(
    current_user: models.user.User = Depends(deps.get_psychologist_user),
) -> Any:

    return (
        f"Bienvenido, {current_user.full_name}. Tienes privilegios de Psicólogo/Admin."
    )


@router.patch("/{user_id}/role", response_model=schemas.user.User)
def update_user_role(
    user_id: int,
    role: models.user.UserRole,
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_admin_user),
) -> Any:

    user = db.query(models.user.User).filter(models.user.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    user.role = role
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.patch("/{user_id}/status", response_model=schemas.user.User)
def toggle_user_status(
    user_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_admin_user),
) -> Any:

    user = db.query(models.user.User).filter(models.user.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    user.is_active = not user.is_active

    if not user.is_active:
        from datetime import datetime, timezone

        pending_alerts = (
            db.query(models.Alert)
            .filter(
                models.Alert.user_id == user.id,
                models.Alert.is_resolved == False,  # noqa: E712
            )
            .all()
        )
        for alert in pending_alerts:
            alert.is_resolved = True
            alert.resolved_at = datetime.now(timezone.utc)

    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_admin_user),
):

    user = db.query(models.user.User).filter(models.user.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if user.id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="No puedes eliminar tu propia cuenta de administrador",
        )

    db.delete(user)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
