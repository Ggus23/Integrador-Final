from datetime import datetime
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.api import deps
from app.services.audit_service import log_access

router = APIRouter()


@router.get("/", response_model=List[schemas.alert.Alert])
def read_all_alerts(
    risk_level: str = None,
    status: str = None,
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_psychologist_user),
) -> Any:
    """
    Esta funcion primero verifica permisos si no es psicologo o admin muestra 403,
    luego recibe los filtros y se conecta a la DB,
    Inicia la consulta con filtro de riesgo y estado
    Al final ejecuta y retorna lo pedido
    Los noqa: E712 son para que no marque error al usar == True o False debido a en FastAPI no se puede usar == True
    Pero es necesario usarlo en la consulta
    """

    query = db.query(models.alert.Alert)

    if risk_level:
        query = query.filter(models.alert.Alert.severity == risk_level)

    if status == "pending":
        query = query.filter(models.alert.Alert.is_resolved == False)  # noqa: E712
    elif status == "resolved":
        query = query.filter(models.alert.Alert.is_resolved == True)  # noqa: E712

    return query.all()


@router.get("/me", response_model=List[schemas.alert.Alert])
def read_my_alerts(
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Esta funcion verifica si esta autenticado o no,
    Si esta identificado retorna los alertas del usuario
    y al final ejecuta y retorna lo pedido
    """

    return (
        db.query(models.alert.Alert)
        .filter(models.alert.Alert.user_id == current_user.id)
        .all()
    )


@router.put("/{alert_id}", response_model=schemas.alert.Alert)
def resolve_alert(
    alert_id: int,
    alert_in: schemas.alert.AlertUpdate,
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_psychologist_user),
) -> Any:
    """
    Primero verificamos permisos si no es psicologo o admin muestra 403,
    Recibimos los datos segunel ID de la alerta
    Busca la alerta en la DB sino existe muestra un 404
    Al resolver la alerta se actualiza el estado y la fecha de resolucion
    Luego se hacen commit para ver quien hizo la modificacion
    Al final retorna la alerta
    """

    alert = (
        db.query(models.alert.Alert).filter(models.alert.Alert.id == alert_id).first()
    )
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.is_resolved = alert_in.is_resolved
    if alert_in.is_resolved:
        alert.resolved_at = datetime.utcnow()

    db.commit()
    db.refresh(alert)

    # Audit Log
    log_access(
        db=db,
        actor_id=current_user.id,
        action="RESOLVE_ALERT",
        resource_id=str(alert_id),
        details=f"Alert resolved status changed to {alert.is_resolved}",
    )

    return alert
