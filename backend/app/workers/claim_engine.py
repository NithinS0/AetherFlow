import uuid
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.models import Job, Queue, JobExecution, Worker

class ClaimEngine:
    @staticmethod
    async def claim_next_job(
        db: AsyncSession,
        worker_id: uuid.UUID,
        supported_queues: list[uuid.UUID]
    ) -> Job | None:
        """
        Atomically queries and claims the next runnable job using SELECT FOR UPDATE SKIP LOCKED.
        Enforces queue concurrency limits and locks rows to prevent duplicate execution.
        """
        # Ensure worker exists and is online/idle
        w_res = await db.execute(select(Worker).filter(Worker.id == worker_id))
        worker = w_res.scalars().first()
        if not worker or worker.status in ["offline", "maintenance", "stopping"]:
            return None

        # Filter active queue lists
        for q_id in supported_queues:
            # 1. Fetch Queue Configuration
            q_res = await db.execute(select(Queue).filter(Queue.id == q_id, Queue.is_paused == False, Queue.is_archived == False))
            queue = q_res.scalars().first()
            if not queue:
                continue

            # 2. Check Queue Concurrency limits
            active_count_res = await db.execute(
                select(func.count(Job.id)).filter(Job.queue_id == q_id, Job.status == "running")
            )
            active_count = active_count_res.scalar() or 0
            if active_count >= queue.concurrency_limit:
                continue # Skip this queue, limit reached

            # 3. Query and atomically lock one queued job
            # FOR UPDATE SKIP LOCKED ensures concurrent workers bypass already locked rows
            stmt = (
                select(Job)
                .filter(Job.queue_id == q_id, Job.status == "queued")
                .order_by(Job.priority == "high", Job.priority == "medium", Job.created_at.asc())
                .limit(1)
                .with_for_update(skip_locked=True)
            )
            job_res = await db.execute(stmt)
            job = job_res.scalars().first()

            if job:
                # 4. Atomically claim the job
                job.status = "running"
                job.execution_time = datetime.utcnow()
                
                # 5. Create JobExecution record
                execution = JobExecution(
                    id=uuid.uuid4(),
                    job_id=job.id,
                    worker_id=worker_id,
                    status="running",
                    start_time=datetime.utcnow()
                )
                db.add(execution)
                
                # Update worker state
                worker.status = "busy"
                
                await db.commit()
                return job

        return None
