import os
import joblib
import logging
from typing import Dict, Tuple
import pandas as pd

logger = logging.getLogger(__name__)

class RiskClassifier:
    """
    Advanced Risk Classification Service.
    
    Hybrid Approach:
    1. Tries to use a trained ML Model (Random Forest) for 80%+ accuracy.
    2. Falls back to Heuristic Rules (Expert System) if model is missing.
    """

    def __init__(self):
        self.model = None
        self.model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", "risk_model.pkl")
        
        self._load_model()
        
        # Fallback weights
        self.weights = {
            "pss_10": 0.4,
            "checkin_avg": 0.3,
            "frequency_low_mood": 0.3,
        }

    def _load_model(self):
        try:
            if os.path.exists(self.model_path):
                self.model = joblib.load(self.model_path)
                logger.info("RiskClassifier: ML Model loaded successfully.")
            else:
                logger.warning("RiskClassifier: Model file not found. Using Heuristic Fallback.")
        except Exception as e:
            logger.error(f"RiskClassifier: Failed to load ML model: {e}")

    def predict_risk(
        self, pss_score: float, checkin_avg: float, bad_days_count: int
    ) -> Tuple[str, float]:
        """
        Calculates the risk level dynamically.
        
        Args:
            pss_score: Normalized PSS-10 score (0.0 to 1.0)
            checkin_avg: Average mood score (1.0 to 5.0)
            bad_days_count: Number of checkins with mood < 3 in the last week
        """
        
        if self.model:
            try:
                # Prepare features match training [pss_score, mood_avg, bad_days_freq, study_pressure]
                # Denormalize PSS (0-1 -> 0-40 approx)
                pss_raw = int(pss_score * 40)
                
                # Derive proxy for study_pressure since we don't have it explicitly yet.
                # Assuming high stress correlates with high study pressure.
                # In the future, we should add this field to the Checkin.
                study_pressure = max(1, min(10, int(pss_score * 10))) 

                # Use DataFrame to avoid UserWarning about feature names
                features_df = pd.DataFrame([[pss_raw, checkin_avg, bad_days_count, study_pressure]], 
                                           columns=['pss_score', 'mood_avg', 'bad_days_freq', 'study_pressure'])
                
                # Predict (0=Low, 1=Medium, 2=High)
                pred_class = self.model.predict(features_df)[0]
                
                # Get Probability/Confidence
                probas = self.model.predict_proba(features_df)[0]
                confidence = probas[pred_class]
                
                mapping = {0: "Low", 1: "Medium", 2: "High"}
                return mapping.get(pred_class, "Low"), float(confidence)
            except Exception as e:
                logger.error(f"ML Prediction failed: {e}. Falling back to heuristics.")

        # --- HEURISTIC FALLBACK (Legacy Logic) ---
        normalized_mood = (5 - checkin_avg) / 4.0
        normalized_bad_days = min(bad_days_count / 7.0, 1.0)

        score = (
            pss_score * self.weights["pss_10"]
            + normalized_mood * self.weights["checkin_avg"]
            + normalized_bad_days * self.weights["frequency_low_mood"]
        )

        if score < 0.3:
            return "Low", 1.0 - score
        elif score < 0.6:
            return "Medium", score if score > 0.5 else 1.0 - score
        else:
            return "High", score

    def get_feature_importance(self) -> Dict[str, float]:
        if self.model:
            # Return Feature Importances from Random Forest
            imps = self.model.feature_importances_
            return {
                "pss_score": float(imps[0]),
                "checkin_avg": float(imps[1]),
                "bad_days_freq": float(imps[2]),
                "study_pressure": float(imps[3])
            }
        return self.weights


risk_classifier = RiskClassifier()
