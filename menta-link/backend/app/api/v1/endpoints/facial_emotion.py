import base64
import os

import cv2
import numpy as np
from fastapi import APIRouter, Body

router = APIRouter()

# Global variable to hold the model lazily
_model = None


def get_emotion_model():
    global _model
    if _model is None:
        try:
            from tensorflow.keras.models import load_model

            model_path = os.path.join(
                os.path.dirname(
                    os.path.dirname(
                        os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                    )
                ),
                "models",
                "mejor_modelo_emociones.h5",
            )

            _model = load_model(model_path)
            print("Loaded mejor_modelo_emociones.h5 successfully.")
        except Exception as e:
            print(f"Failed to load TF model: {e}")
            _model = "FAILED"
    return _model


@router.post("/analyze-frame")
async def analyze_frame(image: str = Body(..., embed=True)):
    """
    Receives a Base64 encoded image frame from the assessment camera.
    Returns the dominant facial emotion using the emotion CNN model.
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

        # Face detection with HaarCascade
        cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        face_cascade = cv2.CascadeClassifier(cascade_path)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)

        if len(faces) == 0:
            return {"emotion": "neutral", "confidence": 1.0}

        x, y, w, h = faces[0]
        face_gray = gray[y : y + h, x : x + w]

        # Preprocess for emotion CNN: 48x48 grayscale
        face_resized = cv2.resize(face_gray, (48, 48))
        face_normalized = face_resized / 255.0
        face_input = np.expand_dims(face_normalized, axis=(0, -1))  # shape (1, 48, 48, 1)

        model = get_emotion_model()
        if model is None or model == "FAILED":
            return {
                "emotion": "neutral",
                "confidence": 1.0,
                "warning": "Model not loaded properly",
            }

        preds = model.predict(face_input, verbose=0)

        # FER2013 standard classes (7 emociones)
        emotions = [
            "enojado",
            "disgusto",
            "miedo",
            "feliz",
            "triste",
            "sorprendido",
            "neutral",
        ]
        pred_idx = np.argmax(preds[0])
        emotion = emotions[pred_idx]
        confidence = float(preds[0][pred_idx])

        return {"emotion": emotion, "confidence": confidence}
    except Exception as e:
        return {"emotion": "neutral", "confidence": 0.0, "error": str(e)}
