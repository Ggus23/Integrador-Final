from collections import Counter
from datetime import date, timedelta
from typing import Any, Dict, List

from sqlalchemy.orm import Session

from app import models


class EmotionalTrendsService:
    @staticmethod
    def get_emotion_distribution(
        db: Session, user_id: int, days: int = 30
    ) -> Dict[str, float]:
        """
        Calcula la distribución porcentual de emociones en los últimos N días.
        """
        start_date = date.today() - timedelta(days=days)
        entries = (
            db.query(models.EmotionalDiary)
            .filter(
                models.EmotionalDiary.user_id == user_id,
                models.EmotionalDiary.date >= start_date,
            )
            .all()
        )

        if not entries:
            return {}

        emotions = [
            e.emotion_ai or e.emotion for e in entries if e.emotion_ai or e.emotion
        ]
        counts = Counter(emotions)
        total = len(emotions)

        return {
            emotion: round(count / total * 100, 2) for emotion, count in counts.items()
        }

    @staticmethod
    def get_weekly_evolution(
        db: Session, user_id: int, weeks: int = 4
    ) -> List[Dict[str, Any]]:
        """
        Agrega el estado emocional predominante por semana.
        """
        evolution = []
        for i in range(weeks - 1, -1, -1):
            end_date = date.today() - timedelta(weeks=i)
            start_date = end_date - timedelta(days=7)

            entries = (
                db.query(models.EmotionalDiary)
                .filter(
                    models.EmotionalDiary.user_id == user_id,
                    models.EmotionalDiary.date >= start_date,
                    models.EmotionalDiary.date < end_date,
                )
                .all()
            )

            if not entries:
                evolution.append(
                    {"week": f"S-{i+1}", "emotion": "Sin datos", "score": 0}
                )
                continue

            emotions = [e.emotion_ai or e.emotion for e in entries]
            dominant = Counter(emotions).most_common(1)[0][0]
            avg_wellbeing = sum(e.wellbeing_level for e in entries) / len(entries)

            evolution.append(
                {
                    "week": f"S-{i+1}",
                    "start": start_date,
                    "end": end_date,
                    "emotion": dominant,
                    "avg_wellbeing": round(avg_wellbeing, 2),
                }
            )

        return evolution

    @staticmethod
    def calculate_ari(db: Session, user_id: int) -> Dict[str, Any]:
        """
        Calcula el Academic Risk Index (ARI) basado en la frecuencia de emociones negativas.
        ARI = 0.4*tristeza + 0.3*ansiedad + 0.2*frustracion + 0.1*caida_motivacion
        """
        start_date = date.today() - timedelta(days=30)
        entries = (
            db.query(models.EmotionalDiary)
            .filter(
                models.EmotionalDiary.user_id == user_id,
                models.EmotionalDiary.date >= start_date,
            )
            .all()
        )

        if not entries:
            return {
                "ari_score": 0.0,
                "risk_level": "Bajo Riesgo",
                "interpretation": "Cálculo basado en tendencias emocionales del último mes.",
            }

        total = len(entries)
        emotions = [e.emotion_ai for e in entries if e.emotion_ai]
        counts = Counter(emotions)

        # Frequencies (0.0 to 1.0)
        f_tristeza = counts.get("triste", 0) / total
        f_ansiedad = counts.get("ansioso", 0) / total
        f_frustracion = counts.get("frustrado", 0) / total

        # Caída de motivación (simplificado: si la emoción predominante cambió de algo positivo a neutral/negativo)
        # Aquí lo simplificamos a frecuencia de NO estar motivado o feliz si antes lo estaba (complejo de trackear sin más datos)
        # Usaremos frecuencia de baja motivación si existe el label
        f_baja_motivacion = 1.0 - (counts.get("motivado", 0) / total)

        ari_score = (
            0.4 * f_tristeza
            + 0.3 * f_ansiedad
            + 0.2 * f_frustracion
            + 0.1 * f_baja_motivacion
        )

        level = "Bajo Riesgo"
        if ari_score > 0.6:
            level = "Alto Riesgo"
        elif ari_score > 0.3:
            level = "Riesgo Medio"

        return {
            "ari_score": round(ari_score, 2),
            "risk_level": level,
            "interpretation": "Cálculo basado en tendencias emocionales del último mes.",
        }


emotional_trends_service = EmotionalTrendsService()
