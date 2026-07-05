import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.database.session import AsyncSessionLocal
from app.services.worker_service import WorkerService
from app.models import Job, Queue
from sqlalchemy import select, update
from datetime import datetime

logger = logging.getLogger("aetherflow.scheduler")

class SchedulerManager:
    def __init__(self):
        self.scheduler = AsyncIOScheduler()

    async def start(self):
        # 1. Schedule worker health checker (every 5 seconds)
        self.scheduler.add_job(
            self.check_workers_health,
            "interval",
            seconds=5,
            id="worker_health_check",
            replace_existing=True
        )

        # 2. Schedule job state transition queue checker (every 3 seconds)
        self.scheduler.add_job(
            self.transition_pending_jobs,
            "interval",
            seconds=3,
            id="job_queue_transition",
            replace_existing=True
        )

        self.scheduler.start()
        logger.info("AetherFlow APScheduler Coordinator started.")

    async def shutdown(self):
        self.scheduler.shutdown()
        logger.info("AetherFlow APScheduler Coordinator shut down.")

    async def check_workers_health(self):
        async with AsyncSessionLocal() as db:
            try:
                await WorkerService.monitor_workers_health(db)
            except Exception as e:
                logger.error(f"Error checking worker health: {e}")

    async def transition_pending_jobs(self):
        """
        Transitions jobs whose run_at <= now from 'pending' to 'queued' status.
        """
        async with AsyncSessionLocal() as db:
            try:
                now = datetime.utcnow()
                # Find pending jobs ready to be queued
                stmt = (
                    select(Job)
                    .filter(Job.status == "pending", Job.scheduled_time <= now)
                )
                res = await db.execute(stmt)
                jobs = res.scalars().all()
                
                if jobs:
                    for job in jobs:
                        job.status = "queued"
                    await db.commit()
            except Exception as e:
                logger.error(f"Error transitioning jobs: {e}")

scheduler_manager = SchedulerManager()
