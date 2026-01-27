from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status, Response
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
    Create a new user (Registration).

    Academic Note: This endpoint is accessible without authentication to allow
    new students/staff to join. Registration logic involves:
    - Email domain validation (@gmail.com enforced via schema).
    - Password hashing for security.
    - Check for existing accounts to prevent duplicates (HTTP 409 Conflict).
    """
    # Check if user with this email already exists
    # Academic Note: Returning 409 Conflict is more semantically accurate than 400
    # for resource collisions.
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

    # Create user object, hashing the password
    # Academic Note: Hashing is done using bcrypt via security helper.
    # Managed fields like is_active, created_at, updated_at are handled by the model/DB.
    db_obj = models.user.User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)

    # Generate verification token and send email
    from app.services.auth_service import auth_service

    auth_service.create_verification_token(db, db_obj)
    
    return db_obj


@router.post("/internal", response_model=schemas.user.User, status_code=status.HTTP_201_CREATED)
def create_user_by_admin(
    *, 
    db: Session = Depends(deps.get_db), 
    user_in: schemas.user.UserCreateAdmin,
    current_user: models.user.User = Depends(deps.get_admin_user),
) -> Any:
    """
    Create a new user (Internal/Admin only).
    Allows creation of PSYCHOLOGIST and ADMIN roles.
    """
    # Check if user with this email already exists
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

    # Create user object
    db_obj = models.user.User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role,
        is_active=True,        # Admins create active users by default
        is_email_verified=True, # Admins verify users implicitly
        must_change_password=True # Force password change on first login
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
    Get current logged-in user profile.
    This route is protected by the get_current_user dependency.
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
    Update own user profile.
    Currently supports full_name and password.
    """
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
    # Only Admin users can list all system users
    current_user: models.user.User = Depends(deps.get_admin_user),
) -> Any:
    """
    Retrieve all users.
    Role-protected: Only accesible by 'admin' role.
    """
    users = db.query(models.user.User).offset(skip).limit(limit).all()
    return users


@router.get("/psychologist-only", response_model=str)
def psychologist_feature(
    current_user: models.user.User = Depends(deps.get_psychologist_user),
) -> Any:
    """
    Endpoint de demostración para privilegios de Psicólogo/Admin.
    """
    return f"Bienvenido, {current_user.full_name}. Tienes privilegios de Psicólogo/Admin."


@router.patch("/{user_id}/role", response_model=schemas.user.User)
def update_user_role(
    user_id: int,
    role: models.user.UserRole,
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_admin_user),
) -> Any:
    """
    Cambiar el rol de un usuario.
    Protegido: Solo accesible por 'admin'.
    """
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
    """
    Activar o desactivar una cuenta de usuario.
    Si se desactiva, se resuelven automáticamente sus alertas pendientes.
    Protegido: Solo accesible por 'admin'.
    """
    user = db.query(models.user.User).filter(models.user.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Toggle status
    user.is_active = not user.is_active
    
    # Si se desactiva, resolver alertas
    if not user.is_active:
        from datetime import datetime, timezone
        pending_alerts = db.query(models.Alert).filter(
            models.Alert.user_id == user.id,
            models.Alert.is_resolved == False
        ).all()
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
    """
    Eliminar un usuario del sistema de forma permanente.
    Protegido: Solo accesible por 'admin'.
    """
    user = db.query(models.user.User).filter(models.user.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Prevenir que un admin se elimine a sí mismo
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="No puedes eliminar tu propia cuenta de administrador")

    db.delete(user)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
