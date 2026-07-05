"""
POST  /api/v1/workers/register        — register a new worker node
POST  /api/v1/workers/{id}/heartbeat  — emit a worker heartbeat
GET   /api/v1/workers                 — list all workers (paginated, filterable)
GET   /api/v1/workers/{id}            — get single worker
PATCH /api/v1/workers/{id}/drain      — put worker into drain (stopping) mode
PATCH /api/v1/workers/{id}            — partial update (maintenance toggle)
POST  /api/v1/workers/{id}/restart    — re-register/restart a worker node
"""
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from typing import List, Optional
from uuid import UUID
import uuid
from pydantic import BaseModel, ConfigDict
from datetime import datetime

from app.database.session import get_db
from app.models import Worker, WorkerEvent, WorkerHeartbeat, User
from app.dependencies.auth import get_current_user
from app.api.common import PaginationParams, FilterParams, ok, created, paginated

router = APIRouter()


class WorkerOut(BaseModel):
    id: UUID
    name: str
    hostname: str
    version: str
    status: str
    supported_queues: Optional[List[UUID]] = []
    capabilities: Optional[List[str]] = []
    started_at: datetime
    last_heartbeat_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WorkerRegisterIn(BaseModel):
    name: str
    hostname: str
    version: str = "1.0.0"
    supported_queues: Optional[List[UUID]] = []
    capabilities: Optional[List[str]] = []


class WorkerHeartbeatIn(BaseModel):
    cpu_usage: float = 0.0
    memory_usage: float = 0.0
    current_job_count: int = 0


class WorkerPatch(BaseModel):
    maintenance: Optional[bool] = None


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    summary="Register worker",
    description="Registers a new worker node with the scheduler. "
                "If a worker with the same name already exists it is re-activated.",
)
async def register_worker(
    body: WorkerRegisterIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Re-activate existing worker with same name instead of creating duplicate
    res = await db.execute(select(Worker).filter(Worker.name == body.name))
    worker = res.scalars().first()

    if worker:
        worker.status = "idle"
        worker.hostname = body.hostname
        worker.version = body.version
        worker.supported_queues = [str(q) for q in (body.supported_queues or [])]
        worker.capabilities = body.capabilities or []
        worker.last_heartbeat_at = datetime.utcnow()
    else:
        worker = Worker(
            id=uuid.uuid4(),
            name=body.name,
            hostname=body.hostname,
            version=body.version,
            status="idle",
            supported_queues=[str(q) for q in (body.supported_queues or [])],
            capabilities=body.capabilities or [],
            started_at=datetime.utcnow(),
            last_heartbeat_at=datetime.utcnow(),
        )
        db.add(worker)

    evt = WorkerEvent(
        id=uuid.uuid4(),
        worker_id=worker.id,
        event_type="register",
        details=f"Worker {body.name} registered from {body.hostname}",
        timestamp=datetime.utcnow(),
    )
    db.add(evt)
    await db.commit()
    await db.refresh(worker)
    return created(WorkerOut.model_validate(worker).model_dump(mode="json"), "Worker registered.")


@router.post(
    "/{worker_id}/heartbeat",
    summary="Worker heartbeat",
    description="Records a heartbeat for a worker node, updating its health metrics and last_heartbeat_at timestamp.",
)
async def worker_heartbeat(
    worker_id: UUID,
    body: WorkerHeartbeatIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    res = await db.execute(select(Worker).filter(Worker.id == worker_id))
    worker = res.scalars().first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker node not found")

    # Update worker heartbeat timestamp and mark as online if it was offline
    worker.last_heartbeat_at = datetime.utcnow()
    if worker.status in ("offline", "stopping"):
        worker.status = "idle"

    # Record heartbeat metrics
    hb = WorkerHeartbeat(
        id=uuid.uuid4(),
        worker_id=worker_id,
        cpu_usage=body.cpu_usage,
        memory_usage=body.memory_usage,
        current_job_count=body.current_job_count,
        timestamp=datetime.utcnow(),
    )
    db.add(hb)
    await db.commit()

    return ok(
        {
            "worker_id": str(worker_id),
            "last_heartbeat_at": worker.last_heartbeat_at.isoformat(),
            "status": worker.status,
        },
        "Heartbeat recorded.",
    )


@router.get(
    "",
    summary="List workers",
    description="Returns paginated list of all registered worker nodes. Filter by ?status=online|idle|offline|maintenance.",
)
async def list_workers(
    pagination: PaginationParams = Depends(),
    filters: FilterParams = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(Worker)
    if filters.status:
        stmt = stmt.filter(Worker.status == filters.status)
    if filters.search:
        term = f"%{filters.search}%"
        stmt = stmt.filter(or_(Worker.name.ilike(term), Worker.hostname.ilike(term)))

    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar() or 0
    res = await db.execute(stmt.order_by(Worker.name.asc()).offset(pagination.offset).limit(pagination.limit))
    workers = res.scalars().all()
    data = [WorkerOut.model_validate(w).model_dump(mode="json") for w in workers]
    return paginated(data, total, pagination, "Workers retrieved.")


@router.get(
    "/{worker_id}",
    summary="Get worker",
    description="Returns a single worker node by ID.",
)
async def get_worker(
    worker_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    res = await db.execute(select(Worker).filter(Worker.id == worker_id))
    worker = res.scalars().first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker node not found")
    return ok(WorkerOut.model_validate(worker).model_dump(mode="json"), "Worker retrieved.")


@router.patch(
    "/{worker_id}/drain",
    summary="Drain worker",
    description="Transitions a worker into drain (stopping) mode — it will finish current jobs and accept no new ones.",
)
async def drain_worker(
    worker_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    res = await db.execute(select(Worker).filter(Worker.id == worker_id))
    worker = res.scalars().first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker node not found")

    worker.status = "stopping"
    evt = WorkerEvent(
        id=uuid.uuid4(),
        worker_id=worker_id,
        event_type="drain",
        details=f"Drain command dispatched by {current_user.email}",
        timestamp=datetime.utcnow(),
    )
    db.add(evt)
    await db.commit()
    return ok(WorkerOut.model_validate(worker).model_dump(mode="json"), "Worker set to drain mode.")


@router.patch(
    "/{worker_id}",
    summary="Update worker",
    description="Partially update a worker node (e.g., toggle maintenance mode).",
)
async def patch_worker(
    worker_id: UUID,
    body: WorkerPatch,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    res = await db.execute(select(Worker).filter(Worker.id == worker_id))
    worker = res.scalars().first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker node not found")

    if body.maintenance is not None:
        worker.status = "maintenance" if body.maintenance else "idle"
        evt = WorkerEvent(
            id=uuid.uuid4(),
            worker_id=worker_id,
            event_type="maintenance",
            details=f"Maintenance mode set to {body.maintenance} by {current_user.email}",
            timestamp=datetime.utcnow(),
        )
        db.add(evt)

    await db.commit()
    return ok(WorkerOut.model_validate(worker).model_dump(mode="json"), "Worker updated.")


@router.post(
    "/{worker_id}/restart",
    summary="Restart worker",
    description="Re-registers and restarts a worker node simulation.",
)
async def restart_worker(
    worker_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    res = await db.execute(select(Worker).filter(Worker.id == worker_id))
    worker = res.scalars().first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker node not found")

    worker.status = "idle"
    evt = WorkerEvent(
        id=uuid.uuid4(),
        worker_id=worker_id,
        event_type="restart",
        details=f"Worker re-registered by {current_user.email}",
        timestamp=datetime.utcnow(),
    )
    db.add(evt)
    await db.commit()
    return ok({"worker_id": str(worker_id), "status": "restarting"}, "Worker restart initiated.")
