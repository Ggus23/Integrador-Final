from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

async def not_found_handler(request: Request, exc: StarletteHTTPException):
    """
    Custom handler for 404 errors to ensure consistent JSON structure.
    """
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": "Resource not found"},
    )

async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """
    Handler for other HTTP exceptions to ensure consistent JSON structure.
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": str(exc.detail)},
    )

async def general_exception_handler(request: Request, exc: Exception):
    """
    Global exception handler for 500 errors.
    Prevents leaking internal stack traces to the client.
    """
    # In a real app, you would log the exception here: logger.error(f"Global error: {exc}")
    # print(f"Global error: {exc}") # For debugging locally if needed
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error. Please try again later."},
    )
