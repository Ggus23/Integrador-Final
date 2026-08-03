from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.api import deps
from app.core.logging import log_security_event

router = APIRouter()


@router.get("/me", response_model=List[schemas.emotional_checkin.EmotionalCheckin])
def read_my_checkins(
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Este def retorna todos los checkins (emociones) del usuario autenticado
    en caso de no estar autenticado retorna un error 401
    """
    return (
        db.query(models.emotional_checkin.EmotionalCheckin)
        .filter(models.emotional_checkin.EmotionalCheckin.user_id == current_user.id)
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.post("/", response_model=schemas.emotional_checkin.EmotionalCheckin)
def create_checkin(
    *,
    db: Session = Depends(deps.get_db),
    checkin_in: schemas.emotional_checkin.EmotionalCheckinCreate,
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Este def primero verifica que el usuario esté autenticado.
    Recibe los datos con el estado de ánimo, obtiene el id del usuario
    con el current_user para crear el checkin (mood, notes).
    Add (prepara), Commit (guarda) y luego se refrescan los datos
    para obtener el id del checkin creado.
    Retorna el checkin creado.
    """
    db_obj = models.emotional_checkin.EmotionalCheckin(
        **checkin_in.model_dump(), user_id=current_user.id
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


@router.get("/{checkin_id}", response_model=schemas.emotional_checkin.EmotionalCheckin)
def read_checkin(
    checkin_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Este def retorna un checkin (emoción) por su id.
    Busca el checkin por id; si no existe, retorna error 404.
    Verifica que el usuario autenticado sea el dueño del checkin.
    Si el usuario es Admin, puede acceder a cualquier checkin.
    Si no tiene permisos, retorna error 403.
    """
    checkin = (
        db.query(models.emotional_checkin.EmotionalCheckin)
        .filter(models.emotional_checkin.EmotionalCheckin.id == checkin_id)
        .first()
    )

    if not checkin:
        raise HTTPException(
            status_code=404, detail="Registro de bienestar no encontrado"
        )

    if (
        checkin.user_id != current_user.id
        and current_user.role != models.user.UserRole.ADMIN
    ):
        log_security_event(
            "UNAUTHORIZED_ACCESS",
            f"User {current_user.id} tried to access check-in {checkin_id} "
            f"belonging to user {checkin.user_id}",
        )
        raise HTTPException(status_code=403, detail="No tiene permisos suficientes")

    return checkin
