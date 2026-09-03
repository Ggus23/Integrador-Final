"""
Script para generar datos de prueba para la regresión lineal.
Crea 100 usuarios estudiantes con:
- PSS scores (nivel de estrés)
- Calificaciones académicas
- Datos correlacionados (estrés vs desempeño)
"""

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import random
from datetime import datetime, timedelta

import numpy as np
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.models import (
    AcademicSubjectGrade,
    Assessment,
    AssessmentResponse,
    User,
    UserRole,
)

# Configurar conexión a BD
DATABASE_URL = settings.SQLALCHEMY_DATABASE_URI
engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def generate_test_data():
    """Genera 100 estudiantes con datos correlacionados estrés-rendimiento"""

    db = SessionLocal()

    try:
        # Verificar si ya existe el assessment PSS-10
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
            pss_id = pss_assessment.id
        else:
            pss_id = pss_assessment.id
            print(f"✓ PSS-10 encontrado (ID: {pss_id})")

        # Limpiar cualquier usuario viejo que cause errores de validación
        print("🔄 Eliminando usuarios de prueba antiguos...")
        user_ids = [
            r[0]
            for r in db.execute(
                text(
                    "SELECT id FROM users WHERE email LIKE 'student_test_%' OR email LIKE '%.test'"
                )
            ).fetchall()
        ]
        if user_ids:
            # Eliminar de tablas hijas usando SQL crudo para evitar problemas con modelos ORM desactualizados
            db.execute(
                text("DELETE FROM academic_subject_grades WHERE user_id IN :ids"),
                {"ids": tuple(user_ids)},
            )
            db.execute(
                text("DELETE FROM assessment_responses WHERE user_id IN :ids"),
                {"ids": tuple(user_ids)},
            )
            db.execute(
                text("DELETE FROM ai_predictions WHERE user_id IN :ids"),
                {"ids": tuple(user_ids)},
            )
            db.execute(
                text("DELETE FROM consents WHERE user_id IN :ids"),
                {"ids": tuple(user_ids)},
            )
            db.execute(
                text("DELETE FROM alerts WHERE user_id IN :ids"),
                {"ids": tuple(user_ids)},
            )
            db.execute(
                text("DELETE FROM academic_profiles WHERE user_id IN :ids"),
                {"ids": tuple(user_ids)},
            )
            db.execute(
                text("DELETE FROM academic_records WHERE user_id IN :ids"),
                {"ids": tuple(user_ids)},
            )
            db.execute(
                text(
                    "DELETE FROM appointments WHERE user_id IN :ids OR psychologist_id IN :ids"
                ),
                {"ids": tuple(user_ids)},
            )
            db.execute(
                text("DELETE FROM emotional_diary WHERE user_id IN :ids"),
                {"ids": tuple(user_ids)},
            )
            db.execute(
                text("DELETE FROM emotional_checkins WHERE user_id IN :ids"),
                {"ids": tuple(user_ids)},
            )
            db.execute(
                text("DELETE FROM audit_logs WHERE actor_id IN :ids"),
                {"ids": tuple(user_ids)},
            )
            db.execute(
                text("DELETE FROM users WHERE id IN :ids"), {"ids": tuple(user_ids)}
            )
            db.commit()

        # Generar 100 estudiantes
        subjects = [
            "Matemáticas",
            "Física",
            "Química",
            "Historia",
            "Literatura",
            "Programación",
            "Biología",
            "Inglés",
            "Filosofía",
            "Arte",
        ]

        created_users = 0

        for i in range(1, 101):
            # Crear usuario
            email = f"student_test_{i}@unifranz.edu.bo"

            # Verificar si ya existe
            existing = db.query(User).filter_by(email=email).first()
            if existing:
                print(f"⊘ Usuario {i} ya existe")
                continue

            user = User(
                full_name=f"Estudiante Test {i}",
                email=email,
                hashed_password="$2b$12$test",  # Password hasheado
                role=UserRole.STUDENT,
                is_active=True,
                is_email_verified=True,
            )
            db.add(user)
            db.flush()  # Obtener el ID

            # Generar datos correlacionados
            # Estrés vs Rendimiento: correlación negativa
            stress_score = random.uniform(10, 40)  # PSS: 0-40

            # Función: rendimiento = 95 - (estrés * 1.2) + ruido
            base_performance = 95 - (stress_score * 1.2)
            performance = base_performance + np.random.normal(0, 5)  # Agregar ruido
            performance = max(0, min(100, performance))  # Limitar 0-100

            # Crear respuesta PSS
            # PSS-10 tiene respuestas de 0-4 (10 preguntas)
            pss_answers = {}
            pss_total = 0
            for q in range(1, 11):
                answer = random.randint(0, int(stress_score / 4))  # Escala a 0-10
                pss_answers[str(q)] = answer
                pss_total += answer

            # Normalizar a escala 0-40
            pss_score = min(40, (pss_total / 40) * 40)

            risk_level = (
                "low" if pss_score < 14 else "medium" if pss_score < 27 else "high"
            )

            assessment_response = AssessmentResponse(
                user_id=user.id,
                assessment_id=pss_id,
                answers=pss_answers,
                total_score=pss_score,
                risk_level=risk_level,
                dropout_probability=min(
                    1.0, (pss_score / 40) * 0.8
                ),  # Mayor estrés = mayor riesgo
                share_with_psychologist=True,
                created_at=datetime.utcnow() - timedelta(days=random.randint(0, 30)),
            )
            db.add(assessment_response)

            # Crear calificaciones académicas
            for subject in random.sample(subjects, random.randint(3, 6)):
                subject_grade = AcademicSubjectGrade(
                    user_id=user.id,
                    subject_name=subject,
                    hito2_nota=max(0, performance + np.random.normal(0, 5)),
                    hito2_procesual=max(0, performance * 0.9 + np.random.normal(0, 5)),
                    hito3_nota=max(0, performance + np.random.normal(0, 5)),
                    hito3_procesual=max(0, performance * 0.9 + np.random.normal(0, 5)),
                    hito4_nota=max(0, performance + np.random.normal(0, 5)),
                    hito4_procesual=max(0, performance * 0.9 + np.random.normal(0, 5)),
                    hito5_nota=max(0, performance + np.random.normal(0, 5)),
                    hito5_procesual=max(0, performance * 0.9 + np.random.normal(0, 5)),
                )
                db.add(subject_grade)

            created_users += 1

            if i % 10 == 0:
                print(f"✓ {i}/100 usuarios creados...")

        db.commit()
        print(f"\n✅ {created_users} usuarios de prueba generados exitosamente")
        print(f"   - PSS scores: 10-40 (estrés percibido)")
        print(f"   - Desempeño académico correlacionado negativamente")
        print(f"   - Datos listos para análisis de regresión lineal")

    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("🔄 Generando 100 estudiantes con datos de prueba...")
    generate_test_data()
