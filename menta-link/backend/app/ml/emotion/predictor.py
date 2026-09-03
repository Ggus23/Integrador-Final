import os
import requests
from app.core.config import settings
from app.utils.influx_logger import log_prediction_to_influx

API_URL = "https://router.huggingface.co/hf-inference/models/agustin250800/detector_emociones"


class EmotionPredictor:
    def __init__(self):
        self.api_url = API_URL
        # Use token from Settings configuration or env var
        self.token = settings.HF_TOKEN or os.getenv("HF_TOKEN", "")
        self.headers = {"Authorization": f"Bearer {self.token}"} if self.token else {}

    def predict(self, text: str, student_id: str = None, faculty: str = None):
        payload = {"inputs": text}
        try:
            response = requests.post(
                self.api_url, headers=self.headers, json=payload, timeout=10
            )
            response.raise_for_status()
            result = response.json()
        except Exception as e:
            raise RuntimeError(f"Error al consultar la API de Hugging Face: {str(e)}")

        # Parse Hugging Face API response. It usually returns a list of classification labels
        # e.g., [[{"label": "feliz", "score": 0.8}, {"label": "neutral", "score": 0.2}]]
        # or [{"label": "feliz", "score": 0.8}, ...]
        flat_results = []
        if isinstance(result, list):
            if len(result) > 0 and isinstance(result[0], list):
                flat_results = result[0]
            else:
                flat_results = result

        if not isinstance(flat_results, list) or not flat_results:
            raise RuntimeError(f"Respuesta inesperada de la API de Hugging Face: {result}")

        # Find the label with the highest score
        best_match = max(flat_results, key=lambda x: x.get("score", 0.0))
        emotion_str = best_match.get("label", "neutral").lower()
        conf_float = float(best_match.get("score", 0.0))

        # Build scores dictionary for all predicted labels
        scores = {
            item.get("label", "Unknown").lower(): float(item.get("score", 0.0))
            for item in flat_results
        }

        # Log prediction to influx if possible
        try:
            log_prediction_to_influx(
                model_name="HuggingFace_DetectorEmociones",
                student_id=student_id,
                fields={"confidence": conf_float},
                tags={"emotion": emotion_str, "facultad": faculty or "Unknown"},
            )
        except Exception as logger_err:
            print(f"Influx logging failed: {logger_err}")

        return {
            "emotion": emotion_str,
            "confidence": conf_float,
            "scores": scores,
        }


# Singleton instance
_predictor = None


def get_emotion_predictor():
    global _predictor
    if _predictor is None:
        _predictor = EmotionPredictor()
    return _predictor
