from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from uuid import UUID
import uuid
from datetime import datetime
from app.database.session import get_db
from app.models import Channel, Message, MessageReaction, User
from app.dependencies.auth import get_current_user
from app.api.common import PaginationParams, FilterParams, ok, created, paginated, no_content
from pydantic import BaseModel, ConfigDict


router = APIRouter()


# ─── Pydantic Schemas ─────────────────────────────────────────────────────────

class ChannelOut(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    context_type: str
    context_id: Optional[str] = None
    is_private: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MessageOut(BaseModel):
    id: UUID
    channel_id: UUID
    user_id: Optional[UUID] = None
    content: str
    is_edited: bool
    is_deleted: bool
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)



# ─── Channel Endpoints ────────────────────────────────────────────────────────

@router.get(
    "",
    summary="List channels",
    description="Returns paginated channels.",
)
async def list_channels(
    context_type: Optional[str] = None,
    context_id: Optional[str] = None,
    pagination: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(Channel)
    if context_type:
        stmt = stmt.filter(Channel.context_type == context_type)
    if context_id:
        stmt = stmt.filter(Channel.context_id == context_id)

    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar() or 0
    res = await db.execute(stmt.order_by(Channel.created_at.asc()).offset(pagination.offset).limit(pagination.limit))
    channels = res.scalars().all()
    data = [ChannelOut.model_validate(c).model_dump(mode="json") for c in channels]
    return paginated(data, total, pagination, "Channels retrieved.")


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    summary="Create channel",
    description="Creates a new channel.",
)
async def create_channel(
    name: str = Body(...),
    description: Optional[str] = Body(None),
    context_type: str = Body("org"),
    context_id: Optional[str] = Body(None),
    is_private: bool = Body(False),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = await db.execute(
        select(Channel).filter(
            Channel.context_type == context_type,
            Channel.context_id == context_id,
            Channel.name == name
        )
    )
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="Channel with this name already exists in this context.")

    ch = Channel(
        id=uuid.uuid4(),
        name=name,
        description=description,
        context_type=context_type,
        context_id=context_id,
        is_private=is_private,
        created_by_id=current_user.id,
        created_at=datetime.utcnow()
    )
    db.add(ch)
    await db.commit()
    return created(ChannelOut.model_validate(ch).model_dump(mode="json"), "Channel created.")


@router.get("/defaults", summary="Ensure default channels")
async def ensure_default_channels(db: AsyncSession = Depends(get_db)):
    """Seed default channels for org, general, ops, and incidents."""
    defaults = [
        {"name": "general", "context_type": "org", "description": "Organisation-wide announcements"},
        {"name": "ops-alerts", "context_type": "org", "description": "Operational alerts and SRE events"},
        {"name": "incidents", "context_type": "org", "description": "Active incident coordination"},
    ]
    created_names = []
    for d in defaults:
        existing = await db.execute(
            select(Channel).filter(Channel.name == d["name"], Channel.context_type == d["context_type"])
        )
        if not existing.scalars().first():
            ch = Channel(id=uuid.uuid4(), created_at=datetime.utcnow(), **d)
            db.add(ch)
            created_names.append(d["name"])
    await db.commit()
    return ok({"seeded": created_names}, "Default channels seeded.")


# ─── Message Endpoints ────────────────────────────────────────────────────────

@router.get(
    "/{channel_id}/messages",
    summary="List messages",
    description="Returns paginated messages for a channel.",
)
async def get_messages(
    channel_id: UUID,
    pagination: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(Message).filter(Message.channel_id == channel_id, Message.is_deleted == False)
    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar() or 0
    res = await db.execute(stmt.order_by(Message.timestamp.asc()).offset(pagination.offset).limit(pagination.limit))
    msgs = res.scalars().all()
    data = [MessageOut.model_validate(m).model_dump(mode="json") for m in msgs]
    return paginated(data, total, pagination, "Messages retrieved.")


@router.post(
    "/{channel_id}/messages",
    status_code=status.HTTP_201_CREATED,
    summary="Send message",
    description="Send a message to a channel.",
)
async def send_message(
    channel_id: UUID,
    content: str = Body(..., embed=True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ch = await db.execute(select(Channel).filter(Channel.id == channel_id))
    if not ch.scalars().first():
        raise HTTPException(status_code=404, detail="Channel not found")

    msg = Message(
        id=uuid.uuid4(),
        channel_id=channel_id,
        user_id=current_user.id,
        content=content,
        timestamp=datetime.utcnow()
    )
    db.add(msg)
    await db.commit()
    return created(MessageOut.model_validate(msg).model_dump(mode="json"), "Message sent.")


@router.delete(
    "/{channel_id}/messages/{message_id}",
    summary="Delete message",
    description="Soft delete a message.",
)
async def delete_message(
    channel_id: UUID,
    message_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    res = await db.execute(select(Message).filter(Message.id == message_id, Message.channel_id == channel_id))
    msg = res.scalars().first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    if msg.user_id != current_user.id and current_user.role != "Administrator":
        raise HTTPException(status_code=403, detail="Cannot delete another user's message")
    msg.is_deleted = True
    await db.commit()
    return no_content()


@router.post(
    "/{channel_id}/messages/{message_id}/react",
    summary="React to message",
    description="Toggle reaction on a message.",
)
async def react_to_message(
    channel_id: UUID,
    message_id: UUID,
    emoji: str = Body(..., embed=True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = await db.execute(
        select(MessageReaction).filter(
            MessageReaction.message_id == message_id,
            MessageReaction.user_id == current_user.id,
            MessageReaction.emoji == emoji
        )
    )
    existing_reaction = existing.scalars().first()
    if existing_reaction:
        await db.delete(existing_reaction)
        await db.commit()
        return ok({"emoji": emoji, "action": "removed"}, "Reaction removed.")

    reaction = MessageReaction(
        id=uuid.uuid4(),
        message_id=message_id,
        user_id=current_user.id,
        emoji=emoji,
        created_at=datetime.utcnow()
    )
    db.add(reaction)
    await db.commit()
    return ok({"emoji": emoji, "action": "added"}, "Reaction added.")
