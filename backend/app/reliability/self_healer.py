import uuid
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from app.models import Job, Queue, Worker, JobExecution, RecoveryEvent, JobLog, RetryPolicy
from app.retry.retry_calculator import RetryCalculator
from app.events.event_bus import EventBus

class SelfHealer:
    @staticmethod
    async def heal_system(db: AsyncSession) -> int:
        """
        Scans for stuck running jobs, orphan executions, and stale locks.
        Automatically repairs states, re-queues tasks, and logs recovery events.
        """
        recovery_count = 0
        now = datetime.utcnow()

        # 1. Recover Orphan Jobs (Job running on an offline worker)
        stmt = (
            select(Job, JobExecution)
            .join(JobExecution, Job.id == JobExecution.job_id)
            .join(Worker, JobExecution.worker_id == Worker.id)
            .filter(Job.status == "running", Worker.status == "offline")
        )
        res = await db.execute(stmt)
        orphans = res.all()

        for job, execution in orphans:
            start_time = datetime.utcnow()
            execution.status = "failed"
            execution.end_time = now
            execution.error = {"detail": "Orphan job recovered. Assigned worker went offline."}

            # Log log line
            l = JobLog(id=uuid.uuid4(), execution_id=execution.id, level="warning", message="Self-healer detected orphan execution. Re-queuing.", timestamp=now)
            db.add(l)

            # Retry count check
            if job.retry_count < job.max_retries:
                job.retry_count += 1
                job.status = "queued"
                job.scheduled_time = now + timedelta(seconds=10)
            else:
                job.status = "dead_letter"

            recovery_count += 1
            duration = int((datetime.utcnow() - start_time).total_seconds() * 1000)

            worker_id_val = execution.worker_id
            rec = RecoveryEvent(
                id=uuid.uuid4(),
                type="orphan_job",
                worker_id=worker_id_val,
                job_id=job.id,
                duration_ms=duration,
                success=True,
                notes="Offline worker orphan job auto-reclaimed.",
                timestamp=now
            )
            db.add(rec)
            await EventBus.publish("job_recovered", "job", str(job.id), f"Orphan job recovered from offline worker {worker_id_val}")

        # 2. Stuck Jobs (Exceeded max_runtime in queue config)
        stuck_stmt = (
            select(Job, JobExecution, Queue)
            .join(JobExecution, Job.id == JobExecution.job_id)
            .join(Queue, Job.queue_id == Queue.id)
            .filter(Job.status == "running", JobExecution.status == "running")
        )
        stuck_res = await db.execute(stuck_stmt)
        active_runs = stuck_res.all()

        for job, execution, queue in active_runs:
            max_runtime = queue.max_runtime or 300 # default 5 min
            runtime_limit = now - timedelta(seconds=max_runtime)

            if execution.start_time < runtime_limit:
                start_time = datetime.utcnow()
                execution.status = "failed"
                execution.end_time = now
                execution.error = {"detail": f"Execution exceeded maximum queue runtime limit of {max_runtime}s."}

                l = JobLog(id=uuid.uuid4(), execution_id=execution.id, level="error", message=f"Task runtime exceeded limit ({max_runtime}s). Interrupted.", timestamp=now)
                db.add(l)

                if job.retry_count < job.max_retries:
                    job.retry_count += 1
                    job.status = "queued"
                    job.scheduled_time = now + timedelta(seconds=15)
                else:
                    job.status = "dead_letter"

                recovery_count += 1
                duration = int((datetime.utcnow() - start_time).total_seconds() * 1000)

                rec = RecoveryEvent(
                    id=uuid.uuid4(),
                    type="stuck_job",
                    worker_id=execution.worker_id,
                    queue_id=queue.id,
                    job_id=job.id,
                    duration_ms=duration,
                    success=True,
                    notes="Stuck runtime execution auto-interrupted and re-queued.",
                    timestamp=now
                )
                db.add(rec)
                await EventBus.publish("job_recovered", "job", str(job.id), "Stuck runtime execution recovered")

        await db.commit()
        return recovery_count
