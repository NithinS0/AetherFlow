"""
GET    /api/v1/api-keys        — list API keys for the organisation
POST   /api/v1/api-keys        — generate a new API key
DELETE /api/v1/api-keys/{id}   — revoke (delete) an API key
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import secrets
import hashlib
from uuid import UUID
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.models import User, ApiKey
from app.api.common import PaginationParams, ok, created, no_content, paginated

router = APIRouter()


class ApiKeyOut(BaseModel):
    id: UUID
    name: str
    key_prefix: str
    permissions: str
    last_used_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    is_revoked: bool
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ApiKeyCreate(BaseModel):
    name: str = "New API Key"
    permissions: str = "read"


@router.get(
    "",
    summary="List API keys",
    description="Returns all non-revoked API keys for the current user's organisation.",
)
async def list_api_keys(
    pagination: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(ApiKey).where(ApiKey.organization_id == current_user.organization_id)
    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar() or 0
    res = await db.execute(stmt.offset(pagination.offset).limit(pagination.limit))
    keys = res.scalars().all()
    data = [ApiKeyOut.model_validate(k).model_dump(mode="json") for k in keys]
    return paginated(data, total, pagination, "API keys retrieved.")


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    summary="Generate API key",
    description="Generates a new API key. The raw key is returned **only once** — store it securely.",
)
async def create_api_key(
    body: ApiKeyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    raw_key = "af_" + secrets.token_urlsafe(32)
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()

    new_key = ApiKey(
        name=body.name,
        key_prefix=raw_key[:7],
        key_hash=key_hash,
        permissions=body.permissions,
        user_id=current_user.id,
        organization_id=current_user.organization_id,
    )
    db.add(new_key)
    await db.commit()
    await db.refresh(new_key)

    return created(
        {
            "id": str(new_key.id),
            "name": new_key.name,
            "raw_key": raw_key,  # Returned ONLY once
            "key_prefix": new_key.key_prefix,
            "permissions": new_key.permissions,
        },
        "API key generated. Store the raw key securely — it will not be shown again.",
    )


@router.delete(
    "/{key_id}",
    status_code=status.HTTP_200_OK,
    summary="Revoke API key",
    description="Permanently revokes an API key. Any requests using this key will be rejected immediately.",
)
async def revoke_api_key(
    key_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(ApiKey).where(ApiKey.id == key_id, ApiKey.organization_id == current_user.organization_id)
    )
    key = result.scalar_one_or_none()
    if not key:
        raise HTTPException(status_code=404, detail="API key not found")
    if key.is_revoked:
        raise HTTPException(status_code=409, detail="API key is already revoked.")

    key.is_revoked = True
    await db.commit()
    return no_content()
