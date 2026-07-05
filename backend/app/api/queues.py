"""
POST   /api/v1/queues              — create queue
GET    /api/v1/queues              — list queues (paginated, filterable)
GET    /api/v1/queues/{id}         — get queue
PUT    /api/v1/queues/{id}         — full update
PATCH  /api/v1/queues/{id}         — partial update (pause/resume/archive)
DELETE /api/v1/queues/{id}         — archive (soft-delete)
POST   /api/v1/queues/{id}/clone   — clone queue
GET    /api/v1/queues/{id}/export  — export configuration
POST   /api/v1/queues/import       — import from JSON config
"""
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from typing import List, Dict, Any, Optional
from uuid import UUID
import uuid
from pydantic import BaseModel, ConfigDict
from datetime import datetime

from app.database.session import get_db
from app.models import Queue, User, AuditLog
from app.dependencies.auth import get_current_user
from app.api.common import PaginationParams, FilterParams, ok, created, paginated, no_content

router = APIRouter()


class QueueCreateIn(BaseModel):
    name: str
    description: Optional[str] = None
    organization_id: UUID
    project_id: UUID
    priority: str = "medium"
    concurrency_limit: int = 5
    max_queue_size: int = 1000
    default_timeout: int = 60
    max_runtime: int = 300
    dlq_enabled: bool = True
    auto_retry: bool = True
    retry_policy_id: Optional[UUID] = None
    tags: Optional[List[str]] = []
    labels: Optional[Dict[str, str]] = {}


class QueueUpdateIn(BaseModel):
    description: Optional[str] = None
    priority: Optional[str] = None
    concurrency_limit: Optional[int] = None
    max_queue_size: Optional[int] = None
    default_timeout: Optional[int] = None
    max_runtime: Optional[int] = None
    dlq_enabled: Optional[bool] = None
    auto_retry: Optional[bool] = None
    retry_policy_id: Optional[UUID] = None
    tags: Optional[List[str]] = None
    labels: Optional[Dict[str, str]] = None
    is_paused: Optional[bool] = None
    is_archived: Optional[bool] = None


class QueueOut(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    organization_id: UUID
    project_id: UUID
    priority: str
    concurrency_limit: int
    max_queue_size: int
    default_timeout: int
    max_runtime: int
    dlq_enabled: bool
    auto_retry: bool
    is_paused: bool
    is_archived: bool
    health_score: int
    tags: Optional[List[str]] = []
    labels: Optional[Dict[str, str]] = {}
    retry_policy_id: Optional[UUID] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    summary="Create queue",
    description="Creates a new execution queue within a project.",
)
async def create_queue(
    q_in: QueueCreateIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    dupe = await db.execute(
        select(Queue).filter(Queue.name == q_in.name, Queue.project_id == q_in.project_id, Queue.is_archived == False)
    )
    if dupe.scalars().first():
        raise HTTPException(status_code=409, detail="A queue with this name already exists in the project.")

    queue = Queue(
        id=uuid.uuid4(),
        organization_id=q_in.organization_id,
        project_id=q_in.project_id,
        name=q_in.name,
        description=q_in.description,
        priority=q_in.priority,
        concurrency_limit=q_in.concurrency_limit,
        max_queue_size=q_in.max_queue_size,
        default_timeout=q_in.default_timeout,
        max_runtime=q_in.max_runtime,
        dlq_enabled=q_in.dlq_enabled,
        auto_retry=q_in.auto_retry,
        retry_policy_id=q_in.retry_policy_id,
        tags=q_in.tags or [],
        labels=q_in.labels or {},
        created_by_id=current_user.id,
    )
    db.add(queue)
    db.add(AuditLog(
        id=uuid.uuid4(), user_id=current_user.id, action="queue_created",
        entity_type="queue", entity_id=str(queue.id),
        details=f"Queue '{queue.name}' created."
    ))
    await db.commit()
    return created(QueueOut.model_validate(queue).model_dump(mode="json"), "Queue created.")


@router.get(
    "",
    summary="List queues",
    description="Returns paginated queues. Filter by ?project_id=, ?status=paused|active, ?search=.",
)
async def list_queues(
    project_id: Optional[UUID] = None,
    pagination: PaginationParams = Depends(),
    filters: FilterParams = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(Queue).filter(Queue.is_archived == False)
    if project_id:
        stmt = stmt.filter(Queue.project_id == project_id)
    if filters.status == "paused":
        stmt = stmt.filter(Queue.is_paused == True)
    elif filters.status == "active":
        stmt = stmt.filter(Queue.is_paused == False)
    if filters.search:
        term = f"%{filters.search}%"
        stmt = stmt.filter(or_(Queue.name.ilike(term), Queue.description.ilike(term)))

    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar() or 0
    res = await db.execute(stmt.order_by(Queue.name.asc()).offset(pagination.offset).limit(pagination.limit))
    queues = res.scalars().all()
    data = [QueueOut.model_validate(q).model_dump(mode="json") for q in queues]
    return paginated(data, total, pagination, "Queues retrieved.")


@router.get(
    "/{queue_id}",
    summary="Get queue",
    description="Returns a single queue by ID.",
)
async def get_queue(
    queue_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    res = await db.execute(select(Queue).filter(Queue.id == queue_id))
    queue = res.scalars().first()
    if not queue:
        raise HTTPException(status_code=404, detail="Queue not found")
    return ok(QueueOut.model_validate(queue).model_dump(mode="json"), "Queue retrieved.")


@router.put(
    "/{queue_id}",
    summary="Update queue",
    description="Partially update a queue's configuration (pass only fields to change).",
)
async def update_queue(
    queue_id: UUID,
    q_up: QueueUpdateIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    res = await db.execute(select(Queue).filter(Queue.id == queue_id))
    queue = res.scalars().first()
    if not queue:
        raise HTTPException(status_code=404, detail="Queue not found")

    for field, val in q_up.model_dump(exclude_unset=True).items():
        setattr(queue, field, val)

    db.add(AuditLog(
        id=uuid.uuid4(), user_id=current_user.id, action="queue_updated",
        entity_type="queue", entity_id=str(queue_id),
        details="Queue configuration updated."
    ))
    await db.commit()
    return ok(QueueOut.model_validate(queue).model_dump(mode="json"), "Queue updated.")


@router.patch(
    "/{queue_id}",
    summary="Partial update queue",
    description="Partially update a queue. Use to pause (`is_paused: true`) or archive (`is_archived: true`).",
)
async def patch_queue(
    queue_id: UUID,
    q_up: QueueUpdateIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    res = await db.execute(select(Queue).filter(Queue.id == queue_id))
    queue = res.scalars().first()
    if not queue:
        raise HTTPException(status_code=404, detail="Queue not found")

    for field, val in q_up.model_dump(exclude_unset=True).items():
        setattr(queue, field, val)

    await db.commit()
    return ok(QueueOut.model_validate(queue).model_dump(mode="json"), "Queue patched.")


@router.delete(
    "/{queue_id}",
    summary="Archive queue",
    description="Soft-deletes (archives) a queue. Archived queues are excluded from list results.",
)
async def archive_queue(
    queue_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    res = await db.execute(select(Queue).filter(Queue.id == queue_id))
    queue = res.scalars().first()
    if not queue:
        raise HTTPException(status_code=404, detail="Queue not found")
    queue.is_archived = True
    await db.commit()
    return no_content()


@router.post(
    "/{queue_id}/clone",
    status_code=status.HTTP_201_CREATED,
    summary="Clone queue",
    description="Creates a copy of an existing queue with a new name.",
)
async def clone_queue(
    queue_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    res = await db.execute(select(Queue).filter(Queue.id == queue_id))
    source = res.scalars().first()
    if not source:
        raise HTTPException(status_code=404, detail="Source queue not found")

    clone = Queue(
        id=uuid.uuid4(),
        organization_id=source.organization_id,
        project_id=source.project_id,
        name=f"{source.name}-clone-{uuid.uuid4().hex[:4]}",
        description=source.description,
        priority=source.priority,
        concurrency_limit=source.concurrency_limit,
        max_queue_size=source.max_queue_size,
        default_timeout=source.default_timeout,
        max_runtime=source.max_runtime,
        dlq_enabled=source.dlq_enabled,
        auto_retry=source.auto_retry,
        retry_policy_id=source.retry_policy_id,
        tags=source.tags,
        labels=source.labels,
        created_by_id=current_user.id,
    )
    db.add(clone)
    await db.commit()
    return created(QueueOut.model_validate(clone).model_dump(mode="json"), "Queue cloned.")


@router.get(
    "/{queue_id}/export",
    summary="Export queue config",
    description="Exports the queue configuration as a portable JSON object.",
)
async def export_queue_config(
    queue_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    res = await db.execute(select(Queue).filter(Queue.id == queue_id))
    queue = res.scalars().first()
    if not queue:
        raise HTTPException(status_code=404, detail="Queue not found")

    config = {
        "name": queue.name,
        "description": queue.description,
        "priority": queue.priority,
        "concurrency_limit": queue.concurrency_limit,
        "max_queue_size": queue.max_queue_size,
        "dlq_enabled": queue.dlq_enabled,
        "auto_retry": queue.auto_retry,
        "tags": queue.tags,
    }
    return ok(config, "Queue configuration exported.")


class QueueImportIn(BaseModel):
    config: Dict[str, Any]
    organization_id: UUID
    project_id: UUID


@router.post(
    "/import",
    status_code=status.HTTP_201_CREATED,
    summary="Import queue config",
    description="Creates a queue from an exported JSON configuration object.",
)
async def import_queue_config(
    body: QueueImportIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    name = body.config.get("name")
    if not name:
        raise HTTPException(status_code=400, detail="'name' field is required in config.")

    dupe = await db.execute(select(Queue).filter(Queue.name == name, Queue.project_id == body.project_id))
    if dupe.scalars().first():
        name = f"{name}-imported-{uuid.uuid4().hex[:4]}"

    queue = Queue(
        id=uuid.uuid4(),
        organization_id=body.organization_id,
        project_id=body.project_id,
        name=name,
        description=body.config.get("description"),
        priority=body.config.get("priority", "medium"),
        concurrency_limit=body.config.get("concurrency_limit", 5),
        max_queue_size=body.config.get("max_queue_size", 1000),
        dlq_enabled=body.config.get("dlq_enabled", True),
        auto_retry=body.config.get("auto_retry", True),
        tags=body.config.get("tags", []),
        created_by_id=current_user.id,
    )
    db.add(queue)
    await db.commit()
    return created(QueueOut.model_validate(queue).model_dump(mode="json"), "Queue imported.")


@router.get(
    "/{queue_id}/stats",
    summary="Queue statistics",
    description="Returns live job counts, throughput, and health metrics for a specific queue.",
)
async def get_queue_stats(
    queue_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models import Job
    res = await db.execute(select(Queue).filter(Queue.id == queue_id))
    queue = res.scalars().first()
    if not queue:
        raise HTTPException(status_code=404, detail="Queue not found")

    # Job counts by status
    status_counts = {}
    for s in ("queued", "running", "completed", "failed", "cancelled", "dead_letter"):
        cnt = (await db.execute(
            select(func.count(Job.id)).filter(Job.queue_id == queue_id, Job.status == s)
        )).scalar() or 0
        status_counts[s] = cnt

    total_jobs = sum(status_counts.values())
    success_rate = round(
        (status_counts["completed"] / total_jobs * 100) if total_jobs > 0 else 100.0, 2
    )
    failure_rate = round(
        (status_counts["failed"] / total_jobs * 100) if total_jobs > 0 else 0.0, 2
    )

    return ok(
        {
            "queue_id": str(queue_id),
            "queue_name": queue.name,
            "health_score": queue.health_score,
            "is_paused": queue.is_paused,
            "total_jobs": total_jobs,
            "status_counts": status_counts,
            "success_rate": success_rate,
            "failure_rate": failure_rate,
            "dlq_count": status_counts["dead_letter"],
            "concurrency_limit": queue.concurrency_limit,
        },
        "Queue statistics retrieved.",
    )
