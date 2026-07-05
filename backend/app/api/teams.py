from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID
import uuid
from app.database.session import get_db
from app.models import Team, User, AuditLog, team_members
from app.schemas.schemas import TeamCreate, TeamUpdate, TeamResponse
from app.dependencies.auth import get_current_user, require_permission

router = APIRouter()

@router.post("", response_model=TeamResponse)
async def create_team(
    team_in: TeamCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("manage_org"))
):
    team = Team(
        id=uuid.uuid4(),
        name=team_in.name,
        organization_id=team_in.organization_id,
        team_lead_id=team_in.team_lead_id
    )
    db.add(team)

    # Write Audit Log
    audit = AuditLog(
        id=uuid.uuid4(),
        user_id=current_user.id,
        action="team_created",
        entity_type="team",
        entity_id=str(team.id),
        details=f"Team '{team.name}' created by operator."
    )
    db.add(audit)
    await db.commit()
    return team

@router.get("", response_model=List[TeamResponse])
async def list_teams(
    organization_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Team).filter(Team.organization_id == organization_id).order_by(Team.name.asc()))
    return result.scalars().all()

@router.get("/{team_id}", response_model=TeamResponse)
async def get_team(team_id: UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    res = await db.execute(select(Team).filter(Team.id == team_id))
    team = res.scalars().first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team

@router.put("/{team_id}", response_model=TeamResponse)
async def update_team(
    team_id: UUID,
    team_update: TeamUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("manage_org"))
):
    res = await db.execute(select(Team).filter(Team.id == team_id))
    team = res.scalars().first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    if team_update.name is not None:
        team.name = team_update.name
    if team_update.team_lead_id is not None:
        team.team_lead_id = team_update.team_lead_id

    # Audit Log
    audit = AuditLog(
        id=uuid.uuid4(),
        user_id=current_user.id,
        action="team_updated",
        entity_type="team",
        entity_id=str(team.id),
        details="Team metadata updated."
    )
    db.add(audit)
    await db.commit()
    return team

@router.delete("/{team_id}")
async def delete_team(
    team_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("manage_org"))
):
    res = await db.execute(select(Team).filter(Team.id == team_id))
    team = res.scalars().first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    db.delete(team)
    
    # Audit Log
    audit = AuditLog(
        id=uuid.uuid4(),
        user_id=current_user.id,
        action="team_deleted",
        entity_type="team",
        entity_id=str(team_id),
        details=f"Team '{team.name}' deleted."
    )
    db.add(audit)
    await db.commit()
    return {"message": "Team deleted successfully"}

@router.post("/{team_id}/members")
async def add_team_member(
    team_id: UUID,
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("manage_members"))
):
    # Verify team exists
    t_res = await db.execute(select(Team).filter(Team.id == team_id))
    if not t_res.scalars().first():
        raise HTTPException(status_code=404, detail="Team not found")

    # Insert into team_members join table
    link_res = await db.execute(
        select(1).select_from(team_members)
        .filter(team_members.c.team_id == team_id, team_members.c.user_id == user_id)
    )
    if not link_res.scalar():
        await db.execute(
            team_members.insert().values(team_id=team_id, user_id=user_id)
        )
        
    # Audit Log
    audit = AuditLog(
        id=uuid.uuid4(),
        user_id=current_user.id,
        action="team_member_added",
        entity_type="team",
        entity_id=str(team_id),
        details=f"User {user_id} added to team."
    )
    db.add(audit)
    await db.commit()
    return {"message": "User added to team successfully"}

@router.delete("/{team_id}/members/{user_id}")
async def remove_team_member(
    team_id: UUID,
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("manage_members"))
):
    # Remove from team_members join table
    await db.execute(
        team_members.delete().where(
            team_members.c.team_id == team_id,
            team_members.c.user_id == user_id
        )
    )
    
    # Audit Log
    audit = AuditLog(
        id=uuid.uuid4(),
        user_id=current_user.id,
        action="team_member_removed",
        entity_type="team",
        entity_id=str(team_id),
        details=f"User {user_id} removed from team."
    )
    db.add(audit)
    await db.commit()
    return {"message": "User removed from team successfully"}
