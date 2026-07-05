from fastapi import APIRouter, Depends, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID
import uuid
from datetime import datetime
from app.database.session import get_db
from app.models import UserPresence, User
from app.dependencies.auth import get_current_user
from pydantic import BaseModel

router = APIRouter()


class PresenceOut(BaseModel):
    id: UUID
    user_id: UUID
    status: str
    activity: Optional[str] = None
    last_seen_at: datetime

    class Config:
        from_attributes = True


@router.get("", response_model=List[PresenceOut])
async def list_presence(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(UserPresence).order_by(UserPresence.last_seen_at.desc()))
    return res.scalars().all()


@router.post("/update", response_model=PresenceOut)
async def update_presence(
    status: str = Body("online"),
    activity: Optional[str] = Body(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(select(UserPresence).filter(UserPresence.user_id == current_user.id))
    presence = res.scalars().first()

    if presence:
        presence.status = status
        presence.activity = activity
        presence.last_seen_at = datetime.utcnow()
    else:
        presence = UserPresence(
            id=uuid.uuid4(),
            user_id=current_user.id,
            status=status,
            activity=activity,
            last_seen_at=datetime.utcnow()
        )
        db.add(presence)

    await db.commit()
    return presence
