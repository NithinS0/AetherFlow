from typing import Optional
from uuid import UUID
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models import Worker
from app.core.event_bus import bus
import logging

logger = logging.getLogger(__name__)

class WorkerService:
    """
    Business Logic Layer for Workers.
    Handles worker heartbeats and dead worker recovery.
    """
    def __init__(self, session: AsyncSession):
        self.session = session
        
    async def process_heartbeat(self, worker_id: UUID):
        """Updates worker heartbeat timestamp."""
        stmt = update(Worker).where(Worker.id == worker_id).values(last_heartbeat_at=datetime.utcnow(), status="online")
        await self.session.execute(stmt)
        await self.session.commit()
        logger.info(f"Worker {worker_id} heartbeat updated.")

    async def sweep_dead_workers(self):
        """
        Background task to find workers that haven't heartbeated in X seconds.
        Triggers failure events.
        """
        threshold = datetime.utcnow() - timedelta(seconds=30)
        
        stmt = select(Worker).where(Worker.last_heartbeat_at < threshold, Worker.status == "online")
        result = await self.session.execute(stmt)
        dead_workers = result.scalars().all()
        
        for worker in dead_workers:
            logger.warning(f"Worker {worker.id} marked as dead. Initiating recovery.")
            worker.status = "offline"
            await bus.publish("WORKER_OFFLINE", {"worker_id": str(worker.id)})
            
        if dead_workers:
            await self.session.commit()

    @staticmethod
    async def monitor_workers_health(db: AsyncSession):
        """Monitors and triggers self-healing / recovery for offline workers."""
        from app.workers.recovery_engine import RecoveryEngine
        await RecoveryEngine.perform_recovery(db)
