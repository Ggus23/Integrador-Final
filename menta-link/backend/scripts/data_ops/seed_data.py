import logging
import os
import sys

# Add the parent directory to sys.path to allow importing app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

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
            "text": "En el último mes, ¿con qué frecuencia ha estado afectado por algo que ocurrió inesperadamente?",
            "scale_min": 0,
            "scale_max": 4,
            "scale_min_label": "Nunca",
            "scale_max_label": "Muy a menudo",
        },
        {
            "id": "q2",
            "text": "En el último mes, ¿con qué frecuencia ha sentido que no podía controlar las cosas importantes en su vida?",
            "scale_min": 0,
            "scale_max": 4,
            "scale_min_label": "Nunca",
            "scale_max_label": "Muy a menudo",
        },
        {
            "id": "q3",
            "text": "En el último mes, ¿con qué frecuencia se ha sentido nervioso o estresado?",
            "scale_min": 0,
            "scale_max": 4,
            "scale_min_label": "Nunca",
            "scale_max_label": "Muy a menudo",
        },
        {
            "id": "q4",
            "text": "En el último mes, ¿con qué frecuencia ha manejado con éxito los pequeños problemas irritantes de la vida?",
            "scale_min": 0,
            "scale_max": 4,
            "scale_min_label": "Nunca",
            "scale_max_label": "Muy a menudo",
        },
        {
            "id": "q5",
            "text": "En el último mes, ¿con qué frecuencia ha sentido que ha afrontado efectivamente los cambios importantes en su vida?",
            "scale_min": 0,
            "scale_max": 4,
            "scale_min_label": "Nunca",
            "scale_max_label": "Muy a menudo",
        },
        {
            "id": "q6",
            "text": "En el último mes, ¿con qué frecuencia ha estado seguro sobre su capacidad para manejar sus problemas personales?",
            "scale_min": 0,
            "scale_max": 4,
            "scale_min_label": "Nunca",
            "scale_max_label": "Muy a menudo",
        },
        {
            "id": "q7",
            "text": "En el último mes, ¿con qué frecuencia ha sentido que las cosas le van bien?",
            "scale_min": 0,
            "scale_max": 4,
            "scale_min_label": "Nunca",
            "scale_max_label": "Muy a menudo",
        },
        {
            "id": "q8",
            "text": "En el último mes, ¿con qué frecuencia ha sentido que no podía afrontar todas las cosas que tenía que hacer?",
            "scale_min": 0,
            "scale_max": 4,
            "scale_min_label": "Nunca",
            "scale_max_label": "Muy a menudo",
        },
        {
            "id": "q9",
            "text": "En el último mes, ¿con qué frecuencia ha podido controlar las dificultades de su vida?",
            "scale_min": 0,
            "scale_max": 4,
            "scale_min_label": "Nunca",
            "scale_max_label": "Muy a menudo",
        },
        {
            "id": "q10",
            "text": "En el último mes, ¿con qué frecuencia se ha sentido que tenía todo bajo control?",
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
            "text": "En las últimas dos semanas, ¿con qué frecuencia se ha sentido nervioso/a, intranquilo/a o con los nervios de punta?",
            "scale_min": 0,
            "scale_max": 3,
            "scale_min_label": "Nunca",
            "scale_max_label": "Casi todos los días",
        },
        {
            "id": "q2",
            "text": "En las últimas dos semanas, ¿con qué frecuencia no ha podido dejar de preocuparse o controlar la preocupación?",
            "scale_min": 0,
            "scale_max": 3,
            "scale_min_label": "Nunca",
            "scale_max_label": "Casi todos los días",
        },
        {
            "id": "q3",
            "text": "En las últimas dos semanas, ¿con qué frecuencia se ha preocupado demasiado por diferentes cosas?",
            "scale_min": 0,
            "scale_max": 3,
            "scale_min_label": "Nunca",
            "scale_max_label": "Casi todos los días",
        },
        {
            "id": "q4",
            "text": "En las últimas dos semanas, ¿con qué frecuencia ha tenido dificultad para relajarse?",
            "scale_min": 0,
            "scale_max": 3,
            "scale_min_label": "Nunca",
            "scale_max_label": "Casi todos los días",
        },
        {
            "id": "q5",
            "text": "En las últimas dos semanas, ¿con qué frecuencia se ha sentido tan inquieto/a que es difícil permanecer sentado/a?",
            "scale_min": 0,
            "scale_max": 3,
            "scale_min_label": "Nunca",
            "scale_max_label": "Casi todos los días",
        },
        {
            "id": "q6",
            "text": "En las últimas dos semanas, ¿con qué frecuencia se ha molestado o irritado fácilmente?",
            "scale_min": 0,
            "scale_max": 3,
            "scale_min_label": "Nunca",
            "scale_max_label": "Casi todos los días",
        },
        {
            "id": "q7",
            "text": "En las últimas dos semanas, ¿con qué frecuencia ha tenido miedo como si algo terrible fuera a suceder?",
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
            "text": "En las últimas dos semanas, ¿con qué frecuencia ha tenido poco interés o placer en hacer las cosas?",
            "scale_min": 0,
            "scale_max": 3,
            "scale_min_label": "Nunca",
            "scale_max_label": "Casi todos los días",
        },
        {
            "id": "q2",
            "text": "En las últimas dos semanas, ¿con qué frecuencia se ha sentido desanimado/a, deprimido/a o sin esperanza?",
            "scale_min": 0,
            "scale_max": 3,
            "scale_min_label": "Nunca",
            "scale_max_label": "Casi todos los días",
        },
        {
            "id": "q3",
            "text": "En las últimas dos semanas, ¿con qué frecuencia ha tenido problemas para dormir o ha dormido demasiado?",
            "scale_min": 0,
            "scale_max": 3,
            "scale_min_label": "Nunca",
            "scale_max_label": "Casi todos los días",
        },
        {
            "id": "q4",
            "text": "En las últimas dos semanas, ¿con qué frecuencia se ha sentido cansado/a o con poca energía?",
            "scale_min": 0,
            "scale_max": 3,
            "scale_min_label": "Nunca",
            "scale_max_label": "Casi todos los días",
        },
        {
            "id": "q5",
            "text": "En las últimas dos semanas, ¿con qué frecuencia ha tenido poco apetito o ha comido en exceso?",
            "scale_min": 0,
            "scale_max": 3,
            "scale_min_label": "Nunca",
            "scale_max_label": "Casi todos los días",
        },
        {
            "id": "q6",
            "text": "En las últimas dos semanas, ¿con qué frecuencia ha sentido falta de amor propio o se ha sentido un fracaso?",
            "scale_min": 0,
            "scale_max": 3,
            "scale_min_label": "Nunca",
            "scale_max_label": "Casi todos los días",
        },
        {
            "id": "q7",
            "text": "En las últimas dos semanas, ¿con qué frecuencia ha tenido dificultad para concentrarse en cosas, tales como leer el periódico o ver televisión?",
            "scale_min": 0,
            "scale_max": 3,
            "scale_min_label": "Nunca",
            "scale_max_label": "Casi todos los días",
        },
        {
            "id": "q8",
            "text": "En las últimas dos semanas, ¿con qué frecuencia se ha movido o hablado tan despacio que otras personas podrían haberlo notado?",
            "scale_min": 0,
            "scale_max": 3,
            "scale_min_label": "Nunca",
            "scale_max_label": "Casi todos los días",
        },
        {
            "id": "q9",
            "text": "En las últimas dos semanas, ¿con qué frecuencia ha tenido pensamientos de que estaría mejor muerto/a o de lastimarse de alguna manera?",
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
    import random
    from app.models.academic_profile import AcademicProfile
    from app.models.risk_summary import RiskSummary
    from app.ml.risk_classifier import risk_classifier

    students = db.query(User).filter(User.role == UserRole.STUDENT).all()
    total = len(students)
    for i, student in enumerate(students):
        profile = (
            db.query(AcademicProfile)
            .filter(AcademicProfile.user_id == student.id)
            .first()
        )
        if not profile:
            logger.info(f"Creating AcademicProfile for student: {student.email}")

            risk_bucket = "High" if i < total * 0.15 else "Medium" if i < total * 0.40 else "Low"

            if risk_bucket == "High":
                gpa = random.uniform(40.0, 59.9)
                semester = random.randint(2, 6)
                units_approved = max(1, semester * 5 - random.randint(5, 10))
                scholarship = random.choice([False, False, True])
                tuition_ok = random.choice([True, False, False])
            elif risk_bucket == "Medium":
                gpa = random.uniform(60.0, 79.9)
                semester = random.randint(2, 8)
                units_approved = max(1, semester * 5 - random.randint(2, 5))
                scholarship = random.choice([False, True, True])
                tuition_ok = random.choice([True, True, False])
            else:
                gpa = random.uniform(80.0, 98.0)
                semester = random.randint(3, 9)
                units_approved = semester * 5 - random.randint(0, 2)
                scholarship = random.choice([True, False, False])
                tuition_ok = True

            profile = AcademicProfile(
                user_id=student.id,
                course=random.choice(["Ingeniería en Sistemas", "Psicología", "Medicina"]),
                scholarship_holder=scholarship,
                tuition_fees_up_to_date=tuition_ok,
                current_semester=semester,
                units_approved=units_approved,
                current_gpa=round(gpa, 1),
                age_at_enrollment=random.randint(18, 25),
                gender=random.choice([0, 1]),
                hito2_procesual=round(min(15.0, (gpa / 100.0) * 15.0 + random.uniform(-1, 1)), 1),
                hito2_nota=round(min(10.0, (gpa / 100.0) * 10.0 + random.uniform(-1, 0.5)), 1),
                hito3_procesual=round(min(15.0, (gpa / 100.0) * 15.0 + random.uniform(-1, 1)), 1),
                hito3_nota=round(min(10.0, (gpa / 100.0) * 10.0 + random.uniform(-1, 0.5)), 1),
                hito4_procesual=round(min(15.0, (gpa / 100.0) * 15.0 + random.uniform(-1, 1)), 1),
                hito4_nota=round(min(10.0, (gpa / 100.0) * 10.0 + random.uniform(-1, 0.5)), 1),
                hito5_procesual=round(min(15.0, (gpa / 100.0) * 15.0 + random.uniform(-1, 1)), 1),
                hito5_nota=round(min(10.0, (gpa / 100.0) * 10.0 + random.uniform(-1, 0.5)), 1),
            )
            db.add(profile)

            risk_summary = (
                db.query(RiskSummary)
                .filter(RiskSummary.user_id == student.id)
                .first()
            )
            if not risk_summary:
                dropout_prob = random.uniform(0.60, 0.88) if risk_bucket == "High" else random.uniform(0.20, 0.45) if risk_bucket == "Medium" else random.uniform(0.02, 0.12)
                risk_summary = RiskSummary(
                    user_id=student.id,
                    current_risk_level=risk_bucket,
                    prediction_confidence=round(random.uniform(0.82, 0.98), 2),
                    dropout_probability=round(dropout_prob, 2),
                    dropout_risk=risk_bucket,
                )
                db.add(risk_summary)
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
