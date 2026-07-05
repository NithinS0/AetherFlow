import uuid
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models import Worker, Queue, Job, AIRecommendation, AIActivity

class MonitoringAgent:
    @staticmethod
    async def run_analysis(db: AsyncSession) -> list[AIRecommendation]:
        """
        Scans workers and queues for anomalies. Generates SRE recommendations.
        """
        recommendations = []
        now = datetime.utcnow()

        # 1. Check for offline workers
        off_res = await db.execute(select(Worker).filter(Worker.status == "offline"))
        offline_workers = off_res.scalars().all()
        for w in offline_workers:
            rec = AIRecommendation(
                id=uuid.uuid4(),
                type="worker_count",
                title=f"Worker Node Crash Recovery Recommendation: {w.name}",
                description=f"Worker '{w.name}' missed heartbeats and is offline. Suggest restarting node or provisioning a replacement container.",
                priority="high",
                status="pending",
                worker_id=w.id,
                suggested_value="restart",
                timestamp=now
            )
            db.add(rec)
            recommendations.append(rec)
            
            # Log AI activity
            act = AIActivity(
                action_type="recommendation_created",
                details=f"Monitoring Agent raised high-priority recommendation for offline worker: {w.name}",
                timestamp=now
            )
            db.add(act)

        # 2. Check for queue saturation (jobs queued > 50)
        q_res = await db.execute(select(Queue))
        queues = q_res.scalars().all()
        for q in queues:
            jobs_queued = (await db.execute(
                select(func.count(Job.id)).filter(Job.queue_id == q.id, Job.status == "queued")
            )).scalar() or 0
            
            if jobs_queued > 50:
                rec = AIRecommendation(
                    id=uuid.uuid4(),
                    type="concurrency",
                    title=f"Scale Queue Concurrency: {q.name}",
                    description=f"Queue '{q.name}' has {jobs_queued} pending items, causing bottleneck. Suggest raising concurrency limit by 2.",
                    priority="medium",
                    status="pending",
                    queue_id=q.id,
                    suggested_value=str(q.concurrency_limit + 2),
                    timestamp=now
                )
                db.add(rec)
                recommendations.append(rec)
                
                # Log AI activity
                act = AIActivity(
                    action_type="recommendation_created",
                    details=f"Monitoring Agent raised queue congestion scaling suggestion for: {q.name}",
                    timestamp=now
                )
                db.add(act)

        await db.commit()
        return recommendations
