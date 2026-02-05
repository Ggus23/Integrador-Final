from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.api import deps
from app.core.security import get_password_hash

router = APIRouter()


@router.post("/", response_model=schemas.user.User, status_code=status.HTTP_201_CREATED)
def create_user(
    *, db: Session = Depends(deps.get_db), user_in: schemas.user.UserCreate
) -> Any:
    """
    Este endpoint permite que un usuario se registre en el sistema.
    """
    # Busca si el correo ya existe en la base de datos
    # Si existe, lanza un error 409 Conflict
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

    # Crea el usuario, hashea la contraseña y la guarda en la DB
    db_obj = models.user.User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role,
    )

    # Aquí el usuario se guarda físicamente en la tabla users
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)

    # Una vez guardado, el sistema llama al servicio de autenticación
    # Genera un token único al correo del usuario
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
    """
    Este endpoint permite que un administrador cree un usuario en el sistema.
    """
    # Busca si el correo ya existe en la DB
    user = (
        db.query(models.user.User)
        .filter(models.user.User.email == user_in.email)
        .first()
    )
    # Si existe, lanza un error 409 conflict
    if user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un usuario con este correo electrónico en el sistema.",
        )

    # Aquí el admin establece 3 estados de forma manual y directa:
    # is_active: El usuario nace activo
    # is_email_verified: El sistema asume que el correo es válido
    # must_change_password: El admin asigna una contraseña temporal
    # (El usuario deberá cambiarla en el primer inicio de sesión)
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
    """
    Permite obtener la información del usuario actual.
    Es la que usa el frontend para mostrar la información del usuario.
    """
    return current_user


@router.put("/me", response_model=schemas.user.User)
def update_user_me(
    *,
    db: Session = Depends(deps.get_db),
    user_in: schemas.user.UserUpdate,
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Permite la autogestión de los datos del usuario.
    """
    # Si el usuario envía un nombre completo, se actualiza
    if user_in.full_name:
        current_user.full_name = user_in.full_name
    # Si el usuario envía una contraseña, se hashea y se actualiza
    if user_in.password:
        current_user.hashed_password = get_password_hash(user_in.password)

    # Se guarda el usuario en la DB
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
    """
    Permite obtener todos los usuarios del sistema.
    """
    # El skip permite saltar un número de usuarios
    # El limit permite obtener un número de usuarios
    users = db.query(models.user.User).offset(skip).limit(limit).all()
    return users


@router.get("/psychologist-only", response_model=str)
def psychologist_feature(
    current_user: models.user.User = Depends(deps.get_psychologist_user),
) -> Any:
    """
    Valida que el sistema de permisos funcione correctamente.
    """
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
    """
    Gestiona los privilegios de los usuarios.
    """
    # Busca el usuario por id
    user = db.query(models.user.User).filter(models.user.User.id == user_id).first()

    # Si no existe, lanza un error 404
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Actualiza el rol del usuario
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
    """
    Gestiona el estado (activo/inactivo) de los usuarios.
    """
    # Busca el usuario por id, si no existe lanza un error 404
    user = db.query(models.user.User).filter(models.user.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Cambia el estado del usuario
    user.is_active = not user.is_active

    # Si el usuario se desactiva, se marcan como resueltas todas sus alertas pendientes
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

    # Guarda la actualización del usuario en la DB
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
    """
    Se encarga de la eliminación de usuarios.
    """

    user = db.query(models.user.User).filter(models.user.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Esto crea una regla de negocio que impide que el usuario logueado se elimine a sí mismo
    if user.id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="No puedes eliminar tu propia cuenta de administrador",
        )

    # Elimina el usuario de la DB
    db.delete(user)
    db.commit()

    # Este estado le dice al frontend que la petición fue exitosa, por lo cual no tiene nada que mostrar
    return Response(status_code=status.HTTP_204_NO_CONTENT)
