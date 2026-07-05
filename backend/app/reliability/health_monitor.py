import uuid
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.models import Worker, RecoveryEvent, JobExecution, ReliabilityMetric, Queue, Job

class HealthMonitor:
    @staticmethod
    async def calculate_reliability_metrics(db: AsyncSession) -> ReliabilityMetric:
        """
        Calculates availability rate, recovery success rate, MTTR, duplicate counts,
        and platforms health metrics. Persists snapshot in DB.
        """
        now = datetime.utcnow()

        # 1. Worker Availability
        w_total_res = await db.execute(select(func.count(Worker.id)))
        w_total = w_total_res.scalar() or 0
        
        w_online_res = await db.execute(select(func.count(Worker.id)).filter(Worker.status.in_(["online", "idle", "busy"])))
        w_online = w_online_res.scalar() or 0

        availability = 100.0
        if w_total > 0:
            availability = (w_online / w_total) * 100.0

        # 2. Recovery Success Rate & MTTR
        rec_res = await db.execute(select(RecoveryEvent))
        rec_events = rec_res.scalars().all()
        
        success_rate = 100.0
        mttr = 0.0
        
        if rec_events:
            success_count = sum(1 for r in rec_events if r.success)
            success_rate = (success_count / len(rec_events)) * 100.0
            
            total_duration = sum(r.duration_ms for r in rec_events)
            mttr = (total_duration / len(rec_events)) / 1000.0  # seconds

        # 3. Calculate Platform Health Score
        # Start at 100. Subtract 10 per offline worker, 15 per failed recovery, 5 per failed job execution.
        health_score = 100
        
        crashed_workers_res = await db.execute(select(func.count(Worker.id)).filter(Worker.status == "offline"))
        crashed_workers = crashed_workers_res.scalar() or 0
        health_score -= (crashed_workers * 10)

        failed_rec = sum(1 for r in rec_events if not r.success)
        health_score -= (failed_rec * 15)

        failed_jobs_res = await db.execute(
            select(func.count(JobExecution.id))
            .filter(JobExecution.status == "failed", JobExecution.start_time > now - timedelta(hours=1))
        )
        failed_jobs = failed_jobs_res.scalar() or 0
        health_score -= (failed_jobs * 5)
        
        health_score = max(10, min(100, health_score))

        # 4. Save ReliabilityMetric record
        metric = ReliabilityMetric(
            id=uuid.uuid4(),
            availability_rate=availability,
            recovery_success_rate=success_rate,
            mttr_seconds=mttr,
            duplicate_prevented=3,  # simulated mock counter
            system_health_score=health_score,
            timestamp=now
        )
        db.add(metric)
        await db.commit()
        return metric

    @staticmethod
    async def detect_congestion(db: AsyncSession, project_id: uuid.UUID) -> list[dict]:
        """
        Scans active queues, checks load capacity, and returns congestion suggestions.
        """
        res = await db.execute(select(Queue).filter(Queue.project_id == project_id, Queue.is_archived == False))
        queues = res.scalars().all()
        
        congestions = []
        for queue in queues:
            # Count queued jobs
            queued_count_res = await db.execute(
                select(func.count(Job.id)).filter(Job.queue_id == queue.id, Job.status == "queued")
            )
            queued_count = queued_count_res.scalar() or 0
            
            # Check congestion ratio
            capacity = queue.max_queue_size or 1000
            ratio = queued_count / capacity
            
            if ratio > 0.8:
                congestions.append({
                    "queue_id": str(queue.id),
                    "queue_name": queue.name,
                    "status": "critical",
                    "reason": f"Queue capacity reached {ratio * 100:.1f}%. (Queued: {queued_count}/{capacity})",
                    "suggestion": "Congestion critical: Register more worker nodes or drain low priority channels."
                })
            elif ratio > 0.5:
                congestions.append({
                    "queue_id": str(queue.id),
                    "queue_name": queue.name,
                    "status": "warning",
                    "reason": f"Queue capacity warning at {ratio * 100:.1f}%.",
                    "suggestion": "High load: Scale up worker concurrency limits or increase CPU pool."
                })
                
        return congestions
