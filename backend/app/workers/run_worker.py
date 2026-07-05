import asyncio
import sys
import os
import uuid
import socket
import signal
from datetime import datetime
from sqlalchemy import select

# Setup path so we can import from app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from app.database.session import AsyncSessionLocal
from app.models import Worker, WorkerHeartbeat, Job, JobExecution, JobLog, WorkerEvent, Queue
from app.workers.claim_engine import ClaimEngine

worker_id = uuid.uuid4()
hostname = socket.gethostname()
worker_name = f"worker-{hostname.lower()}-{worker_id.hex[:4]}"
running = True

def handle_exit(signum, frame):
    global running
    print(f"\n[Worker] Graceful shutdown triggered via signal {signum}...")
    running = False

# Register signal handlers
try:
    signal.signal(signal.SIGINT, handle_exit)
    signal.signal(signal.SIGTERM, handle_exit)
except ValueError:
    # Signals must be set in main thread (fine for CLI running)
    pass

async def register_worker():
    print(f"[Worker] Registering node '{worker_name}' (ID: {worker_id})")
    async with AsyncSessionLocal() as db:
        # Load all queue IDs to support
        res = await db.execute(select(Queue.id).filter(Queue.is_archived == False))
        queue_ids = [str(r[0]) for r in res.all()]

        worker = Worker(
            id=worker_id,
            name=worker_name,
            hostname=hostname,
            version="1.0.0",
            status="idle",
            supported_queues=queue_ids,
            capabilities=["api", "batch", "email"],
            started_at=datetime.utcnow(),
            last_heartbeat_at=datetime.utcnow()
        )
        db.add(worker)
        
        evt = WorkerEvent(
            id=uuid.uuid4(),
            worker_id=worker_id,
            event_type="register",
            details=f"Worker '{worker_name}' registered on SRE node cluster.",
            timestamp=datetime.utcnow()
        )
        db.add(evt)
        await db.commit()

async def send_heartbeat(db_session):
    # Update worker heartbeat timestamp
    res = await db_session.execute(select(Worker).filter(Worker.id == worker_id))
    worker = res.scalars().first()
    if worker:
        worker.last_heartbeat_at = datetime.utcnow()
        
        heartbeat = WorkerHeartbeat(
            id=uuid.uuid4(),
            worker_id=worker_id,
            cpu_usage=12.5,  # simulated
            memory_usage=45.2,  # simulated
            current_job_count=1 if worker.status == "busy" else 0,
            timestamp=datetime.utcnow()
        )
        db_session.add(heartbeat)
        await db_session.commit()

async def execute_job_simulate(db_session, job: Job):
    print(f"[Worker] Thread [{worker_name}] claimed job: {job.id}")
    
    # 1. Fetch execution record
    exec_res = await db_session.execute(
        select(JobExecution).filter(JobExecution.job_id == job.id, JobExecution.status == "running")
    )
    execution = exec_res.scalars().first()
    if not execution:
        return

    # Add logs
    l1 = JobLog(id=uuid.uuid4(), execution_id=execution.id, level="info", message=f"Starting simulated execution for task: {job.type}", timestamp=datetime.utcnow())
    db_session.add(l1)
    await db_session.commit()

    # Simulate processing delay
    await asyncio.sleep(2.0)

    # 2. Complete or Fail job based on payload config
    payload = job.payload or {}
    simulate_fail = payload.get("simulate_fail", False)

    if simulate_fail:
        print(f"[Worker] Simulating failure for job: {job.id}")
        execution.status = "failed"
        execution.end_time = datetime.utcnow()
        execution.duration = 2.0
        execution.error = {"detail": "Payload specified simulated execution failure."}
        
        l2 = JobLog(id=uuid.uuid4(), execution_id=execution.id, level="error", message="Task execution halted: Simulated payload failure exception.", timestamp=datetime.utcnow())
        db_session.add(l2)
        
        # Route retry
        if job.retry_count < job.max_retries:
            job.retry_count += 1
            job.status = "queued"
            job.scheduled_time = datetime.utcnow() + timedelta(seconds=10) # 10s fixed retry delay
        else:
            job.status = "dead_letter"
    else:
        print(f"[Worker] Job completed successfully: {job.id}")
        execution.status = "completed"
        execution.end_time = datetime.utcnow()
        execution.duration = 2.0
        execution.output = {"status": "success", "processed_by": worker_name}
        
        l2 = JobLog(id=uuid.uuid4(), execution_id=execution.id, level="info", message="Task completed successfully. Output parameters saved.", timestamp=datetime.utcnow())
        db_session.add(l2)
        job.status = "completed"

    # Reset worker to idle
    w_res = await db_session.execute(select(Worker).filter(Worker.id == worker_id))
    worker = w_res.scalars().first()
    if worker:
        worker.status = "idle"

    await db_session.commit()

async def shutdown_worker():
    print(f"[Worker] Offlining worker '{worker_name}'")
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(Worker).filter(Worker.id == worker_id))
        worker = res.scalars().first()
        if worker:
            worker.status = "offline"
            evt = WorkerEvent(
                id=uuid.uuid4(),
                worker_id=worker_id,
                event_type="offline",
                details=f"Worker '{worker_name}' offlined cleanly.",
                timestamp=datetime.utcnow()
            )
            db.add(evt)
            await db.commit()

async def main():
    await register_worker()
    
    heartbeat_interval = 5  # seconds
    last_heartbeat = 0
    
    global running
    while running:
        async with AsyncSessionLocal() as db:
            # Send heartbeat
            now = datetime.utcnow().timestamp()
            if now - last_heartbeat >= heartbeat_interval:
                await send_heartbeat(db)
                last_heartbeat = now

            # Query supported queues (to handle newly added ones dynamically)
            w_res = await db.execute(select(Worker).filter(Worker.id == worker_id))
            worker = w_res.scalars().first()
            if not worker:
                break
                
            supported_queues = worker.supported_queues or []

            # Attempt to claim next job
            job = await ClaimEngine.claim_next_job(db, worker_id, supported_queues)
            if job:
                # Execute immediately in the loop (Phase 3 synchronous simulator)
                await execute_job_simulate(db, job)
            
        await asyncio.sleep(1.0)

    await shutdown_worker()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("[Worker] Halted via KeyboardInterrupt.")
