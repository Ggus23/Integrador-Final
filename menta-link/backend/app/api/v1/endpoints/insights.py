from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
import random

from app import models, schemas
from app.api import deps
from app.ml.emotion.regex_predictor import get_regex_emotion_analyzer

router = APIRouter()

@router.get("/prompts")
def get_adaptive_prompts(
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Generate adaptive prompts based on the user's past diary entries.
    """
    last_entries = (
        db.query(models.EmotionalDiary)
        .filter(models.EmotionalDiary.user_id == current_user.id)
        .order_by(models.EmotionalDiary.date.desc())
        .limit(5)
        .all()
    )

    prompts = []
    if not last_entries:
        prompts.append({
            "text": "¿Cómo te sientes al escribir tu primer registro?",
            "ref": "Comenzando tu viaje de bienestar.",
            "type": "action"
        })
        return prompts

    # Simple heuristic to generate prompts based on last entry
    last_entry = last_entries[0]
    analyzer = get_regex_emotion_analyzer()
    tokens = analyzer.clean_and_tokenize(last_entry.experience)
    
    if "ansioso" in tokens or "examen" in tokens or "estresado" in tokens:
        prompts.append({
            "text": "¿Cómo te fue hoy con la inquietud que mencionaste recientemente?",
            "ref": "Mencionaste sentirte estresado o ansioso.",
            "type": "followup"
        })
    elif last_entry.wellbeing_level and last_entry.wellbeing_level <= 2:
        prompts.append({
            "text": "¿Pudiste descansar o hacer algo que te guste hoy?",
            "ref": f"Tu último registro de bienestar fue bajo ({last_entry.wellbeing_level}/5).",
            "type": "action"
        })
    elif last_entry.wellbeing_level and last_entry.wellbeing_level >= 4:
        prompts.append({
            "text": "¿Qué mantuviste de la buena energía del último registro?",
            "ref": "Tu último registro mostró buen bienestar.",
            "type": "followup"
        })
    else:
        prompts.append({
            "text": "¿Hubo algún cambio en tu rutina de hoy?",
            "ref": "Explorando nuevos patrones.",
            "type": "context"
        })

    # Add a fallback prompt
    prompts.append({
        "text": "¿Qué fue lo más significativo de tu día?",
        "ref": "Reflexión general",
        "type": "general"
    })

    return prompts

@router.get("/time-capsule")
def get_time_capsule(
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Fetch a random past diary entry (older than 7 days) as a time capsule.
    """
    seven_days_ago = date.today() - timedelta(days=7)
    past_entries = (
        db.query(models.EmotionalDiary)
        .filter(models.EmotionalDiary.user_id == current_user.id)
        .filter(models.EmotionalDiary.date <= seven_days_ago)
        .all()
    )

    if not past_entries:
        return None

    entry = random.choice(past_entries)
    days_ago = (date.today() - entry.date).days

    return {
        "daysAgo": days_ago,
        "emotion": entry.emotion_ai or "Neutral",
        "emoji": "🕰️",
        "snippet": entry.experience[:100] + "..." if len(entry.experience) > 100 else entry.experience,
        "resolution": "Mira cómo estabas hace un tiempo y reflexiona sobre tu progreso.",
        "color": entry.emotion_color or "#888888"
    }

@router.post("/reframe")
def generate_cognitive_reframe(
    text: str = Body(..., embed=True),
    emotionLabel: str = Body("Neutral", embed=True),
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Generate a cognitive reframe based on the provided text and emotion.
    """
    # Simple rule-based reframe generator
    analyzer = get_regex_emotion_analyzer()
    tokens = set(analyzer.clean_and_tokenize(text))
    
    if emotionLabel == "Muy triste" or emotionLabel == "Triste" or "mal" in tokens or "triste" in tokens:
        reframe = "Reconocer tu dolor es un acto de valentía. Cada día difícil que enfrentas demuestra una fortaleza que no siempre puedes ver."
        technique = "Validación Emocional"
        action = "Intenta escribir 3 cosas pequeñas que salieron bien hoy, sin importar cuán insignificantes parezcan."
    elif emotionLabel == "Feliz" or emotionLabel == "Muy feliz" or "bien" in tokens or "feliz" in tokens:
        reframe = "¡Excelente! Tu capacidad de reconocer la alegría es una habilidad poderosa. Anclar estos momentos fortalece tu resiliencia."
        technique = "Amplificación Positiva"
        action = "Comparte esta energía. Un mensaje a alguien que valoras puede multiplicar esta sensación."
    else:
        reframe = "Los días tranquilos son el fundamento sobre el que se construye el bienestar. No todo tiene que ser extraordinario para ser valioso."
        technique = "Mindfulness Cognitivo"
        action = "Toma 5 minutos para notar algo que normalmente pasas por alto: un sonido, un sabor, una textura."

    return {
        "reframe": reframe,
        "technique": technique,
        "action": action
    }

@router.get("/forecast")
def get_crisis_forecast(
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Generate a crisis forecast based on the last 7 days of diary entries.
    """
    seven_days_ago = date.today() - timedelta(days=6)
    last_entries = (
        db.query(models.EmotionalDiary)
        .filter(models.EmotionalDiary.user_id == current_user.id)
        .filter(models.EmotionalDiary.date >= seven_days_ago)
        .order_by(models.EmotionalDiary.date.asc())
        .all()
    )

    # Fill data for the last 7 days
    days_data = []
    days_labels = ['D', 'L', 'M', 'X', 'J', 'V', 'S']
    
    for i in range(6, -1, -1):
        d = date.today() - timedelta(days=i)
        entry = next((e for e in last_entries if e.date == d), None)
        days_data.append({
            "day": days_labels[d.weekday() % 7],
            "level": entry.wellbeing_level if entry else None,
            "color": entry.emotion_color if entry else None,
            "date": d.isoformat()
        })

    filled_days = [d for d in days_data if d["level"] is not None]
    is_downtrend = False
    if len(filled_days) >= 3:
        trend = filled_days[-1]["level"] - filled_days[0]["level"]
        is_downtrend = trend <= -2

    return {
        "weekData": days_data,
        "isDowntrend": is_downtrend,
        "hasEnoughData": len(filled_days) > 0
    }
