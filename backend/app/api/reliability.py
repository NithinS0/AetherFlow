"""
GET  /api/v1/reliability/metrics    — reliability metric snapshots
GET  /api/v1/reliability/health     — current system health
GET  /api/v1/reliability/recoveries — recovery event history
POST /api/v1/reliability/self-heal  — trigger manual self-healing loop
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict
from datetime import datetime

from app.database.session import get_db
from app.models import ReliabilityMetric, RecoveryEvent, User
from app.dependencies.auth import get_current_user
from app.reliability.health_monitor import HealthMonitor
from app.reliability.self_healer import SelfHealer
from app.api.common import PaginationParams, ok, paginated

router = APIRouter()


class ReliabilityMetricOut(BaseModel):
    id: UUID
    availability_rate: float
    recovery_success_rate: float
    mttr_seconds: float
    duplicate_prevented: int
    system_health_score: int
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


class RecoveryEventOut(BaseModel):
    id: UUID
    type: str
    worker_id: Optional[UUID] = None
    queue_id: Optional[UUID] = None
    job_id: Optional[UUID] = None
    duration_ms: int
    success: bool
    notes: Optional[str] = None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


@router.get(
    "/metrics",
    summary="Reliability metric history",
    description="Returns recent reliability metric snapshots (availability, MTTR, health score).",
)
async def get_metrics_history(
    pagination: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await HealthMonitor.calculate_reliability_metrics(db)

    total_res = await db.execute(select(func.count(ReliabilityMetric.id)))
    total = total_res.scalar() or 0

    res = await db.execute(
        select(ReliabilityMetric)
        .order_by(ReliabilityMetric.timestamp.desc())
        .offset(pagination.offset)
        .limit(pagination.limit)
    )
    items = res.scalars().all()
    data = [ReliabilityMetricOut.model_validate(m).model_dump(mode="json") for m in items]
    return paginated(data, total, pagination, "Reliability metrics retrieved.")


@router.get(
    "/health",
    summary="Current system health",
    description="Returns the live system health score, availability rate, and any active queue congestions.",
)
async def get_system_health(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    metric = await HealthMonitor.calculate_reliability_metrics(db)
    congestions = await HealthMonitor.detect_congestion(db, project_id)

    health_status = "healthy"
    if metric.system_health_score < 70:
        health_status = "critical"
    elif metric.system_health_score < 90 or len(congestions) > 0:
        health_status = "warning"

    return ok(
        {
            "status": health_status,
            "health_score": metric.system_health_score,
            "availability_rate": metric.availability_rate,
            "recovery_success_rate": metric.recovery_success_rate,
            "mttr_seconds": metric.mttr_seconds,
            "congestions": congestions,
        },
        "System health retrieved.",
    )


@router.get(
    "/recoveries",
    summary="Recovery event history",
    description="Returns paginated history of self-healing recovery events.",
)
async def get_recoveries_list(
    pagination: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total_res = await db.execute(select(func.count(RecoveryEvent.id)))
    total = total_res.scalar() or 0

    res = await db.execute(
        select(RecoveryEvent)
        .order_by(RecoveryEvent.timestamp.desc())
        .offset(pagination.offset)
        .limit(pagination.limit)
    )
    items = res.scalars().all()
    data = [RecoveryEventOut.model_validate(r).model_dump(mode="json") for r in items]
    return paginated(data, total, pagination, "Recovery events retrieved.")


@router.post(
    "/self-heal",
    status_code=status.HTTP_200_OK,
    summary="Trigger manual self-healing",
    description="Manually triggers the self-healing engine to scan and repair stalled jobs and degraded workers.",
)
async def trigger_manual_heal(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    recovered_count = await SelfHealer.heal_system(db)
    return ok(
        {"recovered_count": recovered_count},
        f"Self-healing completed. {recovered_count} item(s) repaired.",
    )
