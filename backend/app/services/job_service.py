from typing import Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Job
from app.repositories.job_repository import JobRepository
from app.schemas.jobs import JobCreateSchema
from app.core.event_bus import bus
from app.core.exceptions import BusinessError

class JobService:
    """
    Business Logic Layer for Jobs.
    Coordinates between Repositories and external services (like the Event Bus).
    """
    def __init__(self, session: AsyncSession):
        self.repository = JobRepository(session)

    async def create_job(self, data: JobCreateSchema) -> Job:
        job = Job(
            queue_id=data.queue_id,
            status="queued"
        )
        created_job = await self.repository.create(job)
        
        # Publish event
        await bus.publish("JOB_CREATED", {"job_id": str(created_job.id)})
        
        return created_job

    async def claim_job(self, queue_id: UUID, worker_id: UUID) -> Optional[Job]:
        """Claims a job using atomic skip locked mechanism."""
        job = await self.repository.claim_next_job(queue_id, worker_id)
        if job:
            await bus.publish("JOB_STARTED", {"job_id": str(job.id), "worker_id": str(worker_id)})
        return job
