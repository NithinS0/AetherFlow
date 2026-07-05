from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from app.database.session import get_db
from app.models import AuditLog, User
from app.schemas.schemas import AuditLogResponse
from app.dependencies.auth import get_current_user, require_permission
from app.api.common import PaginationParams, paginated

router = APIRouter()


@router.get(
    "",
    summary="List audit logs",
    description="Returns paginated audit log entries. Filter by ?action= or ?entity_type=.",
)
async def list_audit_logs(
    action: Optional[str] = Query(default=None),
    entity_type: Optional[str] = Query(default=None),
    pagination: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("view_audit_logs")),
):
    stmt = select(AuditLog)
    if action:
        stmt = stmt.filter(AuditLog.action == action)
    if entity_type:
        stmt = stmt.filter(AuditLog.entity_type == entity_type)

    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar() or 0
    result = await db.execute(
        stmt.order_by(AuditLog.timestamp.desc()).offset(pagination.offset).limit(pagination.limit)
    )
    logs = result.scalars().all()
    data = [AuditLogResponse.model_validate(l).model_dump(mode="json") for l in logs]
    return paginated(data, total, pagination, "Audit logs retrieved.")
