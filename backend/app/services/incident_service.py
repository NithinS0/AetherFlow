import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models import Incident, IncidentComment, User, Job, AuditLog
from app.api.sockets import socket_manager

class IncidentService:
    @staticmethod
    async def get_all_incidents(db: AsyncSession) -> List[Incident]:
        result = await db.execute(
            select(Incident)
            .options(
                selectinload(Incident.job),
                selectinload(Incident.comments).selectinload(IncidentComment.user)
            )
            .order_by(Incident.created_at.desc())
        )
        return result.scalars().all()

    @staticmethod
    async def acknowledge_incident(db: AsyncSession, incident_id: uuid.UUID, user_id: uuid.UUID) -> Incident:
        res = await db.execute(
            select(Incident)
            .options(selectinload(Incident.job))
            .filter(Incident.id == incident_id)
        )
        incident = res.scalars().first()
        if not incident:
            raise ValueError("Incident not found")
            
        incident.status = "acknowledged"
        incident.assignee_id = user_id
        
        # Audit log
        audit = AuditLog(
            id=uuid.uuid4(),
            user_id=user_id,
            action="acknowledge_incident",
            target_type="incident",
            target_id=str(incident_id),
            details=f"Incident acknowledged."
        )
        db.add(audit)
        await db.commit()
        
        await socket_manager.broadcast("incident_update", {
            "incident_id": str(incident.id),
            "status": "acknowledged",
            "assignee_id": str(user_id)
        })
        return incident

    @staticmethod
    async def resolve_incident(db: AsyncSession, incident_id: uuid.UUID, user_id: uuid.UUID) -> Incident:
        res = await db.execute(
            select(Incident)
            .options(selectinload(Incident.job))
            .filter(Incident.id == incident_id)
        )
        incident = res.scalars().first()
        if not incident:
            raise ValueError("Incident not found")
            
        incident.status = "resolved"
        
        # If the underlying job was dead_letter, resolve the incident and reset job status to completed if resolved by admin
        # (Though retry approval handles the actual retry execution, resolving the incident marks it done in operations room)
        
        # Audit log
        audit = AuditLog(
            id=uuid.uuid4(),
            user_id=user_id,
            action="resolve_incident",
            target_type="incident",
            target_id=str(incident_id),
            details=f"Incident marked resolved."
        )
        db.add(audit)
        await db.commit()
        
        await socket_manager.broadcast("incident_update", {
            "incident_id": str(incident.id),
            "status": "resolved"
        })
        return incident

    @staticmethod
    async def add_comment(
        db: AsyncSession,
        incident_id: uuid.UUID,
        user_id: uuid.UUID,
        message: str
    ) -> IncidentComment:
        # Check user
        u_res = await db.execute(select(User).filter(User.id == user_id))
        user = u_res.scalars().first()
        if not user:
            raise ValueError("User not found")
            
        comment = IncidentComment(
            id=uuid.uuid4(),
            incident_id=incident_id,
            user_id=user_id,
            message=message,
            created_at=datetime.utcnow()
        )
        db.add(comment)
        await db.commit()
        
        # Broadcast chat message to the specific incident room
        await socket_manager.broadcast("incident_chat", {
            "id": str(comment.id),
            "incident_id": str(incident_id),
            "user_id": str(user_id),
            "user_name": user.full_name or user.email,
            "message": message,
            "created_at": comment.created_at.isoformat()
        })
        return comment
