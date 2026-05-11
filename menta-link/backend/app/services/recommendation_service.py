import json
import logging
from typing import Any, List, Optional

from google import genai
from google.genai import types

from app.core.config import settings
from app.core.constants import RiskLevel

logger = logging.getLogger(__name__)

class RecommendationService:

    @staticmethod
    def _get_fallback_recommendations(risk_level: RiskLevel) -> List[dict]:
        """Simple fallback if LLM fails, now structured with 4 items and more types."""
        recs = {
            RiskLevel.LOW: [
                {"action_type": "BREATHING_EXERCISE", "metadata": {"description": "Mantén tus hábitos saludables de sueño y practica respiración profunda en momentos de tensión."}},
                {"action_type": "JOURNALING_PROMPT", "metadata": {"description": "Escribir sobre tus logros diarios te ayudará a mantener el enfoque positivo.", "prompt": "¿Qué fue lo mejor que te pasó hoy?"}},
                {"action_type": "READ_MORE", "metadata": {"title": "Actividad Física", "description": "Realizar al menos 30 minutos de ejercicio ligero ayuda a mantener el equilibrio emocional."}},
                {"action_type": "COGNITIVE_REFRAME", "metadata": {"description": "Revisa tus logros semanales en lugar de enfocarte solo en lo pendiente.", "tasks": [
                    {"id": "1", "text": "Listar 3 cosas logradas hoy", "completed": False},
                    {"id": "2", "text": "Reconocer el esfuerzo invertido", "completed": False}
                ]}},
            ],
            RiskLevel.MEDIUM: [
                {"action_type": "BREATHING_EXERCISE", "metadata": {"description": "Usa técnicas de gestión del tiempo como Pomodoro y dedica 15 min diarios a la meditación."}},
                {"action_type": "COGNITIVE_REFRAME", "metadata": {"description": "Cuestiona tus pensamientos de carga académica excesiva.", "tasks": [
                    {"id": "1", "text": "Identificar pensamiento estresante", "completed": False},
                    {"id": "2", "text": "Buscar evidencia objetiva", "completed": False},
                    {"id": "3", "text": "Generar pensamiento alternativo", "completed": False}
                ]}},
                {"action_type": "JOURNALING_PROMPT", "metadata": {"description": "Tómate un momento para escribir y liberar la carga de tus preocupaciones diarias.", "prompt": "Escribe 3 cosas que te están generando presión ahora mismo y cómo podrías abordarlas."}},
                {"action_type": "BREATHING_EXERCISE", "metadata": {"description": "Prueba la técnica de relajación muscular progresiva antes de dormir."}},
            ],
            RiskLevel.HIGH: [
                {"action_type": "READ_MORE", "metadata": {"title": "Apoyo Profesional", "description": "Te sugerimos acudir al servicio de bienestar para orientación profesional.", "link": "/appointments"}},
                {"action_type": "JOURNALING_PROMPT", "metadata": {"description": "Llevar un registro de tus niveles de ansiedad te ayudará a prever crisis.", "prompt": "¿En qué momentos del día sientes que el estrés aumenta?"}},
                {"action_type": "COGNITIVE_REFRAME", "metadata": {"description": "Cuestiona la idea de que 'todo debe ser perfecto'.", "tasks": [
                    {"id": "1", "text": "Aceptar que el aprendizaje es un proceso", "completed": False},
                    {"id": "2", "text": "Permitirse cometer errores", "completed": False}
                ]}},
                {"action_type": "BREATHING_EXERCISE", "metadata": {"description": "Realiza actividad física ligera y practica la técnica 4-7-8 para liberar tensión."}},
            ],
            RiskLevel.CRITICAL: [
                {"action_type": "READ_MORE", "metadata": {"title": "⚠️ ATENCIÓN INMEDIATA", "description": "Por favor, solicita una cita de urgencia en el gabinete psicológico.", "link": "/appointments"}},
                {"action_type": "READ_MORE", "metadata": {"title": "Líneas de Ayuda", "description": "Comunícate de inmediato con el equipo de bienestar universitario o una persona de confianza."}},
                {"action_type": "JOURNALING_PROMPT", "metadata": {"description": "En este momento crítico, es vital validar tus sentimientos sin juzgarlos.", "prompt": "¿Qué necesitas escuchar de ti mismo en este momento de crisis?"}},
                {"action_type": "BREATHING_EXERCISE", "metadata": {"description": "Utiliza la respiración de caja (4-4-4-4) para estabilizar tu sistema nervioso ahora mismo."}},
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
    ) -> List[dict]:
        """
        Returns an ordered, deduplicated list of structured recommendations.
        Uses LLM ONLY for PSS-10 results.
        """
        if assessment_type != "PSS-10":
            return []

        prompt = f"""
Rol: Asistente de bienestar estudiantil experto en intervenciones breves.
Contexto: El estudiante completó el PSS-10 con nivel de estrés: {risk_level.value}.

Tarea: Genera EXACTAMENTE 4 recomendaciones estructuradas.
Debes usar obligatoriamente estos tipos de acción:
1. "BREATHING_EXERCISE": Para relajación física.
2. "COGNITIVE_REFRAME": Para manejar pensamientos estresantes.
3. "JOURNALING_PROMPT": Para escritura reflexiva (pide al usuario que escriba algo).
4. "READ_MORE": Para consejos generales o derivación.

Reglas:
- Sé empático y breve, pero proporciona contexto útil (no uses menos de 10 palabras en la descripción).
- Si el nivel es High o Critical, la primera acción DEBE ser "READ_MORE" sugiriendo el gabinete psicológico.
- Devuelve ÚNICAMENTE un JSON con este formato exacto:
{{
  "recommendations": [
    {{
      "action_type": "BREATHING_EXERCISE",
      "metadata": {{ "description": "descripción de al menos 10 palabras" }}
    }},
    {{
      "action_type": "JOURNALING_PROMPT",
      "metadata": {{ "description": "por qué escribir esto", "prompt": "pregunta abierta" }}
    }},
    {{
      "action_type": "COGNITIVE_REFRAME",
      "metadata": {{ 
         "description": "qué pensamiento cuestionar",
         "tasks": [
           {{"id": "t1", "text": "Tarea 1", "completed": false}},
           {{"id": "t2", "text": "Tarea 2", "completed": false}}
         ]
      }}
    }},
    {{
      "action_type": "READ_MORE",
      "metadata": {{ "title": "Título", "description": "Consejo", "link": "/opcional" }}
    }}
  ]
}}
"""

        try:
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt + '\nDevuelve SOLO el JSON, sin bloques de código markdown.\n{"recommendations": [ ... ]}',
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                ),
            )
            raw_text = response.text.strip()
            # Remove potential markdown block wrappers
            if raw_text.startswith("```"):
                raw_text = raw_text.split("\n", 1)[-1]
            if raw_text.startswith("json"):
                raw_text = raw_text[4:].strip()
            if raw_text.endswith("```"):
                raw_text = raw_text.rsplit("\n", 1)[0].strip()

            data = json.loads(raw_text)
            recommendations_llm = data.get("recommendations", [])
            if not isinstance(recommendations_llm, list) or len(recommendations_llm) == 0:
                raise ValueError("Malformed response")
            return recommendations_llm
        except Exception as e:
            logger.error(f"Error LLM structured: {e}")
            return RecommendationService._get_fallback_recommendations(risk_level)

recommendation_service = RecommendationService()
