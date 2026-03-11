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
    # PSS-10 must have exactly 10 items per Cohen et al. (1983) standard.
    # If the record is missing or was previously seeded with fewer items, upsert it.
    pss_10_items = [
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

    if not pss_10:
        logger.info("Seeding PSS-10 Assessment (Cohen et al., 1983)...")
        assessment = Assessment(
            title="Escala de Estrés Percibido (PSS-10)",
            description="Una medida psicológica clásica para evaluar la percepción de situaciones como estresantes.",
            type="PSS-10",
            items=pss_10_items,
        )
        db.add(assessment)
        db.commit()
    elif len(pss_10.items) != 10:
        # Fix: existing record was seeded with fewer than 10 items — update to full standard scale.
        logger.warning(
            f"PSS-10 found with {len(pss_10.items)} items (expected 10). Updating to full scale..."
        )
        from sqlalchemy.orm.attributes import flag_modified

        pss_10.items = pss_10_items
        flag_modified(pss_10, "items")
        db.commit()
        logger.info("PSS-10 updated to 10 items successfully.")
    else:
        # Verify if content matches, if not update
        if pss_10.items != pss_10_items:
            logger.warning("PSS-10 items content mismatch. Updating...")
            from sqlalchemy.orm.attributes import flag_modified

            pss_10.items = pss_10_items
            flag_modified(pss_10, "items")
            db.commit()
        else:
            logger.info("PSS-10 already has 10 items. Skipping.")

    # 2. GAD-7 (Anxiety)
    gad_7 = db.query(Assessment).filter(Assessment.type == "GAD-7").first()
    gad_7_items = [
        {
            "id": "q1",
            "question": "En las últimas dos semanas, ¿con qué frecuencia se ha sentido nervioso/a, intranquilo/a o con los nervios de punta?",
            "scale_min": 0,
            "scale_max": 3,
            "scale_min_label": "Nunca",
            "scale_max_label": "Casi todos los días",
        },
        {
            "id": "q2",
            "question": "En las últimas dos semanas, ¿con qué frecuencia no ha podido dejar de preocuparse o controlar la preocupación?",
            "scale_min": 0,
            "scale_max": 3,
            "scale_min_label": "Nunca",
            "scale_max_label": "Casi todos los días",
        },
        {
            "id": "q3",
            "question": "En las últimas dos semanas, ¿con qué frecuencia se ha preocupado demasiado por diferentes cosas?",
            "scale_min": 0,
            "scale_max": 3,
            "scale_min_label": "Nunca",
            "scale_max_label": "Casi todos los días",
        },
        {
            "id": "q4",
            "question": "En las últimas dos semanas, ¿con qué frecuencia ha tenido dificultad para relajarse?",
            "scale_min": 0,
            "scale_max": 3,
            "scale_min_label": "Nunca",
            "scale_max_label": "Casi todos los días",
        },
        {
            "id": "q5",
            "question": "En las últimas dos semanas, ¿con qué frecuencia se ha sentido tan inquieto/a que es difícil permanecer sentado/a?",
            "scale_min": 0,
            "scale_max": 3,
            "scale_min_label": "Nunca",
            "scale_max_label": "Casi todos los días",
        },
        {
            "id": "q6",
            "question": "En las últimas dos semanas, ¿con qué frecuencia se ha molestado o irritado fácilmente?",
            "scale_min": 0,
            "scale_max": 3,
            "scale_min_label": "Nunca",
            "scale_max_label": "Casi todos los días",
        },
        {
            "id": "q7",
            "question": "En las últimas dos semanas, ¿con qué frecuencia ha tenido miedo como si algo terrible fuera a suceder?",
            "scale_min": 0,
            "scale_max": 3,
            "scale_min_label": "Nunca",
            "scale_max_label": "Casi todos los días",
        },
    ]

    if not gad_7:
        logger.info("Seeding GAD-7 Assessment (Spitzer et al., 2006)...")
        assessment = Assessment(
            title="Escala de Ansiedad (GAD-7)",
            description="Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado los siguientes problemas?",
            type="GAD-7",
            items=gad_7_items,
        )
        db.add(assessment)
        db.commit()
    elif len(gad_7.items) != 7:
        logger.warning(
            f"GAD-7 found with {len(gad_7.items)} items (expected 7). Restoring to standard..."
        )
        from sqlalchemy.orm.attributes import flag_modified

        gad_7.items = gad_7_items
        flag_modified(gad_7, "items")
        db.commit()
        logger.info("GAD-7 restored to standard 7 items.")
    else:
        # Verify if content matches, if not update
        if gad_7.items != gad_7_items:
            logger.warning("GAD-7 items content mismatch. Updating...")
            from sqlalchemy.orm.attributes import flag_modified

            gad_7.items = gad_7_items
            flag_modified(gad_7, "items")
            db.commit()
        else:
            logger.info("GAD-7 already has 7 items. Skipping.")

    # 3. PHQ-9 (Depression)
    phq_9 = db.query(Assessment).filter(Assessment.type == "PHQ-9").first()
    # PHQ-9 must have exactly 9 items per psychometric standards.
    phq_9_items = [
        {
            "id": "q1",
            "question": "En las últimas dos semanas, ¿con qué frecuencia ha tenido poco interés o placer en hacer las cosas?",
            "scale_min": 0,
            "scale_max": 3,
            "scale_min_label": "Nunca",
            "scale_max_label": "Casi todos los días",
        },
        {
            "id": "q2",
            "question": "En las últimas dos semanas, ¿con qué frecuencia se ha sentido desanimado/a, deprimido/a o sin esperanza?",
            "scale_min": 0,
            "scale_max": 3,
            "scale_min_label": "Nunca",
            "scale_max_label": "Casi todos los días",
        },
        {
            "id": "q3",
            "question": "En las últimas dos semanas, ¿con qué frecuencia ha tenido problemas para dormir o ha dormido demasiado?",
            "scale_min": 0,
            "scale_max": 3,
            "scale_min_label": "Nunca",
            "scale_max_label": "Casi todos los días",
        },
        {
            "id": "q4",
            "question": "En las últimas dos semanas, ¿con qué frecuencia se ha sentido cansado/a o con poca energía?",
            "scale_min": 0,
            "scale_max": 3,
            "scale_min_label": "Nunca",
            "scale_max_label": "Casi todos los días",
        },
        {
            "id": "q5",
            "question": "En las últimas dos semanas, ¿con qué frecuencia ha tenido poco apetito o ha comido en exceso?",
            "scale_min": 0,
            "scale_max": 3,
            "scale_min_label": "Nunca",
            "scale_max_label": "Casi todos los días",
        },
        {
            "id": "q6",
            "question": "En las últimas dos semanas, ¿con qué frecuencia ha sentido falta de amor propio o se ha sentido un fracaso?",
            "scale_min": 0,
            "scale_max": 3,
            "scale_min_label": "Nunca",
            "scale_max_label": "Casi todos los días",
        },
        {
            "id": "q7",
            "question": "En las últimas dos semanas, ¿con qué frecuencia ha tenido dificultad para concentrarse en cosas, tales como leer el periódico o ver televisión?",
            "scale_min": 0,
            "scale_max": 3,
            "scale_min_label": "Nunca",
            "scale_max_label": "Casi todos los días",
        },
        {
            "id": "q8",
            "question": "En las últimas dos semanas, ¿con qué frecuencia se ha movido o hablado tan despacio que otras personas podrían haberlo notado?",
            "scale_min": 0,
            "scale_max": 3,
            "scale_min_label": "Nunca",
            "scale_max_label": "Casi todos los días",
        },
        {
            "id": "q9",
            "question": "En las últimas dos semanas, ¿con qué frecuencia ha tenido pensamientos de que estaría mejor muerto/a o de lastimarse de alguna manera?",
            "scale_min": 0,
            "scale_max": 3,
            "scale_min_label": "Nunca",
            "scale_max_label": "Casi todos los días",
            "is_critical": True,
        },
    ]

    if not phq_9:
        logger.info("Seeding PHQ-9 Assessment (Kroenke et al., 2001)...")
        assessment = Assessment(
            title="Cuestionario de Salud del Paciente (PHQ-9)",
            description="Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado los siguientes problemas?",
            type="PHQ-9",
            items=phq_9_items,
        )
        db.add(assessment)
        db.commit()
    elif len(phq_9.items) != 9:
        logger.warning(
            f"PHQ-9 found with {len(phq_9.items)} items (expected 9). Restoring to standard..."
        )
        from sqlalchemy.orm.attributes import flag_modified

        phq_9.items = phq_9_items
        flag_modified(phq_9, "items")
        db.commit()
        logger.info("PHQ-9 restored to standard 9 items.")
    else:
        # Verify if content matches, if not update
        if phq_9.items != phq_9_items:
            logger.warning("PHQ-9 items content mismatch. Updating...")
            from sqlalchemy.orm.attributes import flag_modified

            phq_9.items = phq_9_items
            flag_modified(phq_9, "items")
            db.commit()
        else:
            logger.info("PHQ-9 already has 9 items. Skipping.")


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
            role=UserRole.ADMIN,
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


def seed_academic_profiles(db):
    from app.models.academic_profile import AcademicProfile

    # Add academic profile for some students (if any exist)
    students = db.query(User).filter(User.role == UserRole.STUDENT).all()
    for student in students:
        profile = (
            db.query(AcademicProfile)
            .filter(AcademicProfile.user_id == student.id)
            .first()
        )
        if not profile:
            logger.info(f"Creating AcademicProfile for student: {student.email}")
            profile = AcademicProfile(
                user_id=student.id,
                course="Ingeniería en Sistemas",
                scholarship_holder=True,
                tuition_fees_up_to_date=True,
                current_semester=4,
                units_approved=15,
                current_gpa=85.5,
                age_at_enrollment=19,
                gender=1,
            )
            db.add(profile)
    db.commit()


def main():
    db = SessionLocal()
    try:
        seed_assessments(db)
        seed_users(db)
        seed_academic_profiles(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()
