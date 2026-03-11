from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.api import deps

router = APIRouter()

@router.post("/", response_model=schemas.appointment.Appointment, status_code=status.HTTP_201_CREATED)
def create_appointment(
    *,
    db: Session = Depends(deps.get_db),
    appointment_in: schemas.appointment.AppointmentCreate,
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Registrar una nueva solicitud de cita (Agendar Cita).
    """
    appointment = models.appointment.Appointment(
        **appointment_in.model_dump(),
        user_id=current_user.id,
        status=models.appointment.AppointmentStatus.PENDING
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment

@router.get("/me", response_model=List[schemas.appointment.Appointment])
def read_my_appointments(
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Obtener la lista de citas del usuario actual.
    """
    return db.query(models.appointment.Appointment).filter(
        models.appointment.Appointment.user_id == current_user.id
    ).order_by(models.appointment.Appointment.appointment_date.desc()).all()

@router.get("/", response_model=List[schemas.appointment.Appointment])
def read_all_appointments(
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_staff_user),
) -> Any:
    """
    Obtener todas las citas (Solo para Psicólogos/Admin).
    """
    return db.query(models.appointment.Appointment).order_by(
        models.appointment.Appointment.appointment_date.desc()
    ).all()

@router.patch("/{appointment_id}", response_model=schemas.appointment.Appointment)
def update_appointment(
    *,
    db: Session = Depends(deps.get_db),
    appointment_id: int,
    appointment_in: schemas.appointment.AppointmentUpdate,
    current_user: models.user.User = Depends(deps.get_staff_user),
) -> Any:
    """
    Actualizar el estado o asignar un psicólogo a una cita.
    """
    appointment = db.query(models.appointment.Appointment).filter(
        models.appointment.Appointment.id == appointment_id
    ).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    
    update_data = appointment_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(appointment, field, value)
    
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment
