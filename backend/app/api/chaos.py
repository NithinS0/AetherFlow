"""
GET  /api/v1/chaos-runs          — list chaos run history
POST /api/v1/chaos-runs          — trigger a new chaos scenario
"""
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from uuid import UUID
from app.database.session import get_db
from app.models import ChaosRun, User
from app.dependencies.auth import get_current_user
from app.chaos.chaos_engine import ChaosEngine
from app.api.common import PaginationParams, FilterParams, ok, created, paginated
from pydantic import BaseModel, ConfigDict
from datetime import datetime

router = APIRouter()


class ChaosRunOut(BaseModel):
    id: UUID
    scenario: str
    started_at: datetime
    finished_at: Optional[datetime] = None
    status: str
    affected_workers_count: int
    affected_jobs_count: int
    success: Optional[bool] = None
    recovery_duration_ms: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


class ChaosRunCreate(BaseModel):
    scenario: str
    project_id: Optional[UUID] = None


@router.get(
    "",
    summary="List chaos run history",
    description="Returns paginated history of all chaos engineering runs.",
)
async def list_chaos_runs(
    pagination: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total_res = await db.execute(select(func.count(ChaosRun.id)))
    total = total_res.scalar() or 0

    res = await db.execute(
        select(ChaosRun)
        .order_by(ChaosRun.started_at.desc())
        .offset(pagination.offset)
        .limit(pagination.limit)
    )
    runs = res.scalars().all()
    data = [ChaosRunOut.model_validate(r).model_dump(mode="json") for r in runs]
    return paginated(data, total, pagination, "Chaos run history retrieved.")


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    summary="Trigger a chaos scenario",
    description="Execute a chaos engineering scenario against the live cluster.",
)
async def execute_chaos_scenario(
    body: ChaosRunCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    valid_scenarios = ["kill_worker", "pause_worker", "queue_flood", "fail_execution"]
    if body.scenario not in valid_scenarios:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid chaos scenario. Valid options: {valid_scenarios}",
        )
    run = await ChaosEngine.trigger_chaos(db, body.scenario, body.project_id)
    return created(ChaosRunOut.model_validate(run).model_dump(mode="json"), "Chaos scenario triggered.")
