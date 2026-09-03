"""
Análisis de correlación e regresión lineal entre estrés y desempeño académico.
"""

from typing import Any

import numpy as np
from fastapi import APIRouter, Depends, HTTPException
from scipy import stats
from sqlalchemy.orm import Session

from app import models
from app.api import deps

router = APIRouter()


@router.get("/linear-regression")
def get_linear_regression(
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Calcula una regresión lineal entre el estrés (PSS Score) y el desempeño académico.

    Retorna:
    - points: Lista de puntos (estudiante, stress, academic_avg)
    - regression_line: Parámetros de la línea (slope, intercept, r_value, p_value)
    - equation: String con la ecuación y = mx + b
    - interpretation: Interpretación de la correlación
    - data_count: Número de estudiantes con datos completos
    """

    # Solo estudiantes y psicólogos pueden ver este análisis
    if current_user.role not in (
        models.user.UserRole.ADMIN,
        models.user.UserRole.PSYCHOLOGIST,
        models.user.UserRole.STUDENT,
    ):
        raise HTTPException(status_code=403, detail="No autorizado")

    # Obtener todos los estudiantes activos (o solo el actual si es estudiante)
    if current_user.role == models.user.UserRole.STUDENT:
        students = [current_user]
    else:
        students = (
            db.query(models.user.User)
            .filter(
                models.user.User.role == models.user.UserRole.STUDENT,
                models.user.User.is_active.is_(True),
            )
            .all()
        )

    data_points = []

    for student in students:
        # Obtener el PSS score (Assessment) más reciente
        latest_pss = (
            db.query(models.AssessmentResponse)
            .filter(
                models.AssessmentResponse.user_id == student.id,
                models.AssessmentResponse.assessment_id
                == 1,  # PSS-10 es assessment_id=1
            )
            .order_by(models.AssessmentResponse.created_at.desc())
            .first()
        )

        if not latest_pss:
            continue

        pss_score = latest_pss.total_score  # 0-40

        # Obtener el promedio de calificaciones
        subject_grades = (
            db.query(models.AcademicSubjectGrade)
            .filter(models.AcademicSubjectGrade.user_id == student.id)
            .all()
        )

        if not subject_grades:
            continue

        # Calcular promedio de todas las notas
        all_grades = []
        for grade in subject_grades:
            all_grades.extend(
                [grade.hito2_nota, grade.hito3_nota, grade.hito4_nota, grade.hito5_nota]
            )

        all_grades = [g for g in all_grades if g > 0]  # Filtrar ceros
        if not all_grades:
            continue

        academic_avg = np.mean(all_grades)

        data_points.append(
            {
                "student_id": student.id,
                "student_name": student.full_name,
                "stress_score": float(pss_score),
                "academic_avg": float(academic_avg),
            }
        )

    if len(data_points) < 2:
        return {
            "points": data_points,
            "regression_line": None,
            "equation": "Insuficientes datos",
            "interpretation": "Se necesitan al menos 2 estudiantes con datos PSS y académicos",
            "data_count": len(data_points),
            "r_squared": 0.0,
        }

    # Preparar datos para regresión
    x = np.array([p["stress_score"] for p in data_points])
    y = np.array([p["academic_avg"] for p in data_points])

    # Calcular regresión lineal
    slope, intercept, r_value, p_value, std_err = stats.linregress(x, y)

    # Generar puntos para la línea
    x_line = np.array([x.min(), x.max()])
    y_line = slope * x_line + intercept

    # Interpretación
    correlation = "negativa" if slope < 0 else "positiva"
    strength = (
        "fuerte"
        if abs(r_value) > 0.7
        else "moderada" if abs(r_value) > 0.4 else "débil"
    )

    interpretation = (
        f"Existe una correlación {strength} y {correlation} entre estrés y desempeño académico. "
        f"R² = {r_value**2:.3f} (explica {(r_value**2)*100:.1f}% de la varianza). "
        f"P-valor = {p_value:.4f} {'(estadísticamente significativo)' if p_value < 0.05 else '(no significativo)'}"
    )

    equation = f"y = {slope:.3f}x + {intercept:.2f}"

    return {
        "points": data_points,
        "regression_line": {
            "slope": float(slope),
            "intercept": float(intercept),
            "r_value": float(r_value),
            "r_squared": float(r_value**2),
            "p_value": float(p_value),
            "x_min": float(x_line[0]),
            "x_max": float(x_line[1]),
            "y_min": float(y_line[0]),
            "y_max": float(y_line[1]),
        },
        "equation": equation,
        "interpretation": interpretation,
        "data_count": len(data_points),
        "r_squared": float(r_value**2),
        "correlation": correlation,
        "strength": strength,
    }
