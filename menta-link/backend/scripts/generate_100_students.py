"""
Script para generar 100 estudiantes de prueba con datos completos.
Distribución: 33 Bajo, 33 Medio, 34 Alto riesgo.

Cada estudiante incluye:
- Tests: PSS-10, GAD-7, PHQ-9 (varias tomas cada uno)
- Check-ins emocionales (30 días)
- Diario emocional (15 entradas)
- Notas académicas H2-H5 (procesual 10 + continua 15) por materia
- Perfil académico, récord, riesgo y consentimiento
"""

import os
import random
import sys
from datetime import datetime, timedelta

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.db.session import SessionLocal
from app.models.academic_profile import AcademicProfile
from app.models.academic_record import AcademicRecord
from app.models.academic_subject_grade import AcademicSubjectGrade
from app.models.assessment import Assessment
from app.models.assessment_response import AssessmentResponse
from app.models.consent import Consent
from app.models.emotional_checkin import EmotionalCheckin
from app.models.emotional_diary import EmotionalDiary
from app.models.risk_summary import RiskSummary
from app.models.user import User, UserRole

PASSWORD = "Estudiante123!"
PASSWORD_HASH = get_password_hash(PASSWORD)

NOMBRES = [
    "Valeria Quispe",
    "Fernanda Flores",
    "Camila Mamani",
    "Gabriela Condori",
    "Natalia Rojas",
    "Andrea Vargas",
    "Sofia Castro",
    "Luciana Ramos",
    "Daniela Torrico",
    "Mariana Siles",
    "Claudia Mendoza",
    "Alejandra Ortiz",
    "Isabela Guzman",
    "Valentina Rocha",
    "Paulina Camacho",
    "Lucía Carvajal",
    "Elena Miranda",
    "Carmen Gutierrez",
    "Teresa Villarroel",
    "Patricia Suarez",
    "Adriana Pinto",
    "Beatriz Blanco",
    "Silvia Marin",
    "Gloria Herrera",
    "Alicia Medina",
    "Alejandro Gómez",
    "Carlos Mamani",
    "Sebastian Flores",
    "Mateo Quispe",
    "Javier Condori",
    "Mauricio Rojas",
    "Rodrigo Vargas",
    "Daniel Castro",
    "Nicolas Ramos",
    "Gabriel Torrico",
    "Diego Siles",
    "Hugo Mendoza",
    "Adrian Ortiz",
    "Fernando Guzman",
    "Bruno Rocha",
    "Alvaro Camacho",
    "Andres Carvajal",
    "Jose Miranda",
    "Luis Gutierrez",
    "Ramiro Villarroel",
    "Mario Suarez",
    "Ricardo Pinto",
    "Jorge Blanco",
    "Walter Marin",
    "Oscar Herrera",
    "Ana Beltran",
    "Luisina Ponce",
    "Rosa Barrientos",
    "Pedro Castillo",
    "Santiago Lima",
    "Iván Morales",
    "Paola Céspedes",
    "Ronald Vargas",
    "Diego Peredo",
    "Carla Arce",
    "Marcelo Ríos",
    "Ximena Parada",
    "Felipe Vargas",
    "Lorena Suárez",
    "Pablo Cortés",
    "Natalia Paz",
    "Andrés Soliz",
    "María Roca",
    "Tomás Cardozo",
    "Regina Ferrufino",
    "Jorge Antezana",
    "Cecilia Landívar",
    "Emilio Cabrera",
    "Daniela Ribera",
    "Víctor Hugo Vaca",
    "Ángeles Pinto",
    "Gustavo Navarro",
    "Sandra Velasco",
    "Ramiro Vargas",
    "Soledad Durán",
    "Fabricio Morales",
    "Julia Campos",
    "Oliver Saavedra",
    "Tatiana Vargas",
    "Mónica Ballón",
    "Eduardo Hurtado",
    "Lourdes Aguilar",
    "Ignacio Pereira",
    "Fabiola Guzmán",
    "Federico López",
    "Helena Arteaga",
    "Maximiliano García",
    "Bárbara Ríos",
    "Emilio Vaca",
    "Graciela Toro",
    "Luis Fernando Campos",
    "Ruth Castellón",
    "Milton Rojas",
    "Carmen Rosa Panozo",
    "Diego Fernández",
    "Rocío Rocha",
    "Víctor Jiménez",
    "Yesenia Vargas",
    "Juan Carlos Pinto",
]

COURSES = ["Ingeniería en Sistemas", "Psicología", "Medicina"]

SUBJECTS_BY_COURSE = {
    "Ingeniería en Sistemas": [
        "Introducción a la Programación",
        "Cálculo I",
        "Álgebra Lineal",
        "Estructura de Datos",
        "Base de Datos I",
        "Análisis y Diseño de Sistemas",
        "Sistemas Operativos",
        "Física I",
    ],
    "Psicología": [
        "Introducción a la Psicología",
        "Neuroanatomía",
        "Psicología del Desarrollo",
        "Psicobiología",
        "Psicología Clínica",
        "Psicopatología I",
        "Métodos de Investigación",
        "Procesos Cognitivos",
    ],
    "Medicina": [
        "Anatomía Humana",
        "Histología",
        "Bioquímica Médica",
        "Fisiología I",
        "Embriología",
        "Patología General",
        "Farmacología Básica",
        "Semiología Médica",
    ],
}

EMOTION_COLORS = {
    "feliz": "#10b981",
    "motivado": "#8b5cf6",
    "neutral": "#6b7280",
    "ansioso": "#f59e0b",
    "triste": "#3b82f6",
    "frustrado": "#ef4444",
}

RECOMMENDATIONS = {
    "Low": [
        "Mantén tu rutina actual de estudio y autocuidado.",
        "Duerme entre 7 y 8 horas diarias para consolidar el aprendizaje.",
        "Participa en actividades recreativas extracurriculares los fines de semana.",
        "Continúa utilizando los canales normales de consulta con tus docentes.",
    ],
    "Medium": [
        "Organiza tus tiempos con un calendario académico semanal para evitar sobrecargas.",
        "Practica técnicas de respiración profunda o meditación de 5 minutos antes de tus exámenes.",
        "Considera hablar con un tutor de las materias que sientas más complejas.",
        "Duerme al menos 6 a 7 horas y evita estudiar toda la noche antes de una evaluación.",
    ],
    "High": [
        "Agenda una cita prioritaria con el gabinete de psicología en el campus o virtualmente.",
        "Solicita apoyo académico personalizado y tutorías para tus materias de mayor riesgo.",
        "Reduce las horas de estudio nocturno tardío y prioriza periodos cortos de estudio activo con pausas.",
        "Habla con tus docentes o director de carrera sobre tu situación actual para buscar flexibilidad.",
    ],
}


def generate_survey_answers(items, target_total, scale_max=4, reverse_ids=None):
    """Genera respuestas para un assessment buscando un score total aproximado."""
    if reverse_ids is None:
        reverse_ids = set()
    answers = {}
    item_ids = [item["id"] for item in items]
    n = len(item_ids)
    base = target_total // n
    remainder = target_total % n
    for i, item_id in enumerate(item_ids):
        val = base + (1 if i < remainder else 0)
        val = max(0, min(scale_max, val))
        answers[item_id] = val
    actual = 0
    for item_id in item_ids:
        v = answers[item_id]
        actual += (scale_max - v) if item_id in reverse_ids else v
    diff = target_total - actual
    attempts = 0
    while diff != 0 and attempts < 200:
        item_id = random.choice(item_ids)
        v = answers[item_id]
        if diff > 0:
            if item_id in reverse_ids:
                if v > 0:
                    answers[item_id] -= 1
                    diff -= 1
            else:
                if v < scale_max:
                    answers[item_id] += 1
                    diff -= 1
        else:
            if item_id in reverse_ids:
                if v < scale_max:
                    answers[item_id] += 1
                    diff += 1
            else:
                if v > 0:
                    answers[item_id] -= 1
                    diff += 1
        attempts += 1
    return answers


def create_student(db: Session, idx: int, risk_label: str, names: list):
    now = datetime.utcnow()
    full_name = names.pop()
    email = "student_%s_%d@estudiante.mentalink.edu" % (risk_label.lower(), idx)

    user = User(
        full_name=full_name,
        email=email,
        hashed_password=PASSWORD_HASH,
        role=UserRole.STUDENT,
        is_active=True,
        is_email_verified=True,
    )
    db.add(user)
    db.flush()

    consent = Consent(
        user_id=user.id,
        has_accepted=True,
        version="1.0",
        accepted_at=now - timedelta(days=30),
    )
    db.add(consent)
    db.flush()

    # Configuración por nivel de riesgo
    if risk_label == "Low":
        gpa = random.uniform(82.0, 98.0)
        semester = random.randint(2, 6)
        failed = 0
        units_approved = semester * 5 - random.randint(0, 1)
        pss_range = (4, 12)
        gad_range = (0, 5)
        phq_range = (0, 5)
        dropout_prob = random.uniform(0.02, 0.12)
        checkin_mood = (4, 5)
        checkin_pressure = (1, 2)
        diary_emotions = ["feliz", "motivado", "neutral"]
        diary_mood = (4, 5)
        scholarship = random.choice([True, False, False])
        tuition_ok = True
    elif risk_label == "Medium":
        gpa = random.uniform(70.0, 81.9)
        semester = random.randint(2, 7)
        failed = random.randint(0, 2)
        units_approved = max(1, semester * 5 - random.randint(2, 5))
        pss_range = (15, 23)
        gad_range = (6, 10)
        phq_range = (5, 10)
        dropout_prob = random.uniform(0.20, 0.45)
        checkin_mood = (2, 4)
        checkin_pressure = (3, 4)
        diary_emotions = ["neutral", "ansioso", "motivado", "triste"]
        diary_mood = (2, 4)
        scholarship = random.choice([False, False, False, True])
        tuition_ok = random.choice([True, True, True, False])
    else:  # High
        gpa = random.uniform(51.0, 69.9)
        semester = random.randint(2, 8)
        failed = random.randint(2, 5)
        units_approved = max(0, semester * 5 - random.randint(5, 10))
        pss_range = (28, 36)
        gad_range = (11, 15)
        phq_range = (11, 20)
        dropout_prob = random.uniform(0.60, 0.88)
        checkin_mood = (1, 2)
        checkin_pressure = (4, 5)
        diary_emotions = ["triste", "ansioso", "frustrado", "neutral"]
        diary_mood = (1, 3)
        scholarship = False
        tuition_ok = random.choice([True, False, False])

    # Course y subjects
    course = random.choice(COURSES)
    course_subjects = SUBJECTS_BY_COURSE[course]
    selected_subjects = random.sample(course_subjects, min(4, len(course_subjects)))

    # Perfil académico
    age = random.randint(18, 30)
    gender = random.choice([0, 1])

    def hito_procesual(gpa):
        return int(
            max(0, min(15, round((gpa / 100.0) * 15 + random.uniform(-1.5, 1.5))))
        )

    def hito_nota(gpa):
        return int(
            max(0, min(10, round((gpa / 100.0) * 10 + random.uniform(-1.5, 1.5))))
        )

    profile = AcademicProfile(
        user_id=user.id,
        course=course,
        scholarship_holder=scholarship,
        tuition_fees_up_to_date=tuition_ok,
        current_semester=semester,
        units_approved=units_approved,
        current_gpa=gpa,
        age_at_enrollment=age,
        gender=gender,
        hito2_procesual=hito_procesual(gpa),
        hito2_nota=hito_nota(gpa),
        hito3_procesual=hito_procesual(gpa),
        hito3_nota=hito_nota(gpa),
        hito4_procesual=hito_procesual(gpa),
        hito4_nota=hito_nota(gpa),
        hito5_procesual=hito_procesual(gpa),
        hito5_nota=hito_nota(gpa),
    )
    db.add(profile)

    record = AcademicRecord(
        user_id=user.id,
        gpa=gpa,
        enrolled_credits=semester * 20,
        failed_classes=failed,
        hito2_procesual=profile.hito2_procesual,
        hito2_nota=profile.hito2_nota,
        hito3_procesual=profile.hito3_procesual,
        hito3_nota=profile.hito3_nota,
        hito4_procesual=profile.hito4_procesual,
        hito4_nota=profile.hito4_nota,
        hito5_procesual=profile.hito5_procesual,
        hito5_nota=profile.hito5_nota,
    )
    db.add(record)

    # Notas por materia (H2-H5 con procesual=10, continua=15)
    for sub_name in selected_subjects:
        sub_gpa = max(10, min(100, gpa + random.uniform(-10, 10)))
        grade = AcademicSubjectGrade(
            user_id=user.id,
            subject_name=sub_name,
            hito2_procesual=hito_procesual(sub_gpa),
            hito2_nota=hito_nota(sub_gpa),
            hito3_procesual=hito_procesual(sub_gpa),
            hito3_nota=hito_nota(sub_gpa),
            hito4_procesual=hito_procesual(sub_gpa),
            hito4_nota=hito_nota(sub_gpa),
            hito5_procesual=hito_procesual(sub_gpa),
            hito5_nota=hito_nota(sub_gpa),
        )
        db.add(grade)

    # Tests: PSS-10, GAD-7, PHQ-9 (3 tomas cada uno en los últimos 60 días)
    pss = db.query(Assessment).filter(Assessment.type == "PSS-10").first()
    gad = db.query(Assessment).filter(Assessment.type == "GAD-7").first()
    phq = db.query(Assessment).filter(Assessment.type == "PHQ-9").first()

    pss_items = pss.items
    gad_items = gad.items
    phq_items = phq.items

    # Reverse-scored items for PSS-10: q4, q5, q7, q8
    pss_reverse = {"q4", "q5", "q7", "q8"}

    for wave in range(3):
        days_ago = 60 - wave * 20 + random.randint(-3, 3)
        created = now - timedelta(days=days_ago)

        pss_score = random.randint(*pss_range)
        gad_score = random.randint(*gad_range)
        phq_score = random.randint(*phq_range)

        pss_answers = generate_survey_answers(pss_items, pss_score, 4, pss_reverse)
        gad_answers = generate_survey_answers(gad_items, gad_score, 3)
        phq_answers = generate_survey_answers(phq_items, phq_score, 3)

        db.add(
            AssessmentResponse(
                user_id=user.id,
                assessment_id=pss.id,
                answers=pss_answers,
                total_score=float(pss_score),
                risk_level=risk_label,
                share_with_psychologist=True,
                created_at=created,
            )
        )
        db.add(
            AssessmentResponse(
                user_id=user.id,
                assessment_id=gad.id,
                answers=gad_answers,
                total_score=float(gad_score),
                risk_level=risk_label,
                share_with_psychologist=True,
                created_at=created,
            )
        )
        db.add(
            AssessmentResponse(
                user_id=user.id,
                assessment_id=phq.id,
                answers=phq_answers,
                total_score=float(phq_score),
                risk_level=risk_label,
                share_with_psychologist=True,
                created_at=created,
            )
        )

    # Risk Summary
    db.add(
        RiskSummary(
            user_id=user.id,
            current_risk_level=risk_label,
            prediction_confidence=round(random.uniform(0.82, 0.98), 4),
            dropout_probability=float(dropout_prob),
            dropout_risk=risk_label,
            recommendations=RECOMMENDATIONS[risk_label],
            last_updated=now - timedelta(days=random.randint(1, 5)),
        )
    )

    # Check-ins emocionales (últimos 30 días)
    for day in range(30):
        mood = random.randint(*checkin_mood)
        pressure = random.randint(*checkin_pressure)
        energy = max(1, min(5, mood + random.randint(-1, 1)))
        sleep = random.randint(5, 9) if risk_label != "High" else random.randint(4, 7)
        db.add(
            EmotionalCheckin(
                user_id=user.id,
                mood_score=mood,
                energy_level=energy,
                sleep_hours=sleep,
                academic_pressure=pressure,
                note="Checkin diario - día %d." % (day + 1),
                created_at=now - timedelta(days=day),
            )
        )

    # Diario emocional (15 entradas cada 2 días en los últimos 30)
    for entry in range(15):
        emo = random.choice(diary_emotions)
        wellbeing = random.randint(*diary_mood)
        entry_date = (now - timedelta(days=entry * 2)).date()
        exp_texts = {
            "feliz": "Hoy fue un gran día. Me fue bien en clases y compartí con amigos.",
            "motivado": "Me siento motivado con mis estudios y proyectos.",
            "neutral": "Un día tranquilo, sin mayores novedades.",
            "ansioso": "Me sentí preocupado por los exámenes que se vienen.",
            "triste": "Hoy fue un día difícil, me sentí desanimado.",
            "frustrado": "No logré terminar mis tareas a tiempo y eso me frustró.",
        }
        db.add(
            EmotionalDiary(
                user_id=user.id,
                date=entry_date,
                experience=exp_texts.get(emo, "Día normal."),
                activities="Estudiar, asistir a clases.",
                emotion=emo,
                emotion_color=EMOTION_COLORS.get(emo, "#94a3b8"),
                wellbeing_level=wellbeing,
                emotion_ai=emo,
                emotion_scores={emo: 0.8, "neutral": 0.2},
                analysis_created_at=now - timedelta(days=entry * 2),
            )
        )

    db.flush()
    return user


def main():
    db = SessionLocal()
    try:
        # Limpiar usuarios de prueba anteriores
        old = (
            db.query(User)
            .filter(User.email.like("student_%@estudiante.mentalink.edu"))
            .all()
        )
        if old:
            old_ids = tuple(u.id for u in old)
            tables = [
                "academic_subject_grades",
                "assessment_responses",
                "ai_predictions",
                "consents",
                "alerts",
                "academic_profiles",
                "academic_records",
                "appointments",
                "emotional_diary",
                "emotional_checkins",
                "risk_summaries",
            ]
            for t in tables:
                db.execute(
                    text("DELETE FROM %s WHERE user_id IN :ids" % t), {"ids": old_ids}
                )
            db.execute(
                text("DELETE FROM clinical_notes WHERE student_id IN :ids"),
                {"ids": old_ids},
            )
            db.execute(
                text("DELETE FROM audit_logs WHERE actor_id IN :ids"), {"ids": old_ids}
            )
            db.execute(text("DELETE FROM users WHERE id IN :ids"), {"ids": old_ids})
            db.commit()
            print("Eliminados %d usuarios de prueba anteriores." % len(old))

        random.shuffle(NOMBRES)
        classifications = ["Low"] * 33 + ["Medium"] * 33 + ["High"] * 34
        random.shuffle(classifications)

        created = 0
        for idx, risk in enumerate(classifications):
            create_student(db, idx, risk, NOMBRES)
            created += 1
            if created % 10 == 0:
                db.commit()
                print("  Creados %d/100..." % created)

        db.commit()
        print("\nEXITO: %d usuarios creados." % created)
        print(
            "Distribucion: Low=%d, Medium=%d, High=%d"
            % (
                classifications.count("Low"),
                classifications.count("Medium"),
                classifications.count("High"),
            )
        )
        print("Password: %s" % PASSWORD)

    except Exception as e:
        db.rollback()
        print("ERROR: %s" % e)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
