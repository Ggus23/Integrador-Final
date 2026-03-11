import re
from collections import Counter
from datetime import date
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import exc
from sqlalchemy.orm import Session

from app import models, schemas
from app.api import deps
from app.modules.ai import emotion_analysis_service

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
    Asegura un solo registro por día por estudiante.
    """
    entry_date = entry_in.date or date.today()

    # Verificar si el usuario es estudiante
    if current_user.role != models.user.UserRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los estudiantes pueden crear registros en el diario.",
        )

    # Verificar si ya existe un registro para esta fecha
    existing_entry = (
        db.query(models.EmotionalDiary)
        .filter(
            models.EmotionalDiary.user_id == current_user.id,
            models.EmotionalDiary.date == entry_date,
        )
        .first()
    )
    if existing_entry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un registro de diario para este día.",
        )

    db_obj = models.EmotionalDiary(
        **entry_in.model_dump(exclude={"date"}),
        user_id=current_user.id,
        date=entry_date,
    )

    # Trigger AI Emotion Analysis
    if db_obj.experience:
        try:
            analysis = emotion_analysis_service.analyze_emotion(db_obj.experience)
            db_obj.emotion_ai = analysis.get("dominant_emotion")
            db_obj.emotion_scores = analysis.get("emotion_scores")
            db_obj.analysis_created_at = analysis.get("analysis_created_at")
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


@router.get("/today", response_model=schemas.emotional_diary.EmotionalDiary | None)
def read_diary_today(
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Obtener el registro del diario correspondiente al día de hoy.
    Retorna None si no existe registro, para evitar 404 en el frontend.
    """
    return (
        db.query(models.EmotionalDiary)
        .filter(
            models.EmotionalDiary.user_id == current_user.id,
            models.EmotionalDiary.date == date.today(),
        )
        .first()
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

    # Re-trigger AI Emotion Analysis if experience changed
    if "experience" in update_data and entry.experience:
        try:
            analysis = emotion_analysis_service.analyze_emotion(entry.experience)
            entry.emotion_ai = analysis.get("dominant_emotion")
            entry.emotion_scores = analysis.get("emotion_scores")
            entry.analysis_created_at = analysis.get("analysis_created_at")
        except Exception as e:
            print(f"Error analyzing emotion: {e}")

    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/visualizations/word-cloud")
def get_word_cloud(
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Generar nube de palabras a partir del historial de diarios.
    """
    entries = (
        db.query(models.EmotionalDiary)
        .filter(models.EmotionalDiary.user_id == current_user.id)
        .all()
    )

    text = " ".join([e.experience for e in entries if e.experience])
    if not text:
        return []

    # Basic cleaning and tokenization
    words = re.findall(r"\w+", text.lower())

    # Spanish stopwords (minimal list)
    stopwords = {
        "de",
        "la",
        "que",
        "el",
        "en",
        "y",
        "a",
        "los",
        "del",
        "se",
        "las",
        "por",
        "un",
        "para",
        "con",
        "no",
        "una",
        "su",
        "al",
        "lo",
        "como",
        "más",
        "pero",
        "sus",
        "le",
        "ya",
        "o",
        "este",
        "sí",
        "porque",
        "esta",
        "entre",
        "cuando",
        "muy",
        "sin",
        "sobre",
        "también",
        "me",
        "hasta",
        "hay",
        "donde",
        "quien",
        "desde",
        "todo",
        "nos",
        "durante",
        "todos",
        "uno",
        "les",
        "ni",
        "contra",
        "otros",
        "ese",
        "eso",
        "ante",
        "ellos",
        "e",
        "esto",
        "mí",
        "antes",
        "algunos",
        "qué",
        "unos",
        "yo",
        "otro",
        "otras",
        "otra",
        "él",
        "tanto",
        "esa",
        "estos",
        "mucho",
        "quienes",
        "nada",
        "muchos",
        "cual",
        "poco",
        "ella",
        "estar",
        "estas",
        "algunas",
        "algo",
        "nosotros",
        "mi",
        "mis",
        "tu",
        "tus",
        "ti",
    }

    filtered_words = [w for w in words if w not in stopwords and len(w) > 2]
    counts = Counter(filtered_words).most_common(50)

    return [{"word": word, "frequency": freq} for word, freq in counts]


@router.get("/visualizations/phrase-cloud")
def get_phrase_cloud(
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Generar nube de frases (bigramas/trigramas) a partir del historial de diarios.
    """
    entries = (
        db.query(models.EmotionalDiary)
        .filter(models.EmotionalDiary.user_id == current_user.id)
        .all()
    )

    # Collect sentences
    experiences = [e.experience for e in entries if e.experience]
    if not experiences:
        return []

    phrases = []
    for exp in experiences:
        # Simple phrase extraction (bigrams as representative phrases)
        words = re.findall(r"\w+", exp.lower())
        if len(words) < 2:
            continue
        for i in range(len(words) - 1):
            phrases.append(f"{words[i]} {words[i+1]}")

    # Optionally add trigrams
    for exp in experiences:
        words = re.findall(r"\w+", exp.lower())
        if len(words) < 3:
            continue
        for i in range(len(words) - 2):
            phrases.append(f"{words[i]} {words[i+1]} {words[i+2]}")

    # Common phrases filter (could be improved)
    counts = Counter(phrases).most_common(30)

    return [{"phrase": phrase, "frequency": freq} for phrase, freq in counts]
