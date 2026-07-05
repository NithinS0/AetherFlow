from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
from app.database.session import get_db
from app.models import Role, Permission, User
from app.schemas.schemas import RoleResponse, PermissionResponse
from app.dependencies.auth import get_current_user

router = APIRouter()

@router.get("/roles", response_model=List[RoleResponse])
async def list_roles(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    res = await db.execute(select(Role).options(selectinload(Role.permissions)).order_by(Role.name.asc()))
    return res.scalars().all()

@router.get("/permissions", response_model=List[PermissionResponse])
async def list_permissions(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    res = await db.execute(select(Permission).order_by(Permission.code.asc()))
    return res.scalars().all()
