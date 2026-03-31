from fastapi import APIRouter

from app.api.v1.endpoints import (
    academic,
    alerts,
    appointment,
    assessments,
    auth,
    checkins,
    clinical_notes,
    consents,
    diary,
    emotion,
    reports,
    risk,
    students,
    users,
    visualizations,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(academic.router, prefix="/academic", tags=["academic"])

api_router.include_router(consents.router, prefix="/consents", tags=["consents"])

api_router.include_router(
    assessments.router, prefix="/assessments", tags=["assessments"]
)
api_router.include_router(checkins.router, prefix="/checkins", tags=["checkins"])

api_router.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
api_router.include_router(risk.router, prefix="/risk", tags=["risk"])

api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(students.router, prefix="/students", tags=["students"])
api_router.include_router(
    clinical_notes.router, prefix="/clinical-notes", tags=["clinical-notes"]
)
api_router.include_router(
    appointment.router, prefix="/appointments", tags=["appointments"]
)
api_router.include_router(diary.router, prefix="/diary", tags=["diary"])
api_router.include_router(emotion.router, prefix="/emotion", tags=["emotion"])
api_router.include_router(
    visualizations.router, prefix="/visualizations", tags=["visualizations"]
)
