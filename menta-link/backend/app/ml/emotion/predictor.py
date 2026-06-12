import os
import sys

try:
    import torch
    TORCH_AVAILABLE = True
except (ImportError, OSError) as e:
    print(f"Warning: Failed to load PyTorch: {e}. Emotion prediction will be disabled.")
    TORCH_AVAILABLE = False

# Ensure we can import from app
sys.path.append(
    os.path.dirname(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    )
)

from app.ml.emotion.model import EmotionCNN
from app.ml.emotion.preprocessor import TextPreprocessor


class EmotionPredictor:
    def __init__(self, model_path, vocab_path, device="cpu"):
        if not TORCH_AVAILABLE:
            raise RuntimeError("Torch is not available.")
        self.device = torch.device(device)
        self.preprocessor = TextPreprocessor(max_len=100, vocab_path=vocab_path)

        # We need vocab size to initialize model
        vocab_size = len(self.preprocessor.word_index)
        self.emotions = [
            "feliz",
            "neutral",
            "triste",
            "ansioso",
            "frustrado",
            "motivado",
        ]

        self.model = EmotionCNN(vocab_size, num_classes=len(self.emotions))
        self.model.load_state_dict(
            torch.load(model_path, map_location=self.device, weights_only=True)
        )
        self.model.to(self.device)
        self.model.eval()

    def predict(self, text, student_id: str = None, faculty: str = None):
        input_tensor = self.preprocessor.preprocess(text).unsqueeze(0).to(self.device)
        with torch.no_grad():
            outputs = self.model(input_tensor)
            probabilities = torch.softmax(outputs, dim=1)[0]
            confidence, predicted_idx = torch.max(probabilities, dim=0)

        from app.utils.influx_logger import log_prediction_to_influx
        emotion_str = self.emotions[predicted_idx.item()]
        conf_float = float(confidence.item())
        
        log_prediction_to_influx(
            model_name="SentimentCNN",
            student_id=student_id,
            fields={"confidence": conf_float},
            tags={"emotion": emotion_str, "facultad": faculty or "Unknown"}
        )

        return {
            "emotion": emotion_str,
            "confidence": conf_float,
            "scores": {
                self.emotions[i]: float(probabilities[i].item())
                for i in range(len(self.emotions))
            },
        }


# Singleton instance
_predictor = None


def get_emotion_predictor():
    global _predictor
    if _predictor is None:
        base_path = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(base_path, "model_emotion_cnn.pt")
        vocab_path = os.path.join(base_path, "vocab.pkl")

        if not TORCH_AVAILABLE or not os.path.exists(model_path) or not os.path.exists(vocab_path):
            return None
        _predictor = EmotionPredictor(model_path, vocab_path)
    return _predictor
