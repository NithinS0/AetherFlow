"""
GET   /api/v1/notifications             — list notifications (paginated)
PATCH /api/v1/notifications/{id}        — mark single notification read
PATCH /api/v1/notifications/read-all    — mark all notifications read
GET   /api/v1/notifications/preferences — get notification preferences
PUT   /api/v1/notifications/preferences — update notification preferences
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func
from typing import Dict, Any, Optional
from uuid import UUID
import uuid
from pydantic import BaseModel, ConfigDict
from datetime import datetime

from app.database.session import get_db
from app.models import Notification, Setting, User
from app.schemas.schemas import NotificationResponse, SettingResponse, SettingUpdate
from app.dependencies.auth import get_current_user
from app.api.common import PaginationParams, ok, paginated

router = APIRouter()


class NotificationPatch(BaseModel):
    is_read: bool = True


@router.get(
    "",
    summary="List notifications",
    description="Returns paginated notifications for the current user, newest first.",
)
async def list_notifications(
    pagination: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(Notification).filter(Notification.user_id == current_user.id)
    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar() or 0
    res = await db.execute(
        stmt.order_by(Notification.created_at.desc()).offset(pagination.offset).limit(pagination.limit)
    )
    items = res.scalars().all()
    data = [NotificationResponse.model_validate(n).model_dump(mode="json") for n in items]
    return paginated(data, total, pagination, "Notifications retrieved.")


@router.patch(
    "/read-all",
    summary="Mark all as read",
    description="Marks all notifications for the current user as read.",
)
async def mark_all_read(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await db.execute(
        update(Notification).where(Notification.user_id == current_user.id).values(is_read=True)
    )
    await db.commit()
    return ok(None, "All notifications marked as read.")


@router.patch(
    "/{notification_id}",
    summary="Mark notification read",
    description="Marks a single notification as read. Pass `{is_read: true}`.",
)
async def mark_read(
    notification_id: UUID,
    body: NotificationPatch,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    res = await db.execute(
        select(Notification).filter(
            Notification.id == notification_id, Notification.user_id == current_user.id
        )
    )
    notif = res.scalars().first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")

    notif.is_read = body.is_read
    await db.commit()
    return ok(NotificationResponse.model_validate(notif).model_dump(mode="json"), "Notification updated.")


@router.get(
    "/preferences",
    summary="Get notification preferences",
    description="Returns the current user's notification preference settings.",
)
async def get_preferences(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    res = await db.execute(select(Setting).filter(Setting.user_id == current_user.id))
    setting = res.scalars().first()
    if not setting:
        setting = Setting(
            id=uuid.uuid4(),
            user_id=current_user.id,
            settings_json={"email": True, "slack": False, "push": True, "timezone": "UTC", "language": "en"},
        )
        db.add(setting)
        await db.commit()
    return ok(SettingResponse.model_validate(setting).model_dump(mode="json"), "Preferences retrieved.")


@router.put(
    "/preferences",
    summary="Update notification preferences",
    description="Updates the current user's notification preferences. Merges with existing settings.",
)
async def update_preferences(
    pref_update: SettingUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    res = await db.execute(select(Setting).filter(Setting.user_id == current_user.id))
    setting = res.scalars().first()
    if not setting:
        setting = Setting(id=uuid.uuid4(), user_id=current_user.id, settings_json=pref_update.settings_json)
        db.add(setting)
    else:
        curr = dict(setting.settings_json)
        curr.update(pref_update.settings_json)
        setting.settings_json = curr

    await db.commit()
    return ok(SettingResponse.model_validate(setting).model_dump(mode="json"), "Preferences updated.")
