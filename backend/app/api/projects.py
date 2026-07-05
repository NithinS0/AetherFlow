from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID
import uuid
from app.database.session import get_db
from app.models import Project, User, AuditLog
from app.schemas.schemas import ProjectCreate, ProjectUpdate, ProjectResponse
from app.dependencies.auth import get_current_user, require_permission

router = APIRouter()

@router.post("", response_model=ProjectResponse)
async def create_project(
    proj_in: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("create_project"))
):
    project = Project(
        id=uuid.uuid4(),
        name=proj_in.name,
        description=proj_in.description,
        organization_id=proj_in.organization_id,
        avatar_url=proj_in.avatar_url,
        tags=proj_in.tags or [],
        is_archived=False
    )
    db.add(project)

    # Write Audit Log
    audit = AuditLog(
        id=uuid.uuid4(),
        user_id=current_user.id,
        action="project_created",
        entity_type="project",
        entity_id=str(project.id),
        details=f"Project '{project.name}' created inside organization."
    )
    db.add(audit)
    await db.commit()
    return project

@router.get("", response_model=List[ProjectResponse])
async def list_projects(
    organization_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Project).filter(Project.organization_id == organization_id).order_by(Project.name.asc()))
    return result.scalars().all()

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    res = await db.execute(select(Project).filter(Project.id == project_id))
    project = res.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: UUID,
    proj_update: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user) # Project settings editable by logged users in Phase 1
):
    res = await db.execute(select(Project).filter(Project.id == project_id))
    project = res.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if proj_update.name is not None:
        project.name = proj_update.name
    if proj_update.description is not None:
        project.description = proj_update.description
    if proj_update.avatar_url is not None:
        project.avatar_url = proj_update.avatar_url
    if proj_update.tags is not None:
        project.tags = proj_update.tags
    if proj_update.is_archived is not None:
        project.is_archived = proj_update.is_archived

    # Audit Log
    audit = AuditLog(
        id=uuid.uuid4(),
        user_id=current_user.id,
        action="project_updated",
        entity_type="project",
        entity_id=str(project.id),
        details="Project metadata updated."
    )
    db.add(audit)
    await db.commit()
    return project

@router.post("/{project_id}/archive", response_model=ProjectResponse)
async def archive_project(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("delete_project"))
):
    res = await db.execute(select(Project).filter(Project.id == project_id))
    project = res.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project.is_archived = True

    # Audit Log
    audit = AuditLog(
        id=uuid.uuid4(),
        user_id=current_user.id,
        action="project_archived",
        entity_type="project",
        entity_id=str(project_id),
        details=f"Project '{project.name}' archived."
    )
    db.add(audit)
    await db.commit()
    return project

@router.delete("/{project_id}")
async def delete_project(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("delete_project"))
):
    res = await db.execute(select(Project).filter(Project.id == project_id))
    project = res.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    db.delete(project)

    # Audit Log
    audit = AuditLog(
        id=uuid.uuid4(),
        user_id=current_user.id,
        action="project_deleted",
        entity_type="project",
        entity_id=str(project_id),
        details=f"Project '{project.name}' permanently deleted."
    )
    db.add(audit)
    await db.commit()
    return {"message": "Project deleted successfully"}
