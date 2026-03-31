from fastapi import APIRouter, Depends, HTTPException

from app import models
from app.api import deps
from app.ml.emotion.predictor import get_emotion_predictor
from app.schemas.emotion import EmotionRequest, EmotionResponse

router = APIRouter()


@router.post("/analyze", response_model=EmotionResponse)
def analyze_emotion(
    request: EmotionRequest,
    current_user: models.user.User = Depends(deps.get_current_user),
):
    """
    Analiza las emociones en un texto usando el modelo CNN local.
    """
    predictor = get_emotion_predictor()
    if not predictor:
        raise HTTPException(
            status_code=503,
            detail="El modelo de análisis emocional no está disponible. Asegúrese de que el entrenamiento haya finalizado.",
        )

    try:
        result = predictor.predict(request.text)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error durante el análisis: {str(e)}"
        )
