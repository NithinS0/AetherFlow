from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from typing import List, Optional
from uuid import UUID
import uuid
from datetime import datetime
from app.database.session import get_db
from app.models import Incident, IncidentComment, User, Job, Queue, Worker
from app.dependencies.auth import get_current_user
from app.services.ai_service import AIService
from app.api.common import PaginationParams, FilterParams, ok, created, paginated
from pydantic import BaseModel, ConfigDict

router = APIRouter()


# ─── Pydantic Schemas ─────────────────────────────────────────────────────────

class CommentOut(BaseModel):
    id: UUID
    incident_id: UUID
    user_id: Optional[UUID] = None
    comment_type: str
    content: str
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


class IncidentOut(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = None
    severity: str
    status: str
    trigger: str
    assigned_to_id: Optional[UUID] = None
    queue_id: Optional[UUID] = None
    worker_id: Optional[UUID] = None
    job_id: Optional[UUID] = None
    ai_analysis: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    comments: List[CommentOut] = []

    model_config = ConfigDict(from_attributes=True)


class IncidentCreate(BaseModel):
    title: str
    description: Optional[str] = None
    severity: str = "medium"
    trigger: str = "manual"
    queue_id: Optional[UUID] = None
    worker_id: Optional[UUID] = None
    job_id: Optional[UUID] = None


class AssignBody(BaseModel):
    assigned_to_id: UUID


class EscalateBody(BaseModel):
    reason: str


class ResolveBody(BaseModel):
    resolution_note: Optional[str] = None


class CommentBody(BaseModel):
    content: str


# ─── CRUD ─────────────────────────────────────────────────────────────────────

@router.get(
    "",
    summary="List incidents",
    description="Returns paginated incidents. Filter by ?status= and/or ?severity= via query params.",
)
async def list_incidents(
    status_filter: Optional[str] = None,
    severity: Optional[str] = None,
    pagination: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from sqlalchemy.orm import selectinload
    stmt = select(Incident).options(selectinload(Incident.comments))
    if status_filter:
        stmt = stmt.filter(Incident.status == status_filter)
    if severity:
        stmt = stmt.filter(Incident.severity == severity)

    total = (await db.execute(select(func.count()).select_from(
        select(Incident).filter(Incident.status == status_filter).subquery() if status_filter
        else select(Incident).subquery()
    ))).scalar() or 0
    res = await db.execute(stmt.order_by(desc(Incident.created_at)).offset(pagination.offset).limit(pagination.limit))
    items = res.scalars().all()
    data = [IncidentOut.model_validate(i).model_dump(mode="json") for i in items]
    return paginated(data, total, pagination, "Incidents retrieved.")


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    summary="Create incident",
    description="Creates a new incident and optionally links it to a queue, worker, or job.",
)
async def create_incident(
    body: IncidentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    incident = Incident(
        id=uuid.uuid4(),
        title=body.title,
        description=body.description,
        severity=body.severity,
        trigger=body.trigger,
        queue_id=body.queue_id,
        worker_id=body.worker_id,
        job_id=body.job_id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(incident)
    await db.commit()
    result = await _get_incident_with_comments(db, incident.id)
    return created(IncidentOut.model_validate(result).model_dump(mode="json"), "Incident created.")


@router.get(
    "/{incident_id}",
    summary="Get incident",
    description="Returns a single incident with its full comment/timeline history.",
)
async def get_incident(
    incident_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await _get_incident_with_comments(db, incident_id)
    return ok(IncidentOut.model_validate(result).model_dump(mode="json"), "Incident retrieved.")


# ─── Lifecycle Actions ────────────────────────────────────────────────────────

@router.patch(
    "/{incident_id}/acknowledge",
    summary="Acknowledge incident",
    description="Transitions incident to 'investigating' status.",
)
async def acknowledge_incident(
    incident_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    incident = await _fetch(db, incident_id)
    incident.status = "investigating"
    incident.updated_at = datetime.utcnow()
    await _add_timeline(db, incident_id, current_user.id, "status_change", "🔍 Status changed to **Investigating**")
    await db.commit()
    result = await _get_incident_with_comments(db, incident_id)
    return ok(IncidentOut.model_validate(result).model_dump(mode="json"), "Incident acknowledged.")


@router.patch(
    "/{incident_id}/assign",
    summary="Assign incident",
    description="Assigns an incident to a user.",
)
async def assign_incident(
    incident_id: UUID,
    body: AssignBody,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    incident = await _fetch(db, incident_id)
    incident.assigned_to_id = body.assigned_to_id
    incident.status = "in_progress"
    incident.updated_at = datetime.utcnow()
    await _add_timeline(db, incident_id, current_user.id, "assignment", f"👤 Assigned to `{body.assigned_to_id}`")
    await db.commit()
    result = await _get_incident_with_comments(db, incident_id)
    return ok(IncidentOut.model_validate(result).model_dump(mode="json"), "Incident assigned.")


@router.patch(
    "/{incident_id}/escalate",
    summary="Escalate incident",
    description="Escalates severity to the next level on the ladder.",
)
async def escalate_incident(
    incident_id: UUID,
    body: EscalateBody,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    incident = await _fetch(db, incident_id)
    severity_ladder = ["low", "medium", "high", "critical"]
    idx = severity_ladder.index(incident.severity) if incident.severity in severity_ladder else 1
    incident.severity = severity_ladder[min(idx + 1, 3)]
    incident.updated_at = datetime.utcnow()
    await _add_timeline(db, incident_id, current_user.id, "escalation", f"🔺 Escalated to **{incident.severity}** — {body.reason}")
    await db.commit()
    result = await _get_incident_with_comments(db, incident_id)
    return ok(IncidentOut.model_validate(result).model_dump(mode="json"), "Incident escalated.")


@router.patch(
    "/{incident_id}/resolve",
    summary="Resolve incident",
    description="Marks incident as resolved.",
)
async def resolve_incident(
    incident_id: UUID,
    body: ResolveBody,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    incident = await _fetch(db, incident_id)
    incident.status = "resolved"
    incident.resolved_at = datetime.utcnow()
    incident.updated_at = datetime.utcnow()
    note = body.resolution_note or "Incident resolved."
    await _add_timeline(db, incident_id, current_user.id, "status_change", f"✅ **Resolved** — {note}")
    await db.commit()
    result = await _get_incident_with_comments(db, incident_id)
    return ok(IncidentOut.model_validate(result).model_dump(mode="json"), "Incident resolved.")


@router.patch(
    "/{incident_id}/close",
    summary="Close incident",
    description="Closes a resolved incident.",
)
async def close_incident(
    incident_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    incident = await _fetch(db, incident_id)
    incident.status = "closed"
    incident.updated_at = datetime.utcnow()
    await _add_timeline(db, incident_id, current_user.id, "status_change", "🔒 **Closed**")
    await db.commit()
    result = await _get_incident_with_comments(db, incident_id)
    return ok(IncidentOut.model_validate(result).model_dump(mode="json"), "Incident closed.")


# ─── Comments ─────────────────────────────────────────────────────────────────

@router.post(
    "/{incident_id}/comments",
    status_code=status.HTTP_201_CREATED,
    summary="Add comment",
    description="Adds a comment or timeline entry to an incident.",
)
async def post_comment(
    incident_id: UUID,
    body: CommentBody,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _fetch(db, incident_id)
    comment = await _add_timeline(db, incident_id, current_user.id, "comment", body.content)
    await db.commit()
    return created(CommentOut.model_validate(comment).model_dump(mode="json"), "Comment added.")


# ─── AI Analysis ──────────────────────────────────────────────────────────────

@router.post(
    "/{incident_id}/analysis",
    summary="Trigger AI analysis",
    description="Runs AI failure analysis on the incident and stores the result.",
)
async def trigger_ai_analysis(
    incident_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    incident = await _fetch(db, incident_id)
    context = f"Incident: {incident.title}\nSeverity: {incident.severity}\nTrigger: {incident.trigger}"
    if incident.description:
        context += f"\nDescription: {incident.description}"
    analysis = await AIService.analyze_failure(
        job_name=incident.title,
        error_message=incident.description or "No description",
        logs=context,
    )
    incident.ai_analysis = analysis
    incident.updated_at = datetime.utcnow()
    await _add_timeline(db, incident_id, current_user.id, "status_change", "🤖 AI analysis completed")
    await db.commit()
    return ok({"analysis": analysis}, "AI analysis complete.")


# ─── Helpers ──────────────────────────────────────────────────────────────────

async def _fetch(db: AsyncSession, incident_id: UUID) -> Incident:
    res = await db.execute(select(Incident).filter(Incident.id == incident_id))
    incident = res.scalars().first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident


async def _get_incident_with_comments(db: AsyncSession, incident_id: UUID) -> Incident:
    from sqlalchemy.orm import selectinload
    res = await db.execute(
        select(Incident).options(selectinload(Incident.comments)).filter(Incident.id == incident_id)
    )
    incident = res.scalars().first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident


async def _add_timeline(db: AsyncSession, incident_id: UUID, user_id: UUID, comment_type: str, content: str) -> IncidentComment:
    comment = IncidentComment(
        id=uuid.uuid4(),
        incident_id=incident_id,
        user_id=user_id,
        comment_type=comment_type,
        content=content,
        timestamp=datetime.utcnow()
    )
    db.add(comment)
    return comment
