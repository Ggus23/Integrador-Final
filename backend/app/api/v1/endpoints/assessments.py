from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.api import deps
from app.services.assessment_service import assessment_service

router = APIRouter()

"""
Verificamos si el usuario esta logueado, sino muestra 401
Luego retorna todos los cuestionarios disponibles
"""


@router.get(
    "/",
    response_model=List[schemas.assessment.Assessment],
    status_code=200,
    dependencies=[Depends(deps.get_current_user)],
)
def read_assessments(
    db: Session = Depends(deps.get_db),
) -> Any:
    return db.query(models.assessment.Assessment).all()


@router.get("/{key}", response_model=schemas.assessment.Assessment)
def read_assessment_by_key(
    key: str,
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    assessment = (
        db.query(models.assessment.Assessment)
        .filter(models.assessment.Assessment.type == key)
        .first()
    )
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return assessment


"""
Verificamos si el usuario esta logueado, sino muestra 401
Recibimos la key(ej: Ansiedad)
Busca por tipo, si existe prepara el objeto y lo retorna
y si no existe muestra 404 
"""


@router.post(
    "/responses", response_model=schemas.assessment_response.AssessmentResponse
)
def submit_assessment_response(
    *,
    db: Session = Depends(deps.get_db),
    response_in: schemas.assessment_response.AssessmentResponseCreate,
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    response = assessment_service.process_response(db, current_user.id, response_in)
    if not response:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return response


"""
Verifcamos si el usuario esta logueado, sino muestra 401
Obtiene el ID del usuario obtenido del token
Prepara la consulta AssessmentResponse + where user_id = ID
Busca la respuesta o respuestas que pertenecen al usuario
Retorna el historial
"""


@router.get(
    "/responses/me", response_model=List[schemas.assessment_response.AssessmentResponse]
)
def read_my_responses(
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    return (
        db.query(models.assessment_response.AssessmentResponse)
        .filter(
            models.assessment_response.AssessmentResponse.user_id == current_user.id
        )
        .all()
    )
