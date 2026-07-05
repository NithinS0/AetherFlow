from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from uuid import UUID
import uuid
from app.database.session import get_db
from app.models import RetryPolicy, User
from app.dependencies.auth import get_current_user
from app.api.common import PaginationParams, FilterParams, ok, created, paginated, no_content
from pydantic import BaseModel, ConfigDict



class RetryPolicyBase(BaseModel):
    name: str
    type: str  # fixed, linear, exponential
    max_retries: int = 3
    delay_seconds: int = 5
    backoff_multiplier: float = 2.0

class RetryPolicyCreate(RetryPolicyBase):
    pass

class RetryPolicyUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    max_retries: Optional[int] = None
    delay_seconds: Optional[int] = None
    backoff_multiplier: Optional[float] = None

class RetryPolicyResponse(RetryPolicyBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)


router = APIRouter()

@router.post("/retry-policies", status_code=status.HTTP_201_CREATED)
async def create_retry_policy(
    policy_in: RetryPolicyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check duplicate
    res = await db.execute(select(RetryPolicy).filter(RetryPolicy.name == policy_in.name))
    if res.scalars().first():
        raise HTTPException(status_code=400, detail="Policy name already exists")
        
    policy = RetryPolicy(
        id=uuid.uuid4(),
        name=policy_in.name,
        type=policy_in.type,
        max_retries=policy_in.max_retries,
        delay_seconds=policy_in.delay_seconds,
        backoff_multiplier=policy_in.backoff_multiplier
    )
    db.add(policy)
    await db.commit()
    return created(RetryPolicyResponse.model_validate(policy).model_dump(mode="json"), "Retry policy created.")

@router.get("/retry-policies")
async def list_retry_policies(
    pagination: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(RetryPolicy)
    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar() or 0
    res = await db.execute(stmt.order_by(RetryPolicy.name.asc()).offset(pagination.offset).limit(pagination.limit))
    policies = res.scalars().all()
    data = [RetryPolicyResponse.model_validate(p).model_dump(mode="json") for p in policies]
    return paginated(data, total, pagination, "Retry policies retrieved.")

@router.get("/retry-policies/{policy_id}")

async def get_retry_policy(
    policy_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(select(RetryPolicy).filter(RetryPolicy.id == policy_id))
    policy = res.scalars().first()
    if not policy:
        raise HTTPException(status_code=404, detail="Retry policy not found")
    return ok(RetryPolicyResponse.model_validate(policy).model_dump(mode="json"), "Retry policy retrieved.")

@router.delete("/retry-policies/{policy_id}")
async def delete_retry_policy(
    policy_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(select(RetryPolicy).filter(RetryPolicy.id == policy_id))
    policy = res.scalars().first()
    if not policy:
        raise HTTPException(status_code=404, detail="Retry policy not found")
    await db.delete(policy)
    await db.commit()
    return no_content()


@router.put("/retry-policies/{policy_id}")
@router.patch("/retry-policies/{policy_id}")
async def update_retry_policy(
    policy_id: UUID,
    body: RetryPolicyUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an existing retry policy (PUT = full replace, PATCH = partial)."""
    res = await db.execute(select(RetryPolicy).filter(RetryPolicy.id == policy_id))
    policy = res.scalars().first()
    if not policy:
        raise HTTPException(status_code=404, detail="Retry policy not found")

    if body.name is not None:
        policy.name = body.name
    if body.type is not None:
        policy.type = body.type
    if body.max_retries is not None:
        policy.max_retries = body.max_retries
    if body.delay_seconds is not None:
        policy.delay_seconds = body.delay_seconds
    if body.backoff_multiplier is not None:
        policy.backoff_multiplier = body.backoff_multiplier

    await db.commit()
    return ok(RetryPolicyResponse.model_validate(policy).model_dump(mode="json"), "Retry policy updated.")
