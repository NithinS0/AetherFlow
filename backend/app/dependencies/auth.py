from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from typing import Optional
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from app.core.config import settings
from app.database.session import get_db
from app.models import User, ProjectMember, Role, Permission, role_permissions
from app.schemas.schemas import TokenPayload

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

ROLE_PERMISSIONS = {
    "Administrator": {
        "manage_org",
        "manage_members",
        "create_project",
        "delete_project",
        "view_audit_logs",
        "manage_roles",
        "manage_api_keys",
        "manage_settings",
    },
    "Operator": {
        "create_project",
        "view_audit_logs",
        "manage_settings",
        "manage_api_keys",
    },
    "Viewer": set(),
}

async def get_current_user(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # 1. Decode JWT Token using the configured JWT secret.
    if settings.SUPABASE_URL and not settings.SUPABASE_JWT_SECRET:
        # Fallback for local development: Decode without signature verification
        try:
            payload = jwt.decode(token, "", options={"verify_signature": False, "verify_aud": False})
            email: str = payload.get("email") or payload.get("sub")
            if email is None:
                raise credentials_exception
            token_payload = TokenPayload(sub=email, exp=payload.get("exp"))
        except JWTError:
            raise credentials_exception
    else:
        secret = settings.SUPABASE_JWT_SECRET if settings.SUPABASE_JWT_SECRET else settings.SECRET_KEY
        try:
            payload = jwt.decode(token, secret, algorithms=[settings.ALGORITHM], options={"verify_aud": False})
            email: str = payload.get("email") or payload.get("sub")
            if email is None:
                raise credentials_exception
            token_payload = TokenPayload(sub=email, exp=payload.get("exp"))
        except JWTError:
            raise credentials_exception

    # 2. Fetch User from DB
    result = await db.execute(select(User).filter(User.email == token_payload.sub))
    user = result.scalars().first()
    if user is None:
        raise credentials_exception

    # Check if this is the first registered user in the system
    first_res = await db.execute(select(User).order_by(User.created_at.asc()).limit(1))
    first_user = first_res.scalars().first()
    if first_user and user.id == first_user.id:
        user._dynamic_role = "Administrator"

    return user

def require_permission(permission_code: str):
    """
    Enforces that the user has the required permission globally, or in the active project.
    """
    async def permission_dependency(
        project_id: Optional[UUID] = None,
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
    ) -> User:
        # 1. Global simplified-role permissions
        if permission_code in ROLE_PERMISSIONS.get(current_user.role, set()):
            return current_user

        # 2. If project context is provided, check project-level permissions
        if project_id:
            # Query if user has role on this project which maps to the permission code
            stmt = (
                select(1)
                .select_from(ProjectMember)
                .join(Role, ProjectMember.role_id == Role.id)
                .join(role_permissions, Role.id == role_permissions.c.role_id)
                .join(Permission, role_permissions.c.permission_id == Permission.id)
                .filter(
                    ProjectMember.project_id == project_id,
                    ProjectMember.user_id == current_user.id,
                    Permission.code == permission_code
                )
            )
            res = await db.execute(stmt)
            if res.scalar():
                return current_user

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"You do not have the required permission: {permission_code}"
        )
    return permission_dependency
