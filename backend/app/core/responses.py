from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel

T = TypeVar("T")

class APIResponse(BaseModel, Generic[T]):
    success: bool
    message: str = ""
    data: Optional[T] = None
    meta: Optional[dict[str, Any]] = None
    errors: Optional[list[str]] = None

def success_response(data: T = None, message: str = "Success", meta: dict = None) -> APIResponse[T]:
    return APIResponse(
        success=True,
        message=message,
        data=data,
        meta=meta or {},
        errors=[]
    )

def error_response(message: str = "Error", errors: list[str] = None) -> APIResponse:
    return APIResponse(
        success=False,
        message=message,
        data=None,
        meta={},
        errors=errors or []
    )
