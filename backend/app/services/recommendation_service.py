import json
import logging
from typing import Any, List, Optional

from app.core.constants import RiskLevel
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

# ── Base recommendations by emotional risk level ──────────────────────────────
_BASE: dict[str, List[str]] = {
    RiskLevel.LOW.value: [
        "Mantén tus rutinas actuales de sueño y actividad física.",
        "Practica ejercicios de respiración profunda (inhalar 4 s, exhalar 6 s) "
        "durante momentos de tensión.",
        "Estructura tus sesiones de estudio con intervalos regulares: "
        "45 minutos de trabajo seguidos de 10 de desconexión.",
        "Limita el uso de pantallas al menos 30 minutos antes de dormir.",
    ],
    RiskLevel.MEDIUM.value: [
        "Considera hablar con un tutor académico o consejero de tu facultad "
        "para revisar tu carga curricular.",
        "Implementa técnicas de gestión del tiempo (ej. método Pomodoro) "
        "para reducir la sensación de acumulación.",
        "Dedica al menos 20 minutos al día a una actividad que disfrutes "
        "fuera del ámbito académico.",
        "Practica técnicas de mindfulness o meditación guiada (5-10 minutos diarios) "
        "para bajar el nivel de estrés percibido.",
        "Busca el apoyo de compañeros de estudio para distribuir la carga académica.",
    ],
    RiskLevel.HIGH.value: [
        "Te recomendamos solicitar una cita con el gabinete psicológico "
        "a través de la plataforma.",
        "Comunícate con el servicio de bienestar universitario para recibir "
        "orientación profesional personalizada.",
        "Reduce temporalmente compromisos extracurriculares para liberar carga cognitiva.",
        "Habla con un familiar o persona de confianza sobre cómo te sientes; "
        "compartir la carga emocional ayuda significativamente.",
        "Evita el aislamiento: mantén contacto social aunque sea breve cada día.",
    ],
    RiskLevel.CRITICAL.value: [
        "⚠️ Es importante que hables con un profesional de salud mental "
        "lo antes posible. Puedes solicitar una cita de emergencia en el "
        "gabinete psicológico.",
        "Si en cualquier momento sientes que necesitas apoyo inmediato, "
        "comunícate al servicio de crisis de tu institución o llama a una "
        "línea de ayuda local.",
        "No estás solo/a. El equipo de psicología está disponible para escucharte.",
    ],
}

# ── Dropout-specific recommendations by risk band ─────────────────────────────
_DROPOUT: dict[str, List[str]] = {
    "low": [
        "Tu probabilidad de abandono académico es baja. ¡Sigue así!",
    ],
    "medium": [
        "Revisa con tu asesor académico si tu carga de materias es manejable "
        "para el semestre actual.",
        "Evalúa si existe alguna materia que puedas postergar para reducir la presión.",
        "Consulta las becas o apoyos económicos disponibles si el factor financiero "
        "te genera estrés.",
    ],
    "high": [
        "El sistema detectó un riesgo elevado de abandono académico. "
        "Te recomendamos agendar una reunión con tu coordinador de carrera.",
        "Analiza con el equipo de bienestar universitario si existe un plan de "
        "acompañamiento académico disponible para tu situación.",
        "Recuerda que solicitar apoyo a tiempo es una decisión académicamente "
        "inteligente, no una señal de debilidad.",
    ],
}


def _deduplicate(items: List[str]) -> List[str]:
    """Remove duplicates preserving insertion order."""
    seen: set[str] = set()
    result: List[str] = []
    for item in items:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result


class RecommendationService:

    @staticmethod
    def _get_fallback_recommendations(risk_level: RiskLevel) -> List[str]:
        """Simple fallback if LLM fails."""
        recs = {
            RiskLevel.LOW: [
                "Mantén tus hábitos saludables de sueño y alimentación.",
                "Dedica tiempo a tus hobbies fuera de la universidad.",
                "Organiza tus sesiones de estudio con descansos regulares.",
                "Practica respiración profunda en momentos de tensión.",
            ],
            RiskLevel.MEDIUM: [
                "Considera usar técnicas de gestión del tiempo como Pomodoro.",
                "Habla con un amigo o familiar sobre tu carga académica.",
                "Dedica 15 minutos diarios a la meditación o mindfulness.",
                "Busca apoyo en grupos de estudio para compartir tareas.",
            ],
            RiskLevel.HIGH: [
                "Te sugerimos acudir al servicio de bienestar para orientación profesional.",
                "Prioriza tus tareas y delega o pospone lo que no sea urgente.",
                "Asegúrate de mantener contacto social y no aislarte del entorno.",
                "Realiza actividad física ligera para liberar tensión acumulada.",
            ],
            RiskLevel.CRITICAL: [
                "⚠️ Por favor, solicita una cita de urgencia en el gabinete psicológico.",
                "Comunícate de inmediato con el equipo de bienestar universitario.",
                "Busca el apoyo de una persona de confianza ahora mismo.",
                "No estás solo/a, el equipo de salud mental está para ayudarte.",
            ],
        }
        return recs.get(risk_level, recs[RiskLevel.LOW])

    @staticmethod
    async def generate(
        risk_level: RiskLevel,
        dropout_probability: float,
        dropout_risk: str,
        assessment_type: str = "Desconocido",
        phq9_q6: bool = False,
        phq9_q9: bool = False,
        avg_mood: float = 0.0,
        bad_days: int = 0,
        avg_pressure: float = 0.0,
        acad_profile: Optional[Any] = None,
    ) -> List[str]:
        """
        Returns an ordered, deduplicated list of recommendation strings.
        Uses LLM ONLY for PSS-10 results.
        Focuses ONLY on the current assessment results as per user request.
        """
        if assessment_type != "PSS-10":
            return []  # Only PSS-10 provides automated recommendations currently

        # ── LLM Logic for PSS-10 ──────────────────────────────────────────────
        prompt = f"""
Rol: Asistente de bienestar estudiantil
Especialidad: Gestión del estrés académico (Basado en PSS-10)

Contexto: El estudiante ha completado la escala de estrés percibido (PSS-10) con el siguiente resultado:
- Nivel de Estrés Percibido: {risk_level.value}

Tarea: Proporciona EXACTAMENTE 4 recomendaciones prácticas y breves para manejar este nivel de estrés.
Reglas:
1. Enfócate exclusivamente en el bienestar y manejo del estrés.
2. Sé empático, amable y breve (máximo 15 palabras por recomendación).
3. NUNCA diagnostiques ni hables en términos clínicos.
4. Si el nivel es High o Critical, la primera recomendación DEBE ser sugerir una visita al gabinete psicológico.
5. Devuelve ÚNICAMENTE un objeto JSON con la clave "recommendations" (arreglo de strings).

Formato: {{"recommendations": ["rec1", "rec2", "rec3", "rec4"]}}
"""

        try:
            client = genai.Client(api_key="AIzaSyCA7xyOqhxBb-dFgojdhaorJAqCCgrrpXQ")
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                ),
            )
            data = json.loads(response.text)
            recommendations_llm = data.get("recommendations", [])
            if (
                not isinstance(recommendations_llm, list)
                or len(recommendations_llm) == 0
            ):
                raise ValueError("Malformed response")
            return _deduplicate(recommendations_llm)
        except Exception as e:
            logger.error(f"Error LLM: {e}")
            return RecommendationService._get_fallback_recommendations(risk_level)


recommendation_service = RecommendationService()
