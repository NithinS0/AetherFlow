from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
from app.database.session import get_db
from app.models import User, AuditLog
from app.schemas.schemas import UserCreate, UserResponse, Token, ForgotPasswordRequest
from app.core.security import get_password_hash, verify_password, create_access_token
from app.dependencies.auth import get_current_user
from app.services.supabase_client import supabase_service

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter(User.email == user_in.email))
    user = result.scalars().first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    
    if not supabase_service.is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication backend is not configured. SUPABASE_URL and associated keys are required."
        )

    try:
        supa_user = await supabase_service.auth_register(user_in.email, user_in.password)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))

    user_id = supa_user["id"]
    hashed_password = get_password_hash(user_in.password)
    db_user = User(
        id=user_id,
        email=user_in.email,
        hashed_password=hashed_password,
        full_name=user_in.full_name,
        avatar_url=user_in.avatar_url
    )
    db.add(db_user)
    
    # Write Audit Log
    audit = AuditLog(
        id=uuid.uuid4(),
        user_id=db_user.id,
        action="user_registered",
        entity_type="user",
        entity_id=str(db_user.id),
        details=f"User {db_user.email} registered on platform."
    )
    db.add(audit)
    await db.commit()
    return db_user

import logging
logger = logging.getLogger("aetherflow.auth")

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    if not supabase_service.is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication backend is not configured. SUPABASE_URL and associated keys are required."
        )

    try:
        tokens = await supabase_service.auth_login(form_data.username, form_data.password)
    except Exception as e:
        logger.warning(f"Supabase login failed for {form_data.username} ({e})")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")

    # Verify user exists locally as well
    result = await db.execute(select(User).filter(User.email == form_data.username))
    user = result.scalars().first()
    if not user:
        user = User(
            id=uuid.uuid4(),
            email=form_data.username,
            hashed_password=get_password_hash(form_data.password),
            full_name=form_data.username.split("@")[0]
        )
        db.add(user)
        await db.commit()

    return tokens

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Write Audit Log
    audit = AuditLog(
        id=uuid.uuid4(),
        user_id=current_user.id,
        action="user_logout",
        entity_type="user",
        entity_id=str(current_user.id),
        details=f"User {current_user.email} logged out of session."
    )
    db.add(audit)
    await db.commit()
    return {"message": "Successfully logged out"}

@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    # In Phase 1 we return mock success
    return {"message": f"Password reset email dispatched to {req.email}"}

@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_token: str = Body(..., embed=True),
    current_user: User = Depends(get_current_user)
):
    # Generate new access token
    new_access_token = create_access_token(subject=current_user.email, role=getattr(current_user, "role", "Viewer"))
    return {
        "access_token": new_access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
