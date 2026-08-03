from datetime import date, datetime
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import exc
from sqlalchemy.orm import Session

from app import models, schemas
from app.api import deps
from app.ml.emotion.regex_predictor import get_regex_emotion_analyzer

router = APIRouter()


@router.post("/", response_model=schemas.emotional_diary.EmotionalDiary)
def create_diary_entry(
    *,
    db: Session = Depends(deps.get_db),
    entry_in: schemas.emotional_diary.EmotionalDiaryCreate,
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Crear un nuevo registro diario para el estudiante actual.
    Ahora permite múltiples registros por día para un historial acumulativo.
    """
    entry_date = entry_in.date or date.today()

    # Verificar si el usuario es estudiante
    if current_user.role != models.user.UserRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los estudiantes pueden crear registros en el diario.",
        )

    db_obj = models.EmotionalDiary(
        **entry_in.model_dump(exclude={"date"}),
        user_id=current_user.id,
        date=entry_date,
    )

    # Trigger CNN Emotion Analysis
    if db_obj.experience:
        try:
            # Primero analizamos con Regex Lexicon
            regex_analyzer = get_regex_emotion_analyzer()
            regex_result = regex_analyzer.analyze_emotion(db_obj.experience)

            db_obj.emotion_ai = regex_result["emotion"]
            db_obj.emotion_scores = regex_result["scores"]

            db_obj.analysis_created_at = datetime.now()
        except Exception as e:
            print(f"Error analyzing emotion: {e}")

    db.add(db_obj)
    try:
        db.commit()
        db.refresh(db_obj)
    except exc.IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error de integridad: posiblemente ya existe un registro para esta fecha.",
        )
    return db_obj


@router.get("/me", response_model=List[schemas.emotional_diary.EmotionalDiary])
def read_my_diary_history(
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Consultar el historial completo de diario del usuario actual.
    """
    return (
        db.query(models.EmotionalDiary)
        .filter(models.EmotionalDiary.user_id == current_user.id)
        .order_by(models.EmotionalDiary.date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/today", response_model=List[schemas.emotional_diary.EmotionalDiary])
def read_diary_today(
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Obtener todos los registros del diario correspondientes al día de hoy.
    Permite visualizar la evolución emocional a lo largo del día.
    """
    return (
        db.query(models.EmotionalDiary)
        .filter(
            models.EmotionalDiary.user_id == current_user.id,
            models.EmotionalDiary.date == date.today(),
        )
        .order_by(models.EmotionalDiary.created_at.asc())
        .all()
    )


@router.patch("/{entry_id}", response_model=schemas.emotional_diary.EmotionalDiary)
def update_diary_entry(
    *,
    db: Session = Depends(deps.get_db),
    entry_id: int,
    entry_in: schemas.emotional_diary.EmotionalDiaryUpdate,
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Actualizar un registro de diario existente.
    """
    entry = (
        db.query(models.EmotionalDiary)
        .filter(models.EmotionalDiary.id == entry_id)
        .first()
    )
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Registro no encontrado"
        )

    if entry.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos suficientes",
        )

    update_data = entry_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(entry, field, value)

    # Re-trigger CNN Emotion Analysis if experience changed
    if "experience" in update_data and entry.experience:
        try:
            regex_analyzer = get_regex_emotion_analyzer()
            regex_result = regex_analyzer.analyze_emotion(entry.experience)

            entry.emotion_ai = regex_result["emotion"]
            entry.emotion_scores = regex_result["scores"]

            entry.analysis_created_at = datetime.now()
        except Exception as e:
            print(f"Error analyzing emotion: {e}")

    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
