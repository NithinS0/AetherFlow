from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from .responses import error_response

class BusinessError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

async def business_exception_handler(request: Request, exc: BusinessError):
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response(message=exc.message).model_dump()
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = [f"{err['loc'][-1]}: {err['msg']}" for err in exc.errors()]
    return JSONResponse(
        status_code=422,
        content=error_response(message="Validation Error", errors=errors).model_dump()
    )

async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    return JSONResponse(
        status_code=500,
        content=error_response(message="Database error occurred", errors=[str(exc)]).model_dump()
    )

async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content=error_response(message="An unexpected error occurred", errors=[str(exc)]).model_dump()
    )

def setup_exception_handlers(app):
    app.add_exception_handler(BusinessError, business_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)
    app.add_exception_handler(Exception, global_exception_handler)
