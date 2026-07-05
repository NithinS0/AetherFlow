from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Dict, Any, Optional
from uuid import UUID
import uuid
from app.database.session import get_db
from app.models import AIRecommendation, Queue, Worker, User, AuditLog, AIActivity
from app.dependencies.auth import get_current_user
from app.api.common import PaginationParams, FilterParams, ok, created, paginated
from pydantic import BaseModel, ConfigDict
from datetime import datetime

router = APIRouter()


# Schema structures
class AIRecommendationOut(BaseModel):
    id: UUID
    type: str
    title: str
    description: str
    priority: str
    status: str
    queue_id: Optional[UUID] = None
    worker_id: Optional[UUID] = None
    suggested_value: Optional[str] = None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)

# --- API Endpoints ---

@router.get("")
async def list_recommendations(
    pagination: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(AIRecommendation)
    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar() or 0
    res = await db.execute(stmt.order_by(AIRecommendation.timestamp.desc()).offset(pagination.offset).limit(pagination.limit))
    recs = res.scalars().all()
    data = [AIRecommendationOut.model_validate(r).model_dump(mode="json") for r in recs]
    return paginated(data, total, pagination, "Recommendations retrieved.")


@router.patch("/{rec_id}/approve")
async def approve_recommendation(
    rec_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "Administrator":
        raise HTTPException(
            status_code=403,
            detail="RBAC Clearance Denied: Only Administrators can approve system optimizations."
        )

    res = await db.execute(select(AIRecommendation).filter(AIRecommendation.id == rec_id))
    rec = res.scalars().first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    if rec.status != "pending":
        raise HTTPException(status_code=400, detail="Recommendation has already been reviewed.")

    rec.status = "approved"

    # Simulated Execution Logic
    if rec.type == "concurrency" and rec.queue_id and rec.suggested_value:
        q_res = await db.execute(select(Queue).filter(Queue.id == rec.queue_id))
        queue = q_res.scalars().first()
        if queue:
            queue.concurrency_limit = int(rec.suggested_value)

    # Log SRE Audit trace
    audit = AuditLog(
        id=uuid.uuid4(),
        user_id=current_user.id,
        action="approve_recommendation",
        entity_type="ai_recommendation",
        entity_id=str(rec_id),
        details=f"Administrator '{current_user.email}' approved AI recommendation: {rec.title}",
        ip_address="127.0.0.1",
        timestamp=datetime.utcnow()
    )
    db.add(audit)

    act = AIActivity(
        action_type="recommendation_approved",
        details=f"Recommendation '{rec.title}' executed successfully by administrator.",
        timestamp=datetime.utcnow()
    )
    db.add(act)

    await db.commit()
    return ok({"status": "success"}, f"Recommendation approved and applied: {rec.title}")

@router.patch("/{rec_id}/reject")
async def reject_recommendation(
    rec_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "Administrator":
        raise HTTPException(
            status_code=403,
            detail="RBAC Clearance Denied: Only Administrators can reject system optimizations."
        )

    res = await db.execute(select(AIRecommendation).filter(AIRecommendation.id == rec_id))
    rec = res.scalars().first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    if rec.status != "pending":
        raise HTTPException(status_code=400, detail="Recommendation has already been reviewed.")

    rec.status = "rejected"

    act = AIActivity(
        action_type="recommendation_rejected",
        details=f"Recommendation '{rec.title}' rejected by administrator: {current_user.email}",
        timestamp=datetime.utcnow()
    )
    db.add(act)

    await db.commit()
    return ok({"status": "success"}, "Recommendation rejected.")

