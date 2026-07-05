"""
GET    /api/v1/dead-letter           — list all dead-letter (DLQ) jobs (paginated, filterable)
POST   /api/v1/dead-letter/{id}/retry — re-queue a DLQ job
DELETE /api/v1/dead-letter/{id}       — permanently purge a DLQ job
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Dict, Any, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict
from datetime import datetime

from app.database.session import get_db
from app.models import Job, User
from app.dependencies.auth import get_current_user
from app.api.common import PaginationParams, FilterParams, ok, paginated, no_content

router = APIRouter()


class DLQJobOut(BaseModel):
    id: UUID
    queue_id: UUID
    type: str
    status: str
    priority: str
    payload: Optional[Dict[str, Any]] = None
    retry_count: int
    max_retries: int
    scheduled_time: datetime
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


@router.get(
    "",
    summary="List dead-letter jobs",
    description="Returns paginated list of all jobs in the Dead Letter Queue (status=dead_letter). "
                "Filter by ?search= or date range.",
)
async def list_dlq_jobs(
    pagination: PaginationParams = Depends(),
    filters: FilterParams = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(Job).filter(Job.status == "dead_letter")
    if filters.created_after:
        stmt = stmt.filter(Job.created_at >= filters.created_after)
    if filters.created_before:
        stmt = stmt.filter(Job.created_at <= filters.created_before)

    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar() or 0
    res = await db.execute(
        stmt.order_by(Job.created_at.desc()).offset(pagination.offset).limit(pagination.limit)
    )
    jobs = res.scalars().all()
    data = [DLQJobOut.model_validate(j).model_dump(mode="json") for j in jobs]
    return paginated(data, total, pagination, "Dead-letter queue jobs retrieved.")


@router.post(
    "/{job_id}/retry",
    status_code=status.HTTP_200_OK,
    summary="Retry DLQ job",
    description="Re-queues a dead-letter job by resetting its retry count and status to 'queued'.",
)
async def retry_dlq_job(
    job_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    res = await db.execute(select(Job).filter(Job.id == job_id))
    job = res.scalars().first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.status != "dead_letter":
        raise HTTPException(status_code=400, detail="Only jobs in the dead-letter queue can be retried.")

    job.status = "queued"
    job.retry_count = 0
    job.scheduled_time = datetime.utcnow()
    await db.commit()
    return ok(DLQJobOut.model_validate(job).model_dump(mode="json"), "Job re-queued from dead-letter queue.")


@router.delete(
    "/{job_id}",
    status_code=status.HTTP_200_OK,
    summary="Purge DLQ job",
    description="Permanently deletes a dead-letter job. This action is irreversible.",
)
async def delete_dlq_job(
    job_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    res = await db.execute(select(Job).filter(Job.id == job_id))
    job = res.scalars().first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.status != "dead_letter":
        raise HTTPException(status_code=400, detail="Only dead-letter jobs can be purged.")

    await db.delete(job)
    await db.commit()
    return no_content()
