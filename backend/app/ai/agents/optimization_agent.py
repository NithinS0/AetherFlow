import uuid
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models import Queue, Job, AIRecommendation, AIActivity

class OptimizationAgent:
    @staticmethod
    async def analyze_resources(db: AsyncSession) -> list[AIRecommendation]:
        """
        Analyzes concurrency throughput and queue capacities to recommend scaling.
        """
        recommendations = []
        now = datetime.utcnow()

        # Check all active queues
        res = await db.execute(select(Queue).filter(Queue.is_archived == False))
        queues = res.scalars().all()

        for q in queues:
            # Calculate queue load (jobs completed vs failed)
            completed = (await db.execute(
                select(func.count(Job.id)).filter(Job.queue_id == q.id, Job.status == "completed")
            )).scalar() or 0
            
            failed = (await db.execute(
                select(func.count(Job.id)).filter(Job.queue_id == q.id, Job.status == "failed")
            )).scalar() or 0

            # If failure rate is high (> 30% of completed), suggest reviewing retry policy
            total = completed + failed
            if total > 5 and (failed / total) > 0.3:
                rec = AIRecommendation(
                    id=uuid.uuid4(),
                    type="retry_policy",
                    title=f"Optimize Retry Policy: {q.name}",
                    description=f"Queue '{q.name}' has a high failure rate ({failed / total * 100:.1f}%). Suggest linking a linear retry policy with backoff delay multiplier.",
                    priority="medium",
                    status="pending",
                    queue_id=q.id,
                    timestamp=now
                )
                db.add(rec)
                recommendations.append(rec)

                act = AIActivity(
                    action_type="recommendation_created",
                    details=f"Optimization Agent suggested retry policy adjustments for: {q.name}",
                    timestamp=now
                )
                db.add(act)

        await db.commit()
        return recommendations
