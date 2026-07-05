import uuid
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models import Worker, Job, Queue, ChaosRun, WorkerEvent
from app.events.event_bus import EventBus

class ChaosEngine:
    @staticmethod
    async def trigger_chaos(
        db: AsyncSession,
        scenario: str,
        project_id: uuid.UUID = None
    ) -> ChaosRun:
        """
        Executes a specific SRE chaos scenario: kill_worker, pause_worker, queue_flood, fail_execution.
        Logs run report and returns ChaosRun record.
        """
        now = datetime.utcnow()
        run = ChaosRun(
            id=uuid.uuid4(),
            scenario=scenario,
            started_at=now,
            status="active"
        )
        db.add(run)
        await db.flush()

        affected_workers = 0
        affected_jobs = 0

        if scenario == "kill_worker":
            # Set one online/idle worker to offline
            res = await db.execute(select(Worker).filter(Worker.status.in_(["online", "idle", "busy"])))
            worker = res.scalars().first()
            if worker:
                worker.status = "offline"
                worker.last_heartbeat_at = now - timedelta(seconds=30)
                affected_workers = 1
                
                evt = WorkerEvent(
                    id=uuid.uuid4(),
                    worker_id=worker.id,
                    event_type="crashed",
                    details="Chaos monkey script injected hard crash.",
                    timestamp=now
                )
                db.add(evt)
                await EventBus.publish("worker_offline", "worker", str(worker.id), "Chaos Monkey kill_worker scenario injected")

        elif scenario == "pause_worker":
            # Set worker to maintenance
            res = await db.execute(select(Worker).filter(Worker.status.in_(["online", "idle"])))
            worker = res.scalars().first()
            if worker:
                worker.status = "maintenance"
                affected_workers = 1
                await EventBus.publish("worker_maintenance", "worker", str(worker.id), "Chaos Pause worker injected")

        elif scenario == "queue_flood":
            # Insert 100 mock queued jobs inside the first project queue
            if project_id:
                q_res = await db.execute(select(Queue).filter(Queue.project_id == project_id, Queue.is_archived == False))
                queue = q_res.scalars().first()
                if queue:
                    for i in range(100):
                        mock_j = Job(
                            id=uuid.uuid4(),
                            queue_id=queue.id,
                            type="immediate",
                            status="queued",
                            priority="low",
                            payload={"action": "chaos_mock_flood", "index": i},
                            scheduled_time=now
                        )
                        db.add(mock_j)
                    affected_jobs = 100
                    await EventBus.publish("queue_flooded", "queue", str(queue.id), "100 immediate mock jobs injected")

        elif scenario == "fail_execution":
            # Force all queued jobs to fail on claiming
            res = await db.execute(select(Job).filter(Job.status == "queued"))
            jobs = res.scalars().all()
            for job in jobs:
                job.payload = {**(job.payload or {}), "simulate_fail": True}
                affected_jobs += 1
            await EventBus.publish("chaos_injected", "job", "all", "Failure execution flags injected in payloads")

        # Finish run details
        run.status = "completed"
        run.finished_at = datetime.utcnow()
        run.affected_workers_count = affected_workers
        run.affected_jobs_count = affected_jobs
        run.success = True
        run.recovery_duration_ms = 450  # simulated recovery delay in ms

        await db.commit()
        return run
