import logging
import os
import sys

# Add the parent directory to sys.path to allow importing app modules
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.core.security import get_password_hash  # noqa: E402
from app.db.session import SessionLocal  # noqa: E402
from app.models.assessment import Assessment  # noqa: E402
from app.models.user import User, UserRole  # noqa: E402

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def seed_assessments(db):
    # 1. PSS-10
    pss_10 = db.query(Assessment).filter(Assessment.type == "PSS-10").first()
    if not pss_10:
        logger.info("Seeding PSS-10 Assessment (Cohen et al., 1983)...")
        items = [
            {
                "id": "q1",
                "question": "En el último mes, ¿con qué frecuencia ha estado afectado por algo que ocurrió inesperadamente?",
                "scale_min": 0,
                "scale_max": 4,
                "scale_min_label": "Nunca",
                "scale_max_label": "Muy a menudo",
            },
            {
                "id": "q2",
                "question": "En el último mes, ¿con qué frecuencia ha sentido que no podía controlar las cosas importantes en su vida?",
                "scale_min": 0,
                "scale_max": 4,
                "scale_min_label": "Nunca",
                "scale_max_label": "Muy a menudo",
            },
            {
                "id": "q3",
                "question": "En el último mes, ¿con qué frecuencia se ha sentido nervioso o estresado?",
                "scale_min": 0,
                "scale_max": 4,
                "scale_min_label": "Nunca",
                "scale_max_label": "Muy a menudo",
            },
            {
                "id": "q4",
                "question": "En el último mes, ¿con qué frecuencia ha manejado con éxito los pequeños problemas irritantes de la vida?",
                "scale_min": 0,
                "scale_max": 4,
                "scale_min_label": "Nunca",
                "scale_max_label": "Muy a menudo",
            },
            {
                "id": "q5",
                "question": "En el último mes, ¿con qué frecuencia ha sentido que ha afrontado efectivamente los cambios importantes en su vida?",
                "scale_min": 0,
                "scale_max": 4,
                "scale_min_label": "Nunca",
                "scale_max_label": "Muy a menudo",
            },
            {
                "id": "q6",
                "question": "En el último mes, ¿con qué frecuencia ha estado seguro sobre su capacidad para manejar sus problemas personales?",
                "scale_min": 0,
                "scale_max": 4,
                "scale_min_label": "Nunca",
                "scale_max_label": "Muy a menudo",
            },
            {
                "id": "q7",
                "question": "En el último mes, ¿con qué frecuencia ha sentido que las cosas le van bien?",
                "scale_min": 0,
                "scale_max": 4,
                "scale_min_label": "Nunca",
                "scale_max_label": "Muy a menudo",
            },
            {
                "id": "q8",
                "question": "En el último mes, ¿con qué frecuencia ha sentido que no podía afrontar todas las cosas que tenía que hacer?",
                "scale_min": 0,
                "scale_max": 4,
                "scale_min_label": "Nunca",
                "scale_max_label": "Muy a menudo",
            },
            {
                "id": "q9",
                "question": "En el último mes, ¿con qué frecuencia ha podido controlar las dificultades de su vida?",
                "scale_min": 0,
                "scale_max": 4,
                "scale_min_label": "Nunca",
                "scale_max_label": "Muy a menudo",
            },
            {
                "id": "q10",
                "question": "En el último mes, ¿con qué frecuencia se ha sentido que tenía todo bajo control?",
                "scale_min": 0,
                "scale_max": 4,
                "scale_min_label": "Nunca",
                "scale_max_label": "Muy a menudo",
            },
        ]

        assessment = Assessment(
            title="Escala de Estrés Percibido (PSS-10)",
            description="Una medida psicológica clásica para evaluar la percepción de situaciones como estresantes.",
            type="PSS-10",
            items=items,
        )
        db.add(assessment)
        db.commit()

    # 2. GAD-7 (Anxiety)
    gad_7 = db.query(Assessment).filter(Assessment.type == "GAD-7").first()
    if not gad_7:
        logger.info("Seeding GAD-7 Assessment (Spitzer et al., 2006)...")
        items = [
            {
                "id": "q1",
                "question": "Sentirse nervioso/a, intranquilo/a o con los nervios de punta",
                "scale_min": 0,
                "scale_max": 3,
                "scale_min_label": "Nunca",
                "scale_max_label": "Casi todos los días",
            },
            {
                "id": "q2",
                "question": "No poder dejar de preocuparse o no poder controlar la preocupación",
                "scale_min": 0,
                "scale_max": 3,
                "scale_min_label": "Nunca",
                "scale_max_label": "Casi todos los días",
            },
            {
                "id": "q3",
                "question": "Preocuparse demasiado por diferentes cosas",
                "scale_min": 0,
                "scale_max": 3,
                "scale_min_label": "Nunca",
                "scale_max_label": "Casi todos los días",
            },
            {
                "id": "q4",
                "question": "Dificultad para relajarse",
                "scale_min": 0,
                "scale_max": 3,
                "scale_min_label": "Nunca",
                "scale_max_label": "Casi todos los días",
            },
            {
                "id": "q5",
                "question": "Estar tan inquieto/a que es difícil permanecer sentado/a",
                "scale_min": 0,
                "scale_max": 3,
                "scale_min_label": "Nunca",
                "scale_max_label": "Casi todos los días",
            },
            {
                "id": "q6",
                "question": "Molestarse o irritarse fácilmente",
                "scale_min": 0,
                "scale_max": 3,
                "scale_min_label": "Nunca",
                "scale_max_label": "Casi todos los días",
            },
            {
                "id": "q7",
                "question": "Tener miedo como si algo terrible fuera a suceder",
                "scale_min": 0,
                "scale_max": 3,
                "scale_min_label": "Nunca",
                "scale_max_label": "Casi todos los días",
            },
        ]

        assessment = Assessment(
            title="Escala de Ansiedad (GAD-7)",
            description="Herramienta breve para la detección de signos de ansiedad generalizada.",
            type="GAD-7",
            items=items,
        )
        db.add(assessment)
        db.commit()

    # 3. PHQ-9 (Depression)
    phq_9 = db.query(Assessment).filter(Assessment.type == "PHQ-9").first()
    if not phq_9:
        logger.info("Seeding PHQ-9 Assessment (Kroenke et al., 2001)...")
        items = [
            {
                "id": "q1",
                "question": "Tener poco interés o placer en hacer las cosas",
                "scale_min": 0,
                "scale_max": 3,
                "scale_min_label": "Nunca",
                "scale_max_label": "Casi todos los días",
            },
            {
                "id": "q2",
                "question": "Sentirse desanimado/a, deprimido/a o sin esperanza",
                "scale_min": 0,
                "scale_max": 3,
                "scale_min_label": "Nunca",
                "scale_max_label": "Casi todos los días",
            },
            {
                "id": "q3",
                "question": "Tener problemas para dormir o dormir demasiado",
                "scale_min": 0,
                "scale_max": 3,
                "scale_min_label": "Nunca",
                "scale_max_label": "Casi todos los días",
            },
            {
                "id": "q4",
                "question": "Sentirse cansado/a o tener poca energía",
                "scale_min": 0,
                "scale_max": 3,
                "scale_min_label": "Nunca",
                "scale_max_label": "Casi todos los días",
            },
            {
                "id": "q5",
                "question": "Tener poco apetito o comer en exceso",
                "scale_min": 0,
                "scale_max": 3,
                "scale_min_label": "Nunca",
                "scale_max_label": "Casi todos los días",
            },
            {
                "id": "q6",
                "question": "Sentir falta de amor propio",
                "scale_min": 0,
                "scale_max": 3,
                "scale_min_label": "Nunca",
                "scale_max_label": "Casi todos los días",
            },
            {
                "id": "q7",
                "question": "Tener dificultad para concentrarse en cosas, tales como leer el periódico o ver televisión",
                "scale_min": 0,
                "scale_max": 3,
                "scale_min_label": "Nunca",
                "scale_max_label": "Casi todos los días",
            },
            {
                "id": "q8",
                "question": "Moverse o hablar tan despacio que otras personas podrían haberlo notado",
                "scale_min": 0,
                "scale_max": 3,
                "scale_min_label": "Nunca",
                "scale_max_label": "Casi todos los días",
            },
            {
                "id": "q9",
                "question": "Pensamientos de que estaría mejor muerto/a o de lastimarse de alguna manera",
                "scale_min": 0,
                "scale_max": 3,
                "scale_min_label": "Nunca",
                "scale_max_label": "Casi todos los días",
            },
        ]

        assessment = Assessment(
            title="Cuestionario de Salud del Paciente (PHQ-9)",
            description="Evaluación estándar para monitorear la severidad de síntomas depresivos.",
            type="PHQ-9",
            items=items,
        )
        db.add(assessment)
        db.commit()


def seed_users(db):
    # Tutor/Professor
    tutor_email = "profesor@mentalink.edu"
    tutor = db.query(User).filter(User.email == tutor_email).first()
    if not tutor:
        logger.info(f"Creating Tutor user: {tutor_email}")
        tutor = User(
            full_name="Profesor Demo",
            email=tutor_email,
            hashed_password=get_password_hash("Profe123!"),
            role=UserRole.TUTOR,
            is_active=True,
        )
        db.add(tutor)
        db.commit()
    else:
        logger.info("Tutor user already exists.")

    # Psychologist
    psych_email = "psicologo@mentalink.edu"
    psych = db.query(User).filter(User.email == psych_email).first()
    if not psych:
        logger.info(f"Creating Psychologist user: {psych_email}")
        psych = User(
            full_name="Dr. Psicólogo",
            email=psych_email,
            hashed_password=get_password_hash("Psico123!"),
            role=UserRole.PSYCHOLOGIST,
            is_active=True,
        )
        db.add(psych)
        db.commit()
    else:
        logger.info("Psychologist user already exists.")


def main():
    db = SessionLocal()
    try:
        seed_assessments(db)
        seed_users(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()
