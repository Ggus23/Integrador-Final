from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.api import deps

router = APIRouter()


@router.get("/me", response_model=schemas.academic_record.AcademicRecord)
def read_academic_record_me(
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get the academic record of the current user.
    """
    record = (
        db.query(models.AcademicRecord)
        .filter(models.AcademicRecord.user_id == current_user.id)
        .first()
    )
    if not record:
        # Create an empty record if it doesn't exist
        record = models.AcademicRecord(
            user_id=current_user.id,
            gpa=0.0,
            enrolled_credits=0,
            failed_classes=0,
            hito2_procesual=0.0,
            hito2_nota=0.0,
            hito3_procesual=0.0,
            hito3_nota=0.0,
            hito4_procesual=0.0,
            hito4_nota=0.0,
            hito5_procesual=0.0,
            hito5_nota=0.0,
        )
        db.add(record)
        db.commit()
        db.refresh(record)
    return record


@router.put("/me", response_model=schemas.academic_record.AcademicRecord)
def update_academic_record_me(
    record_in: schemas.academic_record.AcademicRecordUpdate,
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Update the academic record of the current user.
    """
    record = (
        db.query(models.AcademicRecord)
        .filter(models.AcademicRecord.user_id == current_user.id)
        .first()
    )
    if not record:
        record = models.AcademicRecord(user_id=current_user.id)
        db.add(record)

    # Update fields
    update_data = record_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(record, field, value)

    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/{student_id}", response_model=schemas.academic_record.AcademicRecord)
def read_academic_record(
    student_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_staff_user),
) -> Any:
    """
    Get the academic record of a specific student (Staff only).
    """
    record = (
        db.query(models.AcademicRecord)
        .filter(models.AcademicRecord.user_id == student_id)
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="Registro académico no encontrado")
    return record


@router.get(
    "/subjects/me",
    response_model=list[schemas.academic_subject_grade.AcademicSubjectGrade],
)
def read_my_subject_grades(
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get all subject grades for the current student.
    """
    return (
        db.query(models.AcademicSubjectGrade)
        .filter(models.AcademicSubjectGrade.user_id == current_user.id)
        .all()
    )


@router.post(
    "/subjects/me", response_model=schemas.academic_subject_grade.AcademicSubjectGrade
)
def create_or_update_subject_grade(
    *,
    db: Session = Depends(deps.get_db),
    grade_in: schemas.academic_subject_grade.AcademicSubjectGradeCreate,
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Create or update a specific subject grade (hitos).
    """
    existing_grade = (
        db.query(models.AcademicSubjectGrade)
        .filter(
            models.AcademicSubjectGrade.user_id == current_user.id,
            models.AcademicSubjectGrade.subject_id == grade_in.subject_id,
            models.AcademicSubjectGrade.hito_number == grade_in.hito_number,
        )
        .first()
    )

    if existing_grade:
        update_data = grade_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(existing_grade, field, value)
        db.add(existing_grade)
    else:
        existing_grade = models.AcademicSubjectGrade(
            user_id=current_user.id, **grade_in.model_dump()
        )
        db.add(existing_grade)

    db.commit()
    db.refresh(existing_grade)
    return existing_grade


import csv
from io import StringIO

from fastapi import UploadFile, status


@router.post("/upload-csv")
async def upload_academic_records_csv(
    *,
    db: Session = Depends(deps.get_db),
    file: UploadFile,
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Ingesta académica masiva (Endpoint de carga CSV).
    Simula la integración con la API de la Universidad.
    Formato esperado: email, gpa, enrolled_credits, failed_classes
    """
    if current_user.role != models.user.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not enough privileges")

    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo se admiten archivos CSV.",
        )

    content = await file.read()
    string_data = content.decode("utf-8")
    csv_reader = csv.DictReader(StringIO(string_data))

    records_created = 0
    records_updated = 0

    for row in csv_reader:
        email = row.get("email")
        if not email:
            continue

        student = db.query(models.User).filter(models.User.email == email).first()
        if not student:
            continue

        try:
            gpa = float(row.get("gpa", 0.0))
            credits = int(row.get("enrolled_credits", 0))
            failed = int(row.get("failed_classes", 0))

            # Additional hitos (optional in CSV)
            h2_p = float(row.get("hito2_procesual", 0.0))
            h2_n = float(row.get("hito2_nota", 0.0))
            h3_p = float(row.get("hito3_procesual", 0.0))
            h3_n = float(row.get("hito3_nota", 0.0))
            h4_p = float(row.get("hito4_procesual", 0.0))
            h4_n = float(row.get("hito4_nota", 0.0))
            h5_p = float(row.get("hito5_procesual", 0.0))
            h5_n = float(row.get("hito5_nota", 0.0))
        except ValueError:
            continue

        existing_record = (
            db.query(models.AcademicRecord)
            .filter(models.AcademicRecord.user_id == student.id)
            .first()
        )

        update_data = {
            "gpa": gpa,
            "enrolled_credits": credits,
            "failed_classes": failed,
            "hito2_procesual": h2_p,
            "hito2_nota": h2_n,
            "hito3_procesual": h3_p,
            "hito3_nota": h3_n,
            "hito4_procesual": h4_p,
            "hito4_nota": h4_n,
            "hito5_procesual": h5_p,
            "hito5_nota": h5_n,
        }

        if existing_record:
            for key, value in update_data.items():
                setattr(existing_record, key, value)
            records_updated += 1
        else:
            new_record = models.AcademicRecord(user_id=student.id, **update_data)
            db.add(new_record)
            records_created += 1

    db.commit()

    return {
        "message": "Carga académica exitosa.",
        "records_created": records_created,
        "records_updated": records_updated,
    }
