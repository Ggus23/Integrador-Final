from fastapi import APIRouter

from app.api.v1.endpoints import (
    alerts,
    assessments,
    auth,
    checkins,
    consents,
    reports,
    risk,
    students,
    users,
)

api_router = APIRouter()

# Authentication & Users
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])

# Ethical & Legal
api_router.include_router(consents.router, prefix="/consents", tags=["consents"])

# Core Features
api_router.include_router(
    assessments.router, prefix="/assessments", tags=["assessments"]
)
api_router.include_router(checkins.router, prefix="/checkins", tags=["checkins"])

# Risk & Monitoring
api_router.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
api_router.include_router(risk.router, prefix="/risk", tags=["risk"])

# Management & Analytics
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(students.router, prefix="/students", tags=["students"])
