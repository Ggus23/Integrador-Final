from typing import List

from sqlalchemy.orm import Session

from app import models


class StudentHistoryService:
    @staticmethod
    def get_combined_history(db: Session, user_id: int) -> List[dict]:
        """
        Combina registros del diario emocional y resultados de tests en una sola linea de tiempo.
        """
        history = []

        # 1. Get Diary Entries
        diaries = (
            db.query(models.EmotionalDiary)
            .filter(models.EmotionalDiary.user_id == user_id)
            .order_by(models.EmotionalDiary.date.desc())
            .all()
        )

        for d in diaries:
            # Mapear la emoción canónica al score correspondiente del dict
            # de scores devuelto por el motor de regex.
            score_key = {
                "triste": "depresion",
                "ansioso": "ansiedad",
                "frustrado": "estres",
                "feliz": "felicidad",
                "motivado": "felicidad",
                "depresion": "depresion",
                "ansiedad": "ansiedad",
                "estres": "estres",
            }.get((d.emotion_ai or "").lower(), "")
            raw_confidence = (
                (d.emotion_scores or {}).get(score_key, 0.0) if score_key else None
            )
            confidence = (
                float(raw_confidence)
                if raw_confidence is not None
                else d.wellbeing_level / 5.0
            )
            history.append(
                {
                    "type": "diary",
                    "date": d.date,
                    "timestamp": d.created_at,
                    "text": d.experience,
                    "emotion": d.emotion_ai or d.emotion,
                    "confidence": confidence,
                    "wellbeing_level": d.wellbeing_level,
                }
            )

        # 2. Get Assessment Responses
        assessments = (
            db.query(models.AssessmentResponse)
            .filter(models.AssessmentResponse.user_id == user_id)
            .order_by(models.AssessmentResponse.created_at.desc())
            .all()
        )

        for a in assessments:
            history.append(
                {
                    "type": "assessment",
                    "date": a.created_at.date(),
                    "timestamp": a.created_at,
                    "test_type": (
                        a.assessment.title if a.assessment else "Desconocido"
                    ),
                    "score": a.total_score,
                    "risk_level": a.risk_level,
                }
            )

        # Sort by timestamp
        history.sort(key=lambda x: x["timestamp"], reverse=True)
        return history


student_history_service = StudentHistoryService()
