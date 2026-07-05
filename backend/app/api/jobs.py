"""
POST  /api/v1/jobs                           — create a job
GET   /api/v1/jobs                           — list jobs (paginated, filterable)
GET   /api/v1/jobs/{id}                      — get a single job
PATCH /api/v1/jobs/{id}                      — partial update (cancel, change status)
POST  /api/v1/jobs/{id}/dependencies         — link a dependency
POST  /api/v1/jobs/scheduled                 — create a scheduled cron job
GET   /api/v1/jobs/scheduled                 — list scheduled jobs
PATCH /api/v1/jobs/scheduled/{id}            — update / toggle a scheduled job
POST  /api/v1/jobs/batches                   — create a batch job
GET   /api/v1/jobs/batches                   — list batch jobs
"""
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from typing import List, Dict, Any, Optional
from uuid import UUID
import uuid
from datetime import datetime, timedelta
from pydantic import BaseModel, ConfigDict

from app.database.session import get_db
from app.models import Job, Queue, ScheduledJob, BatchJob, job_dependencies, User, AuditLog
from app.dependencies.auth import get_current_user
from app.scheduler.cron_manager import CronManager
from app.api.common import PaginationParams, FilterParams, ok, created, paginated

router = APIRouter()


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class JobCreateIn(BaseModel):
    name: str
    queue_id: UUID
    type: str = "immediate"
    priority: str = "medium"
    payload: Optional[Dict[str, Any]] = None
    max_retries: int = 3
    timeout_seconds: int = 60
    scheduled_time: Optional[datetime] = None


class JobPatch(BaseModel):
    status: Optional[str] = None  # e.g. "cancelled"
    priority: Optional[str] = None


class JobOut(BaseModel):
    id: UUID
    queue_id: UUID
    batch_id: Optional[UUID] = None
    type: str
    status: str
    priority: str
    payload: Optional[Dict[str, Any]] = None
    scheduled_time: datetime
    retry_count: int
    max_retries: int
    timeout_seconds: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ScheduledJobCreateIn(BaseModel):
    name: str
    queue_id: UUID
    cron_expression: str
    timezone: str = "UTC"
    payload: Optional[Dict[str, Any]] = None


class ScheduledJobPatch(BaseModel):
    is_enabled: Optional[bool] = None
    cron_expression: Optional[str] = None
    timezone: Optional[str] = None
    payload: Optional[Dict[str, Any]] = None


class ScheduledJobOut(BaseModel):
    id: UUID
    name: str
    queue_id: UUID
    cron_expression: str
    timezone: str
    payload: Optional[Dict[str, Any]] = None
    is_enabled: bool
    last_run_at: Optional[datetime] = None
    next_run_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class BatchJobCreateIn(BaseModel):
    name: str
    jobs: List[JobCreateIn]


class BatchJobOut(BaseModel):
    id: UUID
    name: str
    status: str
    total_jobs: int
    completed_jobs: int
    failed_jobs: int

    model_config = ConfigDict(from_attributes=True)


class DependencyLink(BaseModel):
    parent_job_id: UUID


# ---------------------------------------------------------------------------
# Jobs
# ---------------------------------------------------------------------------

@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    summary="Create job",
    description="Creates a new job and places it into the target queue.",
)
async def create_job(
    job_in: JobCreateIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q_res = await db.execute(select(Queue).filter(Queue.id == job_in.queue_id))
    if not q_res.scalars().first():
        raise HTTPException(status_code=404, detail="Target execution queue not found")

    job = Job(
        id=uuid.uuid4(),
        queue_id=job_in.queue_id,
        type=job_in.type,
        status="pending" if job_in.type in ["delayed", "scheduled", "dependency"] else "queued",
        priority=job_in.priority,
        payload=job_in.payload or {},
        scheduled_time=job_in.scheduled_time or datetime.utcnow(),
        max_retries=job_in.max_retries,
        timeout_seconds=job_in.timeout_seconds,
        created_by_id=current_user.id,
    )
    db.add(job)
    await db.commit()
    return created(JobOut.model_validate(job).model_dump(mode="json"), "Job created.")


@router.get(
    "",
    summary="List jobs",
    description="Returns paginated jobs. Filter by ?project_id=, ?status=, ?search=, ?created_after=, ?created_before=.",
)
async def list_jobs(
    project_id: Optional[UUID] = None,
    pagination: PaginationParams = Depends(),
    filters: FilterParams = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(Job)
    if project_id:
        stmt = stmt.join(Queue, Job.queue_id == Queue.id).filter(Queue.project_id == project_id)
    if filters.status:
        stmt = stmt.filter(Job.status == filters.status)
    if filters.created_after:
        stmt = stmt.filter(Job.created_at >= filters.created_after)
    if filters.created_before:
        stmt = stmt.filter(Job.created_at <= filters.created_before)

    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar() or 0
    res = await db.execute(stmt.order_by(Job.created_at.desc()).offset(pagination.offset).limit(pagination.limit))
    jobs = res.scalars().all()
    data = [JobOut.model_validate(j).model_dump(mode="json") for j in jobs]
    return paginated(data, total, pagination, "Jobs retrieved.")


@router.get(
    "/{job_id}",
    summary="Get job",
    description="Returns a single job by ID.",
)
async def get_job(
    job_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    res = await db.execute(select(Job).filter(Job.id == job_id))
    job = res.scalars().first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return ok(JobOut.model_validate(job).model_dump(mode="json"), "Job retrieved.")


@router.patch(
    "/{job_id}",
    summary="Update job",
    description="Partially updates a job. Pass `{status: 'cancelled'}` to cancel a pending/queued job.",
)
async def patch_job(
    job_id: UUID,
    body: JobPatch,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    res = await db.execute(select(Job).filter(Job.id == job_id))
    job = res.scalars().first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if body.status == "cancelled":
        if job.status not in ["pending", "queued"]:
            raise HTTPException(status_code=400, detail="Only pending or queued jobs can be cancelled.")
        job.status = "cancelled"
    elif body.status:
        job.status = body.status

    if body.priority:
        job.priority = body.priority

    await db.commit()
    return ok(JobOut.model_validate(job).model_dump(mode="json"), "Job updated.")


@router.post(
    "/{job_id}/dependencies",
    summary="Link job dependency",
    description="Adds a parent→child dependency relationship between two jobs.",
)
async def link_job_dependency(
    job_id: UUID,
    body: DependencyLink,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    parent_res = await db.execute(select(Job).filter(Job.id == body.parent_job_id))
    child_res = await db.execute(select(Job).filter(Job.id == job_id))
    if not parent_res.scalars().first() or not child_res.scalars().first():
        raise HTTPException(status_code=404, detail="Parent or child job not found")

    await db.execute(
        job_dependencies.insert().values(parent_job_id=body.parent_job_id, child_job_id=job_id)
    )
    await db.commit()
    return ok(
        {"parent_id": str(body.parent_job_id), "child_id": str(job_id)},
        "Dependency link created.",
    )


# ---------------------------------------------------------------------------
# Scheduled Jobs
# ---------------------------------------------------------------------------

@router.post(
    "/scheduled",
    status_code=status.HTTP_201_CREATED,
    summary="Create scheduled job",
    description="Creates a cron-based scheduled job.",
)
async def create_scheduled_job(
    sched_in: ScheduledJobCreateIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not CronManager.validate_cron(sched_in.cron_expression):
        raise HTTPException(status_code=400, detail="Invalid cron expression syntax.")

    next_time = CronManager.calculate_next_run(sched_in.cron_expression, sched_in.timezone)
    s_job = ScheduledJob(
        id=uuid.uuid4(),
        name=sched_in.name,
        queue_id=sched_in.queue_id,
        cron_expression=sched_in.cron_expression,
        timezone=sched_in.timezone,
        payload=sched_in.payload or {},
        is_enabled=True,
        next_run_at=next_time,
        created_by_id=current_user.id,
    )
    db.add(s_job)
    await db.commit()
    return created(ScheduledJobOut.model_validate(s_job).model_dump(mode="json"), "Scheduled job created.")


@router.get(
    "/scheduled",
    summary="List scheduled jobs",
    description="Returns paginated list of scheduled cron jobs. Filter by ?project_id=.",
)
async def list_scheduled_jobs(
    project_id: Optional[UUID] = None,
    pagination: PaginationParams = Depends(),
    filters: FilterParams = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(ScheduledJob)
    if project_id:
        stmt = stmt.join(Queue, ScheduledJob.queue_id == Queue.id).filter(Queue.project_id == project_id)

    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar() or 0
    res = await db.execute(stmt.offset(pagination.offset).limit(pagination.limit))
    jobs = res.scalars().all()
    data = [ScheduledJobOut.model_validate(j).model_dump(mode="json") for j in jobs]
    return paginated(data, total, pagination, "Scheduled jobs retrieved.")


@router.patch(
    "/scheduled/{scheduled_job_id}",
    summary="Update scheduled job",
    description="Partially update a scheduled job. Pass `{is_enabled: false}` to disable/pause.",
)
async def patch_scheduled_job(
    scheduled_job_id: UUID,
    body: ScheduledJobPatch,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    res = await db.execute(select(ScheduledJob).filter(ScheduledJob.id == scheduled_job_id))
    s_job = res.scalars().first()
    if not s_job:
        raise HTTPException(status_code=404, detail="Scheduled job not found")

    if body.is_enabled is not None:
        s_job.is_enabled = body.is_enabled
        if body.is_enabled:
            s_job.next_run_at = CronManager.calculate_next_run(s_job.cron_expression, s_job.timezone)
        else:
            s_job.next_run_at = None

    if body.cron_expression:
        if not CronManager.validate_cron(body.cron_expression):
            raise HTTPException(status_code=400, detail="Invalid cron expression.")
        s_job.cron_expression = body.cron_expression
        s_job.next_run_at = CronManager.calculate_next_run(body.cron_expression, s_job.timezone)

    if body.timezone:
        s_job.timezone = body.timezone
    if body.payload is not None:
        s_job.payload = body.payload

    await db.commit()
    return ok(ScheduledJobOut.model_validate(s_job).model_dump(mode="json"), "Scheduled job updated.")


# ---------------------------------------------------------------------------
# Batch Jobs
# ---------------------------------------------------------------------------

@router.post(
    "/batches",
    status_code=status.HTTP_201_CREATED,
    summary="Create batch job",
    description="Creates a named batch with multiple individual jobs.",
)
async def create_batch_job(
    batch_in: BatchJobCreateIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    batch = BatchJob(
        id=uuid.uuid4(),
        name=batch_in.name,
        status="pending",
        total_jobs=len(batch_in.jobs),
    )
    db.add(batch)
    await db.flush()

    for idx, j_in in enumerate(batch_in.jobs):
        job = Job(
            id=uuid.uuid4(),
            queue_id=j_in.queue_id,
            batch_id=batch.id,
            type="batch",
            status="queued",
            priority=j_in.priority,
            payload=j_in.payload or {},
            scheduled_time=datetime.utcnow() + timedelta(milliseconds=idx * 10),
            max_retries=j_in.max_retries,
            timeout_seconds=j_in.timeout_seconds,
            created_by_id=current_user.id,
        )
        db.add(job)

    await db.commit()
    return created(BatchJobOut.model_validate(batch).model_dump(mode="json"), "Batch created.")


@router.get(
    "/batches",
    summary="List batches",
    description="Returns paginated list of all batch jobs.",
)
async def list_batches(
    pagination: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total = (await db.execute(select(func.count(BatchJob.id)))).scalar() or 0
    res = await db.execute(
        select(BatchJob).order_by(BatchJob.created_at.desc()).offset(pagination.offset).limit(pagination.limit)
    )
    batches = res.scalars().all()
    data = [BatchJobOut.model_validate(b).model_dump(mode="json") for b in batches]
    return paginated(data, total, pagination, "Batches retrieved.")
