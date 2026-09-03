import base64
import logging
import os

import cv2
import numpy as np
from fastapi import APIRouter, Body

router = APIRouter()
logger = logging.getLogger(__name__)

import requests

HF_MODEL_URL = "https://huggingface.co/agustin250800/detector_emociones/resolve/main/best.pt"

ALLOWED_EMOTIONS = {"triste", "neutral", "enojado", "aburrido", "sorprendido"}

TRANSLATION_MAP = {
    "angry": "enojado",
    "bored": "aburrido",
    "neutral": "neutral",
    "sad": "triste",
    "surprise": "sorprendido",
}

_model = None
_model_failed = False
_face_cascade = None


def _get_face_cascade():
    global _face_cascade
    if _face_cascade is None:
        cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        _face_cascade = cv2.CascadeClassifier(cascade_path)
    return _face_cascade


def _get_local_model_path():
    return os.path.join(
        os.path.dirname(
            os.path.dirname(
                os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            )
        ),
        "models",
        "best.pt",
    )


def _get_hf_cache_path():
    return os.path.join(
        os.path.dirname(
            os.path.dirname(
                os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            )
        ),
        "models",
        "emotion_hf.pt",
    )


def _load_hf_model():
    """Download the HF YOLO model to a stable project path and load it."""
    from ultralytics import YOLO

    cache_path = _get_hf_cache_path()
    if not os.path.exists(cache_path):
        logger.info("Downloading YOLO model from HuggingFace: %s", HF_MODEL_URL)
        response = requests.get(HF_MODEL_URL, timeout=60)
        response.raise_for_status()
        with open(cache_path, "wb") as f:
            f.write(response.content)
        logger.info("Downloaded HF model to: %s", cache_path)
    else:
        logger.info("Using cached HF model at: %s", cache_path)

    return YOLO(cache_path)


def get_emotion_model():
    global _model, _model_failed

    if _model is not None:
        return _model

    if _model_failed:
        return None

    try:
        _model = _load_hf_model()
        logger.info("Loaded HF model successfully. Classes: %s", _model.names)
        return _model
    except Exception as e:
        logger.warning("HF model load failed, trying local best.pt: %s", e)

    try:
        from ultralytics import YOLO

        model_path = _get_local_model_path()
        logger.info("Loading local YOLO model from: %s", model_path)
        _model = YOLO(model_path)
        logger.info("Loaded local best.pt successfully. Classes: %s", _model.names)
        return _model
    except Exception as e:
        logger.error("Failed to load any YOLO model: %s", e)
        _model_failed = True
        return None


@router.post("/analyze-frame")
async def analyze_frame(image: str = Body(..., embed=True)):
    """
    Receives a Base64 encoded image frame from the assessment camera.
    Returns the dominant facial emotion using the YOLOv8-classify model.
    Primary: HuggingFace hosted model. Fallback: local best.pt.
    """
    try:
        if "," in image:
            image = image.split(",")[1]

        img_data = base64.b64decode(image)
        nparr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return {
                "emotion": "neutral",
                "confidence": 0.0,
                "error": "Invalid image format",
            }

        model = get_emotion_model()
        if model is None:
            return {
                "emotion": "neutral",
                "confidence": 1.0,
                "warning": "Model not loaded. Will retry on next request.",
            }

        face_cascade = _get_face_cascade()
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)

        if len(faces) > 0:
            x, y, w, h = faces[0]
            input_img = img[y : y + h, x : x + w]
            logger.info("Face detected at (%d,%d,%d,%d), cropping for classification", x, y, w, h)
        else:
            input_img = img
            logger.info("No face detected by HaarCascade, using full image (%dx%d)", img.shape[1], img.shape[0])

        results = model(input_img, verbose=False)
        probs = results[0].probs
        pred_idx = int(probs.top1)
        confidence = float(probs.top1conf)
        raw_label = model.names[pred_idx]

        all_scores = {model.names[i]: float(s) for i, s in enumerate(probs.data.tolist())}
        logger.info("YOLO raw prediction: %s (%.4f) | All scores: %s", raw_label, confidence, all_scores)

        filtered_scores = {}
        for idx, score in enumerate(probs.data.tolist()):
            raw_name = model.names[idx]
            translated = TRANSLATION_MAP.get(raw_name, raw_name)
            if translated in ALLOWED_EMOTIONS:
                filtered_scores[translated] = float(score)

        if not filtered_scores:
            return {
                "emotion": "neutral",
                "confidence": 1.0,
                "scores": {"neutral": 1.0},
            }

        total = sum(filtered_scores.values())
        if total > 0:
            filtered_scores = {k: round(v / total, 4) for k, v in filtered_scores.items()}

        emotion = max(filtered_scores, key=filtered_scores.get)
        confidence = filtered_scores[emotion]

        return {
            "emotion": emotion,
            "confidence": confidence,
            "scores": filtered_scores,
        }
    except Exception as e:
        logger.exception("Error in analyze_frame")
        return {"emotion": "neutral", "confidence": 0.0, "error": str(e)}
