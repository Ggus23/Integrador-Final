import json
import logging
from datetime import datetime
from typing import Any, Dict, Optional

from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

# Emotions required: felicidad, tristeza, ansiedad, enojo, neutral
EMOTIONS = ["felicidad", "tristeza", "ansiedad", "enojo", "neutral"]


class EmotionAnalysisService:
    def __init__(self, api_key: str = "AIzaSyCA7xyOqhxBb-dFgojdhaorJAqCCgrrpXQ"):
        self.api_key = api_key
        # Note: In a production environment, the api_key should be loaded from settings

    def analyze_emotion(self, text: str) -> Dict[str, Any]:
        """
        Analiza el texto para detectar emociones predominantes.
        Retorna la emoción dominante y puntajes por emoción.
        """
        if not text or len(text.strip()) < 5:
            return {
                "dominant_emotion": "neutral",
                "emotion_scores": {e: 0.0 for e in EMOTIONS},
                "analysis_created_at": datetime.now(),
            }

        prompt = f"""
        Analiza el siguiente texto de un diario emocional de un estudiante y detecta las emociones presentes.
        Debes clasificar el texto en las siguientes categorías: felicidad, tristeza, ansiedad, enojo, neutral.
        
        Texto: "{text}"
        
        Instrucciones:
        1. Identifica la emoción dominante.
        2. Proporciona un puntaje de probabilidad (0.0 a 1.0) para cada una de las 5 emociones.
        3. El total de los puntajes no debe necesariamente sumar 1.0, pero debe reflejar la intensidad de cada emoción.
        4. Responde ÚNICAMENTE en formato JSON con la siguiente estructura:
        {{
            "dominant_emotion": "nombre_de_emocion",
            "emotion_scores": {{
                "felicidad": 0.0,
                "tristeza": 0.0,
                "ansiedad": 0.0,
                "enojo": 0.0,
                "neutral": 0.0
            }}
        }}
        """

        try:
            client = genai.Client(api_key=self.api_key)
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                ),
            )

            result = json.loads(response.text)
            result["analysis_created_at"] = datetime.now()
            return result
        except Exception as e:
            logger.error(f"Error in EmotionAnalysisService: {e}")
            # Fallback simple
            return {
                "dominant_emotion": "neutral",
                "emotion_scores": {e: 0.2 for e in EMOTIONS},
                "analysis_created_at": datetime.now(),
            }


emotion_analysis_service = EmotionAnalysisService()
