"""
Script para generar 50 usuarios reales (estudiantes) con datos correlacionados y realistas.
Los usuarios están clasificados equitativamente en niveles de riesgo: Bajo, Medio y Alto.
Contraseña de todos los usuarios: Estudiante123!
Ejecución: .\\.venv\\Scripts\\python scripts/generate_test_users.py
"""

import os
import random
import sys
from datetime import datetime, timedelta

# Agregar el directorio principal al path para poder importar módulos de la app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.core.security import get_password_hash
from app.models import (
    AcademicProfile,
    AcademicRecord,
    AcademicSubjectGrade,
    Assessment,
    AssessmentResponse,
    Consent,
    EmotionalCheckin,
    EmotionalDiary,
    RiskSummary,
    User,
    UserRole,
)

# Configurar conexión a la base de datos
DATABASE_URL = settings.SQLALCHEMY_DATABASE_URI
engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Nombres realistas (25 femeninos, 25 masculinos)
FEMALE_NAMES = [
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
]

MALE_NAMES = [
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

RECOMMENDATIONS_LOW = [
    "Mantén tu rutina actual de estudio y autocuidado.",
    "Duerme entre 7 y 8 horas diarias para consolidar el aprendizaje.",
    "Participa en actividades recreativas extracurriculares los fines de semana.",
    "Continúa utilizando los canales normales de consulta con tus docentes.",
]

RECOMMENDATIONS_MEDIUM = [
    "Organiza tus tiempos con un calendario académico semanal para evitar sobrecargas.",
    "Practica técnicas de respiración profunda o meditación de 5 minutos antes de tus exámenes.",
    "Considera hablar con un tutor de las materias que sientas más complejas.",
    "Duerme al menos 6 a 7 horas y evita estudiar toda la noche antes de una evaluación.",
]

RECOMMENDATIONS_HIGH = [
    "Agenda una cita prioritaria con el gabinete de psicología en el campus o virtualmente.",
    "Solicita apoyo académico personalizado y tutorías para tus materias de mayor riesgo.",
    "Reduce las horas de estudio nocturno tardío y prioriza periodos cortos de estudio activo con pausas.",
    "Habla con tus docentes o director de carrera sobre tu situación actual para buscar flexibilidad.",
]


# Respuestas para el PSS-10 (10 preguntas)
# q1-q10: respuestas 0-4
# Las preguntas q4, q5, q7, q8 son inversas en el PSS-10.
# Un score bajo significa bajo estrés. Un score alto significa alto estrés.
def generate_pss_answers(target_score: int) -> dict:
    # Genera 10 respuestas que sumen al target_score después de la inversión
    # q4, q5, q7, q8 se calculan como (4 - valor). Las demás se suman tal cual.
    answers = {}
    remaining = target_score
    items = [f"q{i}" for i in range(1, 11)]
    reverse_items = {"q4", "q5", "q7", "q8"}

    # Inicializar con valores base
    for item in items:
        answers[item] = 0

    attempts = 0
    while remaining > 0 and attempts < 100:
        item = random.choice(items)
        curr_val = answers[item]

        if item in reverse_items:
            # valor inverso = 4 - curr_val. Queremos aumentar la contribución al score.
            # Aumentar la contribución significa disminuir el valor real (ej. de 4 a 3 contribuye 1 más).
            if curr_val > 0:
                answers[item] -= 1
                remaining -= 1
        else:
            # valor directo. Queremos aumentar la contribución, así que aumentamos el valor real.
            if curr_val < 4:
                answers[item] += 1
                remaining -= 1
        attempts += 1

    # Completar los valores de las inversas que quedaron en 0 (que contribuyen 4 al score)
    # Si sumaron de más, los ajustamos
    # Para simplificar, si no llegamos exactamente, reajustamos directamente
    actual_score = 0
    for item in items:
        val = answers[item]
        actual_score += (4 - val) if item in reverse_items else val

    # Ajustar para que dé exactamente el target_score
    diff = target_score - actual_score
    for item in items:
        if diff == 0:
            break
        val = answers[item]
        if item in reverse_items:
            if (
                diff > 0 and val > 0
            ):  # Necesitamos subir el score, o sea bajar el valor real
                decrement = min(diff, val)
                answers[item] -= decrement
                diff -= decrement
            elif (
                diff < 0 and val < 4
            ):  # Necesitamos bajar el score, o sea subir el valor real
                increment = min(-diff, 4 - val)
                answers[item] += increment
                diff += increment
        else:
            if (
                diff > 0 and val < 4
            ):  # Necesitamos subir el score, o sea subir el valor real
                increment = min(diff, 4 - val)
                answers[item] += increment
                diff -= increment
            elif (
                diff < 0 and val > 0
            ):  # Necesitamos bajar el score, o sea bajar el valor real
                decrement = min(-diff, val)
                answers[item] -= decrement
                diff += decrement

    return answers


def generate_users():
    db = SessionLocal()

    try:
        # 1. Asegurar que existe el Assessment PSS-10
        pss_assessment = db.query(Assessment).filter_by(type="PSS-10").first()
        if not pss_assessment:
            print("⚠️ Assessment PSS-10 no encontrado. Creando...")
            pss_assessment = Assessment(
                title="Escala de Estrés Percibido (PSS-10)",
                description="Perceived Stress Scale - 10",
                type="PSS-10",
                items=[
                    {
                        "id": 1,
                        "text": "En el último mes, ¿con qué frecuencia has estado preocupado por algo inesperado?",
                        "scale_min": 0,
                        "scale_max": 4,
                        "scale_min_label": "Nunca",
                        "scale_max_label": "Muy frecuentemente",
                    },
                    {
                        "id": 2,
                        "text": "En el último mes, ¿con qué frecuencia has sentido que eres incapaz de controlar las cosas importantes de tu vida?",
                        "scale_min": 0,
                        "scale_max": 4,
                        "scale_min_label": "Nunca",
                        "scale_max_label": "Muy frecuentemente",
                    },
                    {
                        "id": 3,
                        "text": "En el último mes, ¿con qué frecuencia te has sentido nervioso o estresado?",
                        "scale_min": 0,
                        "scale_max": 4,
                        "scale_min_label": "Nunca",
                        "scale_max_label": "Muy frecuentemente",
                    },
                    {
                        "id": 4,
                        "text": "En el último mes, ¿con qué frecuencia te has sentido seguro de tu capacidad de manejar tus problemas personales?",
                        "scale_min": 0,
                        "scale_max": 4,
                        "scale_min_label": "Nunca",
                        "scale_max_label": "Muy frecuentemente",
                    },
                    {
                        "id": 5,
                        "text": "En el último mes, ¿con qué frecuencia has sentido que las cosas marchan como esperas?",
                        "scale_min": 0,
                        "scale_max": 4,
                        "scale_min_label": "Nunca",
                        "scale_max_label": "Muy frecuentemente",
                    },
                    {
                        "id": 6,
                        "text": "En el último mes, ¿con qué frecuencia has encontrado que no podías hacer frente a todas las cosas que tenías que hacer?",
                        "scale_min": 0,
                        "scale_max": 4,
                        "scale_min_label": "Nunca",
                        "scale_max_label": "Muy frecuentemente",
                    },
                    {
                        "id": 7,
                        "text": "En el último mes, ¿con qué frecuencia has sido capaz de controlar la forma de pasar tu tiempo?",
                        "scale_min": 0,
                        "scale_max": 4,
                        "scale_min_label": "Nunca",
                        "scale_max_label": "Muy frecuentemente",
                    },
                    {
                        "id": 8,
                        "text": "En el último mes, ¿con qué frecuencia has sentido que las dificultades se acumulaban tanto que no podías superarlas?",
                        "scale_min": 0,
                        "scale_max": 4,
                        "scale_min_label": "Nunca",
                        "scale_max_label": "Muy frecuentemente",
                    },
                    {
                        "id": 9,
                        "text": "En el último mes, ¿con qué frecuencia has estado irritable o malhumorado?",
                        "scale_min": 0,
                        "scale_max": 4,
                        "scale_min_label": "Nunca",
                        "scale_max_label": "Muy frecuentemente",
                    },
                    {
                        "id": 10,
                        "text": "En el último mes, ¿con qué frecuencia has sentido que estabas en la cima del mundo sin razón aparente?",
                        "scale_min": 0,
                        "scale_max": 4,
                        "scale_min_label": "Nunca",
                        "scale_max_label": "Muy frecuentemente",
                    },
                ],
            )
            db.add(pss_assessment)
            db.commit()
            db.refresh(pss_assessment)
            print(f"✅ PSS-10 creado con ID: {pss_assessment.id}")
        else:
            print(f"✓ PSS-10 ya existe (ID: {pss_assessment.id})")

        pss_id = pss_assessment.id

        # 2. Limpiar usuarios de prueba anteriores que empiecen con 'student_real_'
        print("🔄 Eliminando usuarios de prueba reales anteriores...")
        old_users = (
            db.query(User)
            .filter(User.email.like("student_real_%@unifranz.edu.bo"))
            .all()
        )
        if old_users:
            old_ids = [u.id for u in old_users]
            db.execute(
                text("DELETE FROM academic_subject_grades WHERE user_id IN :ids"),
                {"ids": tuple(old_ids)},
            )
            db.execute(
                text("DELETE FROM assessment_responses WHERE user_id IN :ids"),
                {"ids": tuple(old_ids)},
            )
            db.execute(
                text("DELETE FROM ai_predictions WHERE user_id IN :ids"),
                {"ids": tuple(old_ids)},
            )
            db.execute(
                text("DELETE FROM consents WHERE user_id IN :ids"),
                {"ids": tuple(old_ids)},
            )
            db.execute(
                text("DELETE FROM alerts WHERE user_id IN :ids"),
                {"ids": tuple(old_ids)},
            )
            db.execute(
                text("DELETE FROM academic_profiles WHERE user_id IN :ids"),
                {"ids": tuple(old_ids)},
            )
            db.execute(
                text("DELETE FROM academic_records WHERE user_id IN :ids"),
                {"ids": tuple(old_ids)},
            )
            db.execute(
                text(
                    "DELETE FROM appointments WHERE user_id IN :ids OR psychologist_id IN :ids"
                ),
                {"ids": tuple(old_ids)},
            )
            db.execute(
                text("DELETE FROM emotional_diary WHERE user_id IN :ids"),
                {"ids": tuple(old_ids)},
            )
            db.execute(
                text("DELETE FROM emotional_checkins WHERE user_id IN :ids"),
                {"ids": tuple(old_ids)},
            )
            db.execute(
                text("DELETE FROM risk_summaries WHERE user_id IN :ids"),
                {"ids": tuple(old_ids)},
            )
            db.execute(
                text("DELETE FROM users WHERE id IN :ids"), {"ids": tuple(old_ids)}
            )
            db.commit()
            print(
                f"✅ Se eliminaron {len(old_users)} usuarios antiguos de prueba reales."
            )

        # Mezclar listas de nombres
        random.shuffle(FEMALE_NAMES)
        random.shuffle(MALE_NAMES)

        # 50 usuarios: 17 bajo, 17 medio, 16 alto
        classifications = ["Low"] * 17 + ["Medium"] * 17 + ["High"] * 16
        random.shuffle(classifications)  # Mezclar para que los IDs estén salpicados

        password_hash = get_password_hash("Estudiante123!")

        created_count = 0

        for idx in range(50):
            # Asignar género alternado
            is_female = idx % 2 == 0
            gender_val = 0 if is_female else 1  # 0=Femenino, 1=Masculino

            # Obtener nombre
            if is_female:
                full_name = FEMALE_NAMES.pop()
            else:
                full_name = MALE_NAMES.pop()

            email_prefix = (
                full_name.lower()
                .replace(" ", ".")
                .replace("á", "a")
                .replace("é", "e")
                .replace("í", "i")
                .replace("ó", "o")
                .replace("ú", "u")
                .replace("ñ", "n")
            )
            email = f"student_real_{email_prefix}@unifranz.edu.bo"

            # Crear User
            user = User(
                full_name=full_name,
                email=email,
                hashed_password=password_hash,
                role=UserRole.STUDENT,
                is_active=True,
                is_email_verified=True,
                must_change_password=False,
            )
            db.add(user)
            db.flush()  # Obtener user.id

            # Crear Consentimiento Aceptado
            consent = Consent(
                user_id=user.id,
                has_accepted=True,
                version="1.0",
                accepted_at=datetime.utcnow() - timedelta(days=15),
            )
            db.add(consent)

            # Definir nivel de riesgo y correlaciones
            risk = classifications[idx]
            course = random.choice(COURSES)
            semester = random.randint(1, 8)
            age = random.randint(18, 25)

            if risk == "Low":
                gpa = random.uniform(82.0, 98.0)
                scholarship = random.choice([True, False, False])  # 33% beca
                tuition_up_to_date = True
                failed_classes = 0
                units_approved = semester * 5 - random.randint(0, 2)

                # PSS Score: 0-13 (estrés bajo)
                pss_score = random.randint(4, 12)
                dropout_prob = random.uniform(0.02, 0.12)
                checkin_mood_min, checkin_mood_max = 4, 5
                checkin_pressure_min, checkin_pressure_max = 1, 2
                recommendations = RECOMMENDATIONS_LOW

            elif risk == "Medium":
                gpa = random.uniform(70.0, 81.9)
                scholarship = random.choice([False, False, False, True])  # 25% beca
                tuition_up_to_date = random.choice(
                    [True, True, True, False]
                )  # 75% al día
                failed_classes = random.randint(0, 1)
                units_approved = semester * 5 - random.randint(2, 4)

                # PSS Score: 14-26 (estrés medio)
                pss_score = random.randint(15, 23)
                dropout_prob = random.uniform(0.20, 0.45)
                checkin_mood_min, checkin_mood_max = 3, 4
                checkin_pressure_min, checkin_pressure_max = 2, 4
                recommendations = RECOMMENDATIONS_MEDIUM

            else:  # High
                gpa = random.uniform(51.0, 69.9)
                scholarship = False
                tuition_up_to_date = random.choice([True, False, False])  # 33% al día
                failed_classes = random.randint(2, 5)
                units_approved = max(0, semester * 5 - random.randint(5, 10))

                # PSS Score: 27-40 (estrés alto)
                pss_score = random.randint(28, 36)
                dropout_prob = random.uniform(0.60, 0.88)
                checkin_mood_min, checkin_mood_max = 1, 2
                checkin_pressure_min, checkin_pressure_max = 4, 5
                recommendations = RECOMMENDATIONS_HIGH

            units_approved = max(0, units_approved)

            # Crear Academic Profile
            academic_profile = AcademicProfile(
                user_id=user.id,
                course=course,
                scholarship_holder=scholarship,
                tuition_fees_up_to_date=tuition_up_to_date,
                current_semester=semester,
                units_approved=units_approved,
                current_gpa=gpa,
                age_at_enrollment=age,
                gender=gender_val,
                # Hito notas base correlacionadas con GPA
                hito2_procesual=min(15.0, (gpa / 100.0) * 15.0 + random.uniform(-1, 1)),
                hito2_nota=min(10.0, (gpa / 100.0) * 10.0 + random.uniform(-1, 0.5)),
                hito3_procesual=min(15.0, (gpa / 100.0) * 15.0 + random.uniform(-1, 1)),
                hito3_nota=min(10.0, (gpa / 100.0) * 10.0 + random.uniform(-1, 0.5)),
                hito4_procesual=min(15.0, (gpa / 100.0) * 15.0 + random.uniform(-1, 1)),
                hito4_nota=min(10.0, (gpa / 100.0) * 10.0 + random.uniform(-1, 0.5)),
                hito5_procesual=min(15.0, (gpa / 100.0) * 15.0 + random.uniform(-1, 1)),
                hito5_nota=min(10.0, (gpa / 100.0) * 10.0 + random.uniform(-1, 0.5)),
            )
            db.add(academic_profile)

            # Crear Academic Record
            academic_record = AcademicRecord(
                user_id=user.id,
                gpa=gpa,
                enrolled_credits=semester * 20,
                failed_classes=failed_classes,
                hito2_procesual=academic_profile.hito2_procesual,
                hito2_nota=academic_profile.hito2_nota,
                hito3_procesual=academic_profile.hito3_procesual,
                hito3_nota=academic_profile.hito3_nota,
                hito4_procesual=academic_profile.hito4_procesual,
                hito4_nota=academic_profile.hito4_nota,
                hito5_procesual=academic_profile.hito5_procesual,
                hito5_nota=academic_profile.hito5_nota,
            )
            db.add(academic_record)

            # Crear Calificaciones Académicas de asignaturas
            subjects = SUBJECTS_BY_COURSE[course]
            # Tomar 4 asignaturas del curso
            selected_subjects = random.sample(subjects, 4)
            for sub_name in selected_subjects:
                # Modificar levemente la nota por materia en base al gpa
                sub_gpa = max(10, min(100, gpa + random.uniform(-10, 10)))
                subject_grade = AcademicSubjectGrade(
                    user_id=user.id,
                    subject_name=sub_name,
                    hito2_procesual=min(
                        15.0, (sub_gpa / 100.0) * 15.0 + random.uniform(-0.5, 0.5)
                    ),
                    hito2_nota=min(
                        10.0, (sub_gpa / 100.0) * 10.0 + random.uniform(-0.5, 0.5)
                    ),
                    hito3_procesual=min(
                        15.0, (sub_gpa / 100.0) * 15.0 + random.uniform(-0.5, 0.5)
                    ),
                    hito3_nota=min(
                        10.0, (sub_gpa / 100.0) * 10.0 + random.uniform(-0.5, 0.5)
                    ),
                    hito4_procesual=min(
                        15.0, (sub_gpa / 100.0) * 15.0 + random.uniform(-0.5, 0.5)
                    ),
                    hito4_nota=min(
                        10.0, (sub_gpa / 100.0) * 10.0 + random.uniform(-0.5, 0.5)
                    ),
                    hito5_procesual=min(
                        15.0, (sub_gpa / 100.0) * 15.0 + random.uniform(-0.5, 0.5)
                    ),
                    hito5_nota=min(
                        10.0, (sub_gpa / 100.0) * 10.0 + random.uniform(-0.5, 0.5)
                    ),
                )
                db.add(subject_grade)

            # Crear Respuestas del Test PSS-10
            pss_answers = generate_pss_answers(pss_score)
            assessment_response = AssessmentResponse(
                user_id=user.id,
                assessment_id=pss_id,
                answers=pss_answers,
                total_score=float(pss_score),
                risk_level=risk,
                dropout_probability=float(dropout_prob),
                share_with_psychologist=True,
                created_at=datetime.utcnow() - timedelta(days=2),  # Tomado hace 2 días
            )
            db.add(assessment_response)

            # Crear Risk Summary
            risk_summary = RiskSummary(
                user_id=user.id,
                current_risk_level=risk,
                prediction_confidence=float(random.uniform(0.82, 0.98)),
                dropout_probability=float(dropout_prob),
                dropout_risk=risk,
                recommendations=recommendations,
                last_updated=datetime.utcnow() - timedelta(days=2),
            )
            db.add(risk_summary)

            # Crear 7 check-ins diarios emocionales (últimos 7 días)
            for day_offset in range(7):
                mood = random.randint(checkin_mood_min, checkin_mood_max)
                pressure = random.randint(checkin_pressure_min, checkin_pressure_max)
                energy = max(1, min(5, mood + random.randint(-1, 1)))
                sleep = random.randint(5, 9) if risk != "High" else random.randint(4, 7)

                checkin = EmotionalCheckin(
                    user_id=user.id,
                    mood_score=mood,
                    energy_level=energy,
                    sleep_hours=sleep,
                    academic_pressure=pressure,
                    note=f"Check-in diario del día {7 - day_offset} de prueba.",
                    created_at=datetime.utcnow() - timedelta(days=day_offset),
                )
                db.add(checkin)

            # Crear 15 entradas en el diario emocional (últimos 30 días)
            if risk == "High":
                weighted_emotions = ["triste", "ansioso", "frustrado", "neutral"]
                mood_min, mood_max = 1, 3
            elif risk == "Medium":
                weighted_emotions = ["neutral", "ansioso", "motivado", "triste"]
                mood_min, mood_max = 2, 4
            else:
                weighted_emotions = ["feliz", "motivado", "neutral"]
                mood_min, mood_max = 4, 5

            for day_offset in range(0, 30, 2):
                emo = random.choice(weighted_emotions)
                wellbeing = random.randint(mood_min, mood_max)
                diary_date = (datetime.utcnow() - timedelta(days=day_offset)).date()

                colors = {
                    "feliz": "#10b981",
                    "neutral": "#6b7280",
                    "triste": "#3b82f6",
                    "ansioso": "#f59e0b",
                    "frustrado": "#ef4444",
                    "motivado": "#8b5cf6",
                }

                diary_entry = EmotionalDiary(
                    user_id=user.id,
                    date=diary_date,
                    experience=f"Hoy fue un día de pruebas. Me sentí {emo} debido a las exigencias académicas y mi rutina.",
                    activities="Estudiar, asistir a clases, programar.",
                    emotion=emo,
                    emotion_color=colors.get(emo, "#94a3b8"),
                    wellbeing_level=wellbeing,
                    emotion_ai=emo,
                    emotion_scores={emo: 0.8, "neutral": 0.2},
                    analysis_created_at=datetime.utcnow() - timedelta(days=day_offset),
                )
                db.add(diary_entry)

            created_count += 1
            if created_count % 10 == 0:
                print(f"  - Creados {created_count}/50 usuarios...")

        db.commit()
        print(f"\n✨ ¡Éxito! Se crearon {created_count} usuarios de prueba.")
        print("-" * 50)
        print(f"📊 Distribución de riesgo:")
        print(
            f"   - Bajo (Low): {sum(1 for c in classifications if c == 'Low')} estudiantes"
        )
        print(
            f"   - Medio (Medium): {sum(1 for c in classifications if c == 'Medium')} estudiantes"
        )
        print(
            f"   - Alto (High): {sum(1 for c in classifications if c == 'High')} estudiantes"
        )
        print(f"🔑 Contraseña para todos: Estudiante123!")
        print(f"📧 Ejemplo de email: student_real_valeria.quispe@unifranz.edu.bo")
        print("-" * 50)

    except Exception as e:
        db.rollback()
        print(f"❌ Error durante la generación: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print(
        "🚀 Iniciando generación de 50 usuarios reales para pruebas de clasificación..."
    )
    generate_users()
