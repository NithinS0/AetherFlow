"""
AetherFlow Enterprise — Global Exception Handlers
==================================================
Registers structured error responses for all FastAPI exception types
so that every error returns the standard APIResponse envelope.
"""
from __future__ import annotations

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.exc import IntegrityError


# ---------------------------------------------------------------------------
# Error detail schema
# ---------------------------------------------------------------------------

class ErrorDetail(BaseModel):
    field: Optional[str] = None
    message: str
    code: str = "error"


def _envelope(
    success: bool,
    message: str,
    errors: List[dict],
    status_code: int,
    data: Optional[dict] = None,
) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={
            "success": success,
            "message": message,
            "data": data,
            "meta": None,
            "errors": errors,
        },
    )


# ---------------------------------------------------------------------------
# Handler registration
# ---------------------------------------------------------------------------

def register_exception_handlers(app: FastAPI) -> None:
    """Call once in main.py after app is created."""

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        errors = []
        for err in exc.errors():
            field = ".".join(str(loc) for loc in err.get("loc", []))
            errors.append(ErrorDetail(field=field, message=err["msg"], code="validation_error").model_dump())
        return _envelope(
            success=False,
            message="Request validation failed. Please check the errors array.",
            errors=errors,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )

    @app.exception_handler(IntegrityError)
    async def integrity_exception_handler(request: Request, exc: IntegrityError):
        return _envelope(
            success=False,
            message="A database integrity constraint was violated (duplicate or missing reference).",
            errors=[ErrorDetail(message=str(exc.orig), code="integrity_error").model_dump()],
            status_code=status.HTTP_409_CONFLICT,
        )

    @app.exception_handler(404)
    async def not_found_handler(request: Request, exc):
        return _envelope(
            success=False,
            message="The requested resource was not found.",
            errors=[ErrorDetail(message="Not found", code="not_found").model_dump()],
            status_code=status.HTTP_404_NOT_FOUND,
        )

    @app.exception_handler(403)
    async def forbidden_handler(request: Request, exc):
        return _envelope(
            success=False,
            message="You do not have permission to perform this action.",
            errors=[ErrorDetail(message="Forbidden", code="forbidden").model_dump()],
            status_code=status.HTTP_403_FORBIDDEN,
        )

    @app.exception_handler(401)
    async def unauthorized_handler(request: Request, exc):
        return _envelope(
            success=False,
            message="Authentication required. Please provide a valid Bearer token.",
            errors=[ErrorDetail(message="Unauthorized", code="unauthorized").model_dump()],
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    @app.exception_handler(500)
    async def internal_error_handler(request: Request, exc):
        return _envelope(
            success=False,
            message="An unexpected internal server error occurred.",
            errors=[ErrorDetail(message="Internal server error", code="internal_error").model_dump()],
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
