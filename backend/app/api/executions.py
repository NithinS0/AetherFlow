"""
GET  /api/v1/executions              — list job executions (paginated)
GET  /api/v1/executions/{id}/logs    — get logs for an execution

DLQ endpoints moved to /api/v1/dead-letter (see dead_letter.py)
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Dict, Any, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict
from datetime import datetime

from app.database.session import get_db
from app.models import JobExecution, JobLog, User
from app.dependencies.auth import get_current_user
from app.api.common import PaginationParams, paginated, ok

router = APIRouter()


class JobExecutionOut(BaseModel):
    id: UUID
    job_id: UUID
    worker_id: UUID
    status: str
    start_time: datetime
    end_time: Optional[datetime] = None
    duration: Optional[float] = None
    output: Optional[Dict[str, Any]] = None
    error: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)


class JobLogOut(BaseModel):
    id: UUID
    execution_id: UUID
    level: str
    message: str
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


@router.get(
    "",
    summary="List executions",
    description="Returns paginated job execution records.",
)
async def list_executions(
    pagination: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total = (await db.execute(select(func.count(JobExecution.id)))).scalar() or 0
    res = await db.execute(
        select(JobExecution)
        .order_by(JobExecution.start_time.desc())
        .offset(pagination.offset)
        .limit(pagination.limit)
    )
    items = res.scalars().all()
    data = [JobExecutionOut.model_validate(e).model_dump(mode="json") for e in items]
    return paginated(data, total, pagination, "Executions retrieved.")


@router.get(
    "/{execution_id}/logs",
    summary="Get execution logs",
    description="Returns all log lines for a specific job execution.",
)
async def get_execution_logs(
    execution_id: UUID,
    pagination: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total = (await db.execute(
        select(func.count(JobLog.id)).filter(JobLog.execution_id == execution_id)
    )).scalar() or 0

    res = await db.execute(
        select(JobLog)
        .filter(JobLog.execution_id == execution_id)
        .order_by(JobLog.timestamp.asc())
        .offset(pagination.offset)
        .limit(pagination.limit)
    )
    logs = res.scalars().all()
    data = [JobLogOut.model_validate(l).model_dump(mode="json") for l in logs]
    return paginated(data, total, pagination, "Execution logs retrieved.")
