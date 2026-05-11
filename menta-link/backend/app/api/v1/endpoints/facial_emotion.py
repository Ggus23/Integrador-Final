import base64
import os

import cv2
import numpy as np
from fastapi import APIRouter, Body

router = APIRouter()

# Global variable to hold the model lazily
_model = None


def get_densenet_model():
    global _model
    if _model is None:
        try:
            import tensorflow as tf
            from tensorflow.keras.models import load_model

            model_path = os.path.join(
                os.path.dirname(
                    os.path.dirname(
                        os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                    )
                ),
                "models",
                "best_model.keras",
            )
            
            _model = load_model(model_path)
            print("Loaded best_model from local .keras successfully.")
        except Exception as e:
            print(f"Failed to load TF model: {e}")
            _model = "FAILED"
    return _model


@router.post("/analyze-frame")
async def analyze_frame(image: str = Body(..., embed=True)):
    """
    Receives a Base64 encoded image frame from the assessment camera.
    Returns the dominant facial emotion using DenseNet121.
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

        # Optional: Setup HaarCascade for face detection
        cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        face_cascade = cv2.CascadeClassifier(cascade_path)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)

        if len(faces) == 0:
            # If no face detected, just return neutral
            return {"emotion": "neutral", "confidence": 1.0}

        x, y, w, h = faces[0]
        face_img = img[y : y + h, x : x + w]

        # Preprocess for DenseNet 100x100
        face_img = cv2.resize(face_img, (100, 100))
        face_img = face_img / 255.0
        face_img = np.expand_dims(face_img, axis=0)  # batch size 1

        dnn_model = get_densenet_model()
        if dnn_model is None or dnn_model == "FAILED":
            return {
                "emotion": "neutral",
                "confidence": 1.0,
                "warning": "Model not loaded properly",
            }

        preds = dnn_model.predict(face_img, verbose=0)

        emotions = [
            "frustrado",
            "neutral",
            "ansioso",
            "feliz",
            "triste",
            "motivado",
            "neutral",
        ]
        pred_idx = np.argmax(preds[0])
        emotion = emotions[pred_idx]
        confidence = float(preds[0][pred_idx])

        return {"emotion": emotion, "confidence": confidence}
    except Exception as e:
        return {"emotion": "neutral", "confidence": 0.0, "error": str(e)}
