"""
GET  /api/v1/operations/overview   — platform-wide counts and health KPIs
GET  /api/v1/operations/events     — paginated activity feed
GET  /api/v1/operations/topology   — live digital-twin topology graph
POST /api/v1/operations/commands   — dispatch a cluster-wide control command
"""
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from uuid import UUID
import uuid
from pydantic import BaseModel, ConfigDict
from datetime import datetime

from app.database.session import get_db
from app.models import (
    Organization, Project, Queue, Worker, Job,
    SystemEvent, User, AuditLog,
)
from app.dependencies.auth import get_current_user
from app.reliability.health_monitor import HealthMonitor
from app.events.event_bus import EventBus
from app.api.common import PaginationParams, FilterParams, ok, created, paginated

router = APIRouter()


class SystemEventOut(BaseModel):
    id: UUID
    event_type: str
    entity_type: str
    entity_id: str
    details: Optional[str] = None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


class CommandCreate(BaseModel):
    command: str


VALID_COMMANDS = ["pause_all_queues", "resume_all_queues", "emergency_stop", "restart_scheduler"]


@router.get(
    "/overview",
    summary="Operations overview",
    description="Returns platform-wide counts for orgs, projects, queues, workers, and job status breakdown.",
)
async def get_operations_overview(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    orgs_count = (await db.execute(select(func.count(Organization.id)))).scalar() or 0
    projects_count = (await db.execute(select(func.count(Project.id)))).scalar() or 0
    queues_count = (await db.execute(select(func.count(Queue.id)))).scalar() or 0
    workers_count = (await db.execute(select(func.count(Worker.id)))).scalar() or 0

    jobs_running = (await db.execute(select(func.count(Job.id)).filter(Job.status == "running"))).scalar() or 0
    jobs_queued = (await db.execute(select(func.count(Job.id)).filter(Job.status == "queued"))).scalar() or 0
    jobs_completed = (await db.execute(select(func.count(Job.id)).filter(Job.status == "completed"))).scalar() or 0
    jobs_failed = (await db.execute(select(func.count(Job.id)).filter(Job.status == "failed"))).scalar() or 0
    jobs_dlq = (await db.execute(select(func.count(Job.id)).filter(Job.status == "dead_letter"))).scalar() or 0

    metric = await HealthMonitor.calculate_reliability_metrics(db)

    return ok(
        {
            "organizations": orgs_count,
            "projects": projects_count,
            "queues": queues_count,
            "workers": workers_count,
            "jobs": {
                "running": jobs_running,
                "queued": jobs_queued,
                "completed": jobs_completed,
                "failed": jobs_failed,
                "dlq": jobs_dlq,
            },
            "metrics": {
                "health_score": metric.system_health_score,
                "availability": metric.availability_rate,
                "recovery_success_rate": metric.recovery_success_rate,
                "mttr": metric.mttr_seconds,
            },
        },
        "Operations overview retrieved.",
    )


@router.get(
    "/events",
    summary="Activity event feed",
    description="Returns paginated system activity events. Filter by event_type.",
)
async def get_activity_feed(
    filters: FilterParams = Depends(),
    pagination: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(SystemEvent)
    if filters.status:  # reuse status field for event_type filter
        stmt = stmt.filter(SystemEvent.event_type == filters.status)

    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar() or 0
    res = await db.execute(
        stmt.order_by(SystemEvent.timestamp.desc())
        .offset(pagination.offset)
        .limit(pagination.limit)
    )
    items = res.scalars().all()
    data = [SystemEventOut.model_validate(e).model_dump(mode="json") for e in items]
    return paginated(data, total, pagination, "Activity events retrieved.")


@router.get(
    "/topology",
    summary="Live topology graph",
    description="Returns the real-time digital-twin topology: nodes (queues, workers, API) and edges.",
)
async def get_topology_twin(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    workers = (await db.execute(select(Worker))).scalars().all()
    queues = (await db.execute(select(Queue))).scalars().all()

    nodes = [
        {"id": "api", "type": "apiNode", "data": {"label": "API Gateway", "status": "healthy"}},
        {"id": "db", "type": "dbNode", "data": {"label": "PostgreSQL Cache & Locks", "status": "healthy"}},
    ]
    edges = [{"id": "api-db", "source": "api", "target": "db", "animated": True}]

    for q in queues:
        q_id = f"q-{q.id}"
        q_status = "warning" if q.is_paused else "healthy"
        nodes.append({"id": q_id, "type": "queueNode", "data": {"label": f"Queue: {q.name}", "status": q_status}})
        edges.append({"id": f"db-{q_id}", "source": "db", "target": q_id, "animated": not q.is_paused})

        for w in workers:
            if w.supported_queues and q.id in w.supported_queues:
                w_id = f"w-{w.id}"
                w_status = "offline" if w.status == "offline" else "healthy" if w.status == "idle" else "busy"
                if not any(n["id"] == w_id for n in nodes):
                    nodes.append({"id": w_id, "type": "workerNode", "data": {"label": w.name, "status": w_status}})
                edges.append({"id": f"{q_id}-{w_id}", "source": q_id, "target": w_id, "animated": w_status == "busy"})

    return ok({"nodes": nodes, "edges": edges}, "Topology retrieved.")


@router.post(
    "/commands",
    status_code=status.HTTP_200_OK,
    summary="Dispatch cluster command",
    description=f"Dispatch a cluster-wide control command. Valid commands: {VALID_COMMANDS}",
)
async def dispatch_command(
    body: CommandCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if body.command not in VALID_COMMANDS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid command. Valid options: {VALID_COMMANDS}",
        )

    if body.command in ("emergency_stop", "pause_all_queues"):
        queues = (await db.execute(select(Queue))).scalars().all()
        for q in queues:
            q.is_paused = True
        await db.commit()
        await EventBus.publish("queue_paused", "queue", "all", f"Emergency stop by {current_user.email}")

    elif body.command == "resume_all_queues":
        queues = (await db.execute(select(Queue))).scalars().all()
        for q in queues:
            q.is_paused = False
        await db.commit()
        await EventBus.publish("queue_resumed", "queue", "all", f"Queues resumed by {current_user.email}")

    elif body.command == "restart_scheduler":
        await EventBus.publish("scheduler_restart", "scheduler", "core", f"Restart issued by {current_user.email}")

    audit = AuditLog(
        id=uuid.uuid4(),
        user_id=current_user.id,
        action="dispatch_command",
        entity_type="operations",
        entity_id=body.command,
        details=f"Cluster command '{body.command}' dispatched by {current_user.email}",
        ip_address="127.0.0.1",
        timestamp=datetime.utcnow(),
    )
    db.add(audit)
    await db.commit()

    return ok({"command": body.command}, "Cluster command dispatched successfully.")
