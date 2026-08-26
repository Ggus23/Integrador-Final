import logging
import os
import warnings
from contextlib import asynccontextmanager

# Fix para errores de PyTorch en Windows
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

# Silenciar advertencias de sklearn ANTES de importar los endpoints/modelos
from sklearn.exceptions import InconsistentVersionWarning
warnings.filterwarnings("ignore", category=InconsistentVersionWarning)

import nltk
import sentry_sdk
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.v1.api import api_router
from app.core.config import settings
from app.core.errors import (
    general_exception_handler,
    http_exception_handler,
    not_found_handler,
)
from app.core.limiter import limiter
from app.db.base import Base
from app.db.session import engine

logger = logging.getLogger(__name__)

try:
    nltk.download("stopwords", quiet=True)
    nltk.download("punkt", quiet=True)
    nltk.download("punkt_tab", quiet=True)
except Exception as e:
    logger.warning("Failed to download some NLTK dictionaries: %s", e)


from apscheduler.schedulers.background import BackgroundScheduler
from app.db.session import SessionLocal
from app.services.reminders import check_all_reminders
import asyncio

def run_scheduled_reminders():
    db = SessionLocal()
    try:
        # Ejecutar la función asíncrona dentro del event loop de este hilo
        asyncio.run(check_all_reminders(db))
    except Exception as e:
        logger.error(f"Error al ejecutar recordatorios programados: {e}")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    
    # Iniciar el planificador en segundo plano
    scheduler = BackgroundScheduler()
    # Ejecuta cada hora en punto (minute=0)
    scheduler.add_job(run_scheduled_reminders, "cron", minute=0)
    scheduler.start()
    
    yield
    scheduler.shutdown()


if settings.SENTRY_DSN and settings.SENTRY_DSN.strip().startswith("http"):
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        traces_sample_rate=1.0,
    )

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(404, not_found_handler)
app.add_exception_handler(Exception, general_exception_handler)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response


if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            str(origin).rstrip("/") for origin in settings.BACKEND_CORS_ORIGINS
        ],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
    )


app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    return {"message": "Welcome to MENTALINK API", "docs": "/docs"}