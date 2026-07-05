from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from uuid import UUID
import uuid
from datetime import datetime
from app.database.session import get_db
from app.models import Approval, AuditLog, User, Queue, Worker
from app.dependencies.auth import get_current_user
from app.api.common import PaginationParams, FilterParams, ok, created, paginated
from pydantic import BaseModel, ConfigDict


router = APIRouter()


class ApprovalOut(BaseModel):
    id: UUID
    approval_type: str
    title: str
    description: str
    status: str
    severity: str
    requested_by_id: Optional[UUID] = None
    reviewed_by_id: Optional[UUID] = None
    review_note: Optional[str] = None
    created_at: datetime
    reviewed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ApprovalCreate(BaseModel):
    approval_type: str
    title: str
    description: str
    severity: str = "medium"
    payload: Optional[dict] = None


class ReviewBody(BaseModel):
    review_note: Optional[str] = None


@router.get(
    "",
    summary="List approvals",
    description="Returns paginated approval requests.",
)
async def list_approvals(
    status_filter: Optional[str] = None,
    pagination: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(Approval)
    if status_filter:
        stmt = stmt.filter(Approval.status == status_filter)

    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar() or 0
    res = await db.execute(stmt.order_by(Approval.created_at.desc()).offset(pagination.offset).limit(pagination.limit))
    items = res.scalars().all()
    data = [ApprovalOut.model_validate(a).model_dump(mode="json") for a in items]
    return paginated(data, total, pagination, "Approvals retrieved.")


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    summary="Create approval",
    description="Creates a new approval request.",
)
async def create_approval(
    body: ApprovalCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    approval = Approval(
        id=uuid.uuid4(),
        approval_type=body.approval_type,
        title=body.title,
        description=body.description,
        severity=body.severity,
        requested_by_id=current_user.id,
        payload=body.payload,
        created_at=datetime.utcnow(),
    )
    db.add(approval)
    await db.commit()
    return created(ApprovalOut.model_validate(approval).model_dump(mode="json"), "Approval requested.")


@router.patch(
    "/{approval_id}/approve",
    summary="Approve request",
    description="Approves a pending request.",
)
async def approve_request(
    approval_id: UUID,
    body: ReviewBody,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "Administrator":
        raise HTTPException(status_code=403, detail="RBAC Denied: Only Administrators can approve requests.")

    res = await db.execute(select(Approval).filter(Approval.id == approval_id))
    approval = res.scalars().first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval request not found")
    if approval.status != "pending":
        raise HTTPException(status_code=400, detail="Approval has already been reviewed")

    approval.status = "approved"
    approval.reviewed_by_id = current_user.id
    approval.review_note = body.review_note
    approval.reviewed_at = datetime.utcnow()

    if approval.approval_type == "queue_change" and approval.payload:
        queue_id = approval.payload.get("queue_id")
        field = approval.payload.get("field")
        value = approval.payload.get("value")
        if queue_id and field:
            q_res = await db.execute(select(Queue).filter(Queue.id == uuid.UUID(queue_id)))
            queue = q_res.scalars().first()
            if queue and hasattr(queue, field):
                setattr(queue, field, value)

    audit = AuditLog(
        id=uuid.uuid4(),
        user_id=current_user.id,
        action="approve_request",
        entity_type="approval",
        entity_id=str(approval_id),
        details=f"Approved: {approval.title}",
        ip_address="127.0.0.1",
        timestamp=datetime.utcnow(),
    )
    db.add(audit)
    await db.commit()
    return ok(ApprovalOut.model_validate(approval).model_dump(mode="json"), "Request approved.")


@router.patch(
    "/{approval_id}/reject",
    summary="Reject request",
    description="Rejects a pending request.",
)
async def reject_request(
    approval_id: UUID,
    body: ReviewBody,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "Administrator":
        raise HTTPException(status_code=403, detail="RBAC Denied: Only Administrators can reject requests.")

    res = await db.execute(select(Approval).filter(Approval.id == approval_id))
    approval = res.scalars().first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval request not found")
    if approval.status != "pending":
        raise HTTPException(status_code=400, detail="Approval has already been reviewed")

    approval.status = "rejected"
    approval.reviewed_by_id = current_user.id
    approval.review_note = body.review_note
    approval.reviewed_at = datetime.utcnow()

    audit = AuditLog(
        id=uuid.uuid4(),
        user_id=current_user.id,
        action="reject_request",
        entity_type="approval",
        entity_id=str(approval_id),
        details=f"Rejected: {approval.title}",
        ip_address="127.0.0.1",
        timestamp=datetime.utcnow(),
    )
    db.add(audit)
    await db.commit()
    return ok(ApprovalOut.model_validate(approval).model_dump(mode="json"), "Request rejected.")

