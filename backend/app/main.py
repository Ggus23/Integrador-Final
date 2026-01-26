from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.v1.api import api_router
from app.core.config import settings
from app.core.errors import general_exception_handler, http_exception_handler, not_found_handler
from app.core.limiter import limiter
import sentry_sdk

if settings.SENTRY_DSN and settings.SENTRY_DSN.strip().startswith("http"):
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        # Set traces_sample_rate to 1.0 to capture 100%
        # of transactions for performance monitoring.
        traces_sample_rate=1.0,
    )

# Initialize the FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME, openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Register slowapi exception handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Register custom exception handlers
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(404, not_found_handler) # Explicit 404 override
app.add_exception_handler(Exception, general_exception_handler)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """
    Middleware to add basic security headers to every response.
    """
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response


# Set up Cross-Origin Resource Sharing (CORS)
# Academic Note: Proper CORS configuration prevents Cross-Site Request Forgery (CSRF)
# and unauthorized data extraction from the frontend.
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            str(origin).rstrip("/") for origin in settings.BACKEND_CORS_ORIGINS
        ],
        allow_credentials=True,
        # Restrict to necessary methods and headers
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
    )

# Include all API routes under the configured prefix (e.g., /api/v1)
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    """
    Health check or root endpoint.
    """
    return {"message": "Welcome to MENTALINK API", "docs": "/docs"}
