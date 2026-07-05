from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from app.models import Job
from uuid import UUID

class JobRepository:
    """
    Data Access Layer for Jobs.
    No business logic should reside here, only purely SQLAlchemy operations.
    """
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, job: Job) -> Job:
        self.session.add(job)
        await self.session.commit()
        await self.session.refresh(job)
        return job

    async def get_by_id(self, job_id: UUID) -> Optional[Job]:
        result = await self.session.execute(select(Job).filter(Job.id == job_id))
        return result.scalars().first()

    async def claim_next_job(self, queue_id: UUID, worker_id: UUID) -> Optional[Job]:
        """
        Atomic claiming of the next available job in a queue.
        Utilizes PostgreSQL SELECT ... FOR UPDATE SKIP LOCKED to prevent duplicate execution.
        """
        query = text("""
            UPDATE jobs
            SET status = 'running', 
                updated_at = NOW()
            WHERE id = (
                SELECT id
                FROM jobs
                WHERE queue_id = :queue_id AND status = 'queued'
                ORDER BY created_at ASC
                FOR UPDATE SKIP LOCKED
                LIMIT 1
            )
            RETURNING id, queue_id, status, retry_count;
        """)
        
        result = await self.session.execute(query, {"queue_id": queue_id})
        row = result.fetchone()
        if not row:
            return None
            
        # Map the row back to an ORM instance manually, or fetch again
        job_id = row[0]
        
        # We must commit the transaction to lock the row in the DB permanently until finished
        await self.session.commit()
        
        return await self.get_by_id(job_id)
