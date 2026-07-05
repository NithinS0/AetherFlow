from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID
import uuid
from app.database.session import get_db
from app.models import Organization, User, AuditLog
from app.schemas.schemas import OrganizationCreate, OrganizationUpdate, OrganizationResponse, OrganizationInvite
from app.dependencies.auth import get_current_user, require_permission
from app.core.security import get_password_hash

router = APIRouter()

@router.post("", response_model=OrganizationResponse)
async def create_organization(
    org_in: OrganizationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check duplicate slug
    slug_res = await db.execute(select(Organization).filter(Organization.slug == org_in.slug))
    if slug_res.scalars().first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Slug already exists")

    org = Organization(
        id=uuid.uuid4(),
        name=org_in.name,
        slug=org_in.slug,
        logo_url=org_in.logo_url
    )
    db.add(org)

    # Write Audit Log
    audit = AuditLog(
        id=uuid.uuid4(),
        user_id=current_user.id,
        action="organization_created",
        entity_type="organization",
        entity_id=str(org.id),
        details=f"Organization '{org.name}' created by {current_user.email}."
    )
    db.add(audit)
    await db.commit()
    return org

@router.get("", response_model=List[OrganizationResponse])
async def list_organizations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.organization_id is None:
        return []
    result = await db.execute(
        select(Organization)
        .filter(Organization.id == current_user.organization_id, Organization.deleted_at == None)
    )
    return result.scalars().all()

@router.get("/{org_id}", response_model=OrganizationResponse)
async def get_organization(org_id: UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    res = await db.execute(select(Organization).filter(Organization.id == org_id, Organization.deleted_at == None))
    org = res.scalars().first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org

@router.put("/{org_id}", response_model=OrganizationResponse)
async def update_organization(
    org_id: UUID,
    org_update: OrganizationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("manage_org"))
):
    res = await db.execute(select(Organization).filter(Organization.id == org_id, Organization.deleted_at == None))
    org = res.scalars().first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    if org_update.name is not None:
        org.name = org_update.name
    if org_update.logo_url is not None:
        org.logo_url = org_update.logo_url

    # Audit Log
    audit = AuditLog(
        id=uuid.uuid4(),
        user_id=current_user.id,
        action="organization_updated",
        entity_type="organization",
        entity_id=str(org.id),
        details=f"Organization metadata updated."
    )
    db.add(audit)
    await db.commit()
    return org

@router.delete("/{org_id}")
async def delete_organization(
    org_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("manage_org"))
):
    res = await db.execute(select(Organization).filter(Organization.id == org_id, Organization.deleted_at == None))
    org = res.scalars().first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    import datetime
    org.deleted_at = datetime.datetime.utcnow()

    # Audit Log
    audit = AuditLog(
        id=uuid.uuid4(),
        user_id=current_user.id,
        action="organization_deleted",
        entity_type="organization",
        entity_id=str(org.id),
        details=f"Organization soft deleted."
    )
    db.add(audit)
    await db.commit()
    return {"message": "Organization soft-deleted successfully"}

@router.post("/{org_id}/invite")
async def invite_member(
    org_id: UUID,
    invite: OrganizationInvite,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("manage_members"))
):
    # Validate org exists
    org_res = await db.execute(select(Organization).filter(Organization.id == org_id))
    if not org_res.scalars().first():
        raise HTTPException(status_code=404, detail="Organization not found")

    # Add the invited user to the organization membership scope
    res = await db.execute(select(User).filter(User.email == invite.email))
    invited_user = res.scalars().first()
    if not invited_user:
        invited_user = User(
            id=uuid.uuid4(),
            email=invite.email,
            hashed_password=get_password_hash(uuid.uuid4().hex),
            full_name=invite.email.split("@")[0],
            organization_id=org_id
        )
        db.add(invited_user)
    else:
        if invited_user.organization_id and invited_user.organization_id != org_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already belongs to another organization.")
        invited_user.organization_id = org_id

    # Audit log invite dispatch
    audit = AuditLog(
        id=uuid.uuid4(),
        user_id=current_user.id,
        action="member_invited",
        entity_type="organization",
        entity_id=str(org_id),
        details=f"User {invite.email} invited with role '{invite.role_name}'."
    )
    db.add(audit)
    await db.commit()
    return {"message": f"Successfully invited {invite.email}"}

@router.get("/{org_id}/members")
async def list_members(org_id: UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.organization_id != org_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view members of this organization.")
    res = await db.execute(
        select(User)
        .filter(User.organization_id == org_id)
        .order_by(User.email.asc())
    )
    users = res.scalars().all()
    members = [
        {
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
        }
        for u in users
    ]
    return members

@router.delete("/{org_id}/members/{user_id}")
async def remove_member(
    org_id: UUID,
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("manage_members"))
):
    # Write Audit Log
    audit = AuditLog(
        id=uuid.uuid4(),
        user_id=current_user.id,
        action="member_removed",
        entity_type="organization",
        entity_id=str(org_id),
        details=f"Member {user_id} removed from organization workspace."
    )
    db.add(audit)
    await db.commit()
    return {"message": "Member removed successfully"}

@router.get("/{org_id}/activity")
async def get_org_activity(org_id: UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    res = await db.execute(select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(20))
    return res.scalars().all()
