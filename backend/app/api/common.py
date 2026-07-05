"""
AetherFlow Enterprise — Common REST API Helpers
================================================
Provides:
  - APIResponse[T]  : uniform envelope {success, message, data, meta, errors}
  - PaginationMeta  : page/page_size/total
  - PaginationParams: FastAPI dependency for ?page, ?page_size, ?sort, ?order
  - FilterParams    : FastAPI dependency for ?status, ?search, ?created_after, ?created_before
  - ok()            : build a 200 envelope
  - created()       : build a 201 envelope
  - paginated()     : build a paginated list envelope
"""
from typing import Any, Generic, List, Optional, TypeVar

from datetime import datetime

from fastapi import Query
from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


# ---------------------------------------------------------------------------
# Envelope schemas
# ---------------------------------------------------------------------------

class PaginationMeta(BaseModel):
    page: int
    page_size: int
    total: int
    total_pages: int

    model_config = ConfigDict(from_attributes=True)


class APIResponse(BaseModel, Generic[T]):
    """Universal REST response envelope."""
    success: bool = True
    message: str = "Operation completed successfully."
    data: Optional[T] = None
    meta: Optional[PaginationMeta] = None
    errors: List[dict] = []

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Query parameter dependencies
# ---------------------------------------------------------------------------

class PaginationParams:
    """Inject with Depends(PaginationParams) on any list endpoint."""

    def __init__(
        self,
        page: int = Query(default=1, ge=1, description="Page number (1-based)"),
        page_size: int = Query(default=20, ge=1, le=200, description="Items per page"),
        sort: str = Query(default="created_at", description="Sort field"),
        order: str = Query(default="desc", pattern="^(asc|desc)$", description="Sort direction"),
    ):
        self.page = page
        self.page_size = page_size
        self.sort = sort
        self.order = order

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size

    @property
    def limit(self) -> int:
        return self.page_size


class FilterParams:
    """Common filtering query params. Inject with Depends(FilterParams)."""

    def __init__(
        self,
        status: Optional[str] = Query(default=None, description="Filter by status"),
        search: Optional[str] = Query(default=None, description="Full-text search"),
        created_after: Optional[datetime] = Query(default=None, description="Filter records created after ISO datetime"),
        created_before: Optional[datetime] = Query(default=None, description="Filter records created before ISO datetime"),
    ):
        self.status = status
        self.search = search
        self.created_after = created_after
        self.created_before = created_before


# ---------------------------------------------------------------------------
# Builder helpers
# ---------------------------------------------------------------------------

def ok(data: Any = None, message: str = "Operation completed successfully.") -> dict:
    """Return a 200 OK envelope dict."""
    return APIResponse(success=True, message=message, data=data).model_dump(mode="json")


def created(data: Any = None, message: str = "Resource created successfully.") -> dict:
    """Return a 201 Created envelope dict."""
    return APIResponse(success=True, message=message, data=data).model_dump(mode="json")


def paginated(data: List[Any], total: int, pagination: PaginationParams, message: str = "Query successful.") -> dict:
    """Return a paginated envelope dict."""
    total_pages = max(1, -(-total // pagination.page_size))  # ceiling division
    meta = PaginationMeta(
        page=pagination.page,
        page_size=pagination.page_size,
        total=total,
        total_pages=total_pages,
    )
    return APIResponse(success=True, message=message, data=data, meta=meta).model_dump(mode="json")


def no_content() -> dict:
    """Return a 204-style envelope (used with 200 for DRF-compatible clients)."""
    return APIResponse(success=True, message="Resource deleted successfully.", data=None).model_dump(mode="json")
