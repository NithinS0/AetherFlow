import uuid
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.models import Worker, Job, JobExecution, JobLog, WorkerEvent, Queue, RetryPolicy
from app.retry.retry_calculator import RetryCalculator

class RecoveryEngine:
    @staticmethod
    async def perform_recovery(db: AsyncSession) -> None:
        """
        Scans for offline/crashed workers (no heartbeat in 15 seconds) and recovers their running jobs.
        Re-queues eligible jobs or redirects to DLQ.
        """
        expiry_threshold = datetime.utcnow() - timedelta(seconds=15)

        # 1. Fetch expired workers
        stmt = select(Worker).filter(
            and_(
                Worker.status != "offline",
                Worker.last_heartbeat_at < expiry_threshold
            )
        )
        res = await db.execute(stmt)
        expired_workers = res.scalars().all()

        for worker in expired_workers:
            worker.status = "offline"
            
            # Log Worker crashed event
            evt = WorkerEvent(
                id=uuid.uuid4(),
                worker_id=worker.id,
                event_type="crashed",
                details=f"Worker '{worker.name}' missed heartbeats. Marked offline.",
                timestamp=datetime.utcnow()
            )
            db.add(evt)
            
            # 2. Recover running executions
            exec_stmt = select(JobExecution).filter(
                JobExecution.worker_id == worker.id,
                JobExecution.status == "running"
            )
            exec_res = await db.execute(exec_stmt)
            running_executions = exec_res.scalars().all()

            for execution in running_executions:
                execution.status = "failed"
                execution.end_time = datetime.utcnow()
                execution.error = {"detail": "Worker heartbeat expired. Self-healing loop triggered recovery."}
                
                # Fetch Job
                job_res = await db.execute(select(Job).filter(Job.id == execution.job_id))
                job = job_res.scalars().first()
                if not job:
                    continue

                # Add log line to JobLog
                log_line = JobLog(
                    id=uuid.uuid4(),
                    execution_id=execution.id,
                    level="error",
                    message="Host node heartbeat expired. Re-routing task back to scheduling queue.",
                    timestamp=datetime.utcnow()
                )
                db.add(log_line)

                # Determine retry path
                if job.retry_count < job.max_retries:
                    job.retry_count += 1
                    
                    # Fetch Queue retry policy for delay
                    q_res = await db.execute(select(Queue).filter(Queue.id == job.queue_id))
                    queue = q_res.scalars().first()
                    
                    delay = 5  # default
                    pol_type = "fixed"
                    multiplier = 2.0
                    
                    if queue and queue.retry_policy_id:
                        pol_res = await db.execute(select(RetryPolicy).filter(RetryPolicy.id == queue.retry_policy_id))
                        pol = pol_res.scalars().first()
                        if pol:
                            pol_type = pol.type
                            delay = pol.delay_seconds
                            multiplier = pol.backoff_multiplier

                    next_delay = RetryCalculator.calculate_delay(pol_type, job.retry_count, delay, multiplier)
                    job.status = "queued"
                    job.scheduled_time = datetime.utcnow() + timedelta(seconds=next_delay)
                else:
                    job.status = "dead_letter"

            await db.flush()

        await db.commit()
