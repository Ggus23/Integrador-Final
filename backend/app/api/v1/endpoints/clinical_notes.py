from typing import Any, List

from app import models, schemas
from app.api import deps
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter()


@router.post(
    "/",
    response_model=schemas.clinical_note.ClinicalNote,
    status_code=status.HTTP_201_CREATED,
)
def create_clinical_note(
    *,
    db: Session = Depends(deps.get_db),
    note_in: schemas.clinical_note.ClinicalNoteCreate,
    current_user: models.user.User = Depends(deps.get_psychologist_user),
) -> Any:

    student = (
        db.query(models.user.User)
        .filter(models.user.User.id == note_in.student_id)
        .first()
    )
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    note = models.clinical_note.ClinicalNote(
        student_id=note_in.student_id,
        psychologist_id=current_user.id,
        content=note_in.content,
    )
    db.add(note)
    db.commit()
    db.refresh(note)

    response = schemas.clinical_note.ClinicalNote.model_validate(note)
    response.psychologist_name = current_user.full_name

    return response


@router.get("/", response_model=List[schemas.clinical_note.ClinicalNote])
def read_clinical_notes(
    *,
    db: Session = Depends(deps.get_db),
    student_id: int,
    current_user: models.user.User = Depends(deps.get_psychologist_user),
) -> Any:

    notes = (
        db.query(models.clinical_note.ClinicalNote)
        .filter(models.clinical_note.ClinicalNote.student_id == student_id)
        .order_by(models.clinical_note.ClinicalNote.created_at.desc())
        .all()
    )

    results = []
    for note in notes:
        n = schemas.clinical_note.ClinicalNote.model_validate(note)
        if note.psychologist:
            n.psychologist_name = note.psychologist.full_name
        results.append(n)

    return results
