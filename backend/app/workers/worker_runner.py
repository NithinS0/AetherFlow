import os
import sys
import time
import uuid
import httpx
import random
import asyncio
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("aetherflow.worker")

API_URL = os.getenv("API_URL")
if not API_URL:
    raise SystemExit("Missing required environment variable API_URL for worker registration.")
API_V1 = f"{API_URL.rstrip('/')}/api/v1"
WORKER_NAME = os.getenv("WORKER_NAME", f"worker-node-{uuid.uuid4().hex[:6]}")
MAX_JOBS = int(os.getenv("MAX_JOBS", "4"))

class AetherWorker:
    def __init__(self):
        self.worker_id = None
        self.running_jobs = {} # job_id -> task
        self.client = httpx.AsyncClient(timeout=10.0)

    async def start(self):
        logger.info(f"Starting AetherWorker '{WORKER_NAME}' connecting to {API_URL}")
        
        # 1. Register worker
        registered = False
        while not registered:
            try:
                response = await self.client.post(
                    f"{API_V1}/workers/register",
                    json={"name": WORKER_NAME, "max_jobs_limit": MAX_JOBS}
                )
                if response.status_code == 200:
                    data = response.json()
                    self.worker_id = data["id"]
                    registered = True
                    logger.info(f"Worker registered successfully. ID: {self.worker_id}")
                else:
                    logger.error(f"Failed to register: {response.text}. Retrying...")
                    await asyncio.sleep(3)
            except Exception as e:
                logger.error(f"Connection error to backend: {e}. Retrying...")
                await asyncio.sleep(3)

        # 2. Start concurrency loops
        await asyncio.gather(
            self.heartbeat_loop(),
            self.job_claim_loop()
        )

    async def heartbeat_loop(self):
        while True:
            try:
                # Generate realistic CPU / memory metrics
                cpu = round(random.uniform(15.0, 45.0) + (len(self.running_jobs) * 12.0), 1)
                memory = round(random.uniform(40.0, 55.0) + (len(self.running_jobs) * 5.0), 1)
                
                payload = {
                    "system_metrics": {"cpu": cpu, "memory": memory},
                    "current_jobs_count": len(self.running_jobs)
                }
                
                res = await self.client.post(
                    f"{API_V1}/workers/{self.worker_id}/heartbeat",
                    json=payload
                )
                if res.status_code != 200:
                    logger.warning(f"Heartbeat failed: {res.status_code}")
            except Exception as e:
                logger.error(f"Error sending heartbeat: {e}")
                
            await asyncio.sleep(2)

    async def job_claim_loop(self):
        while True:
            # Only poll if we are under capacity
            if len(self.running_jobs) < MAX_JOBS:
                try:
                    res = await self.client.post(f"{API_V1}/workers/{self.worker_id}/claim")
                    if res.status_code == 200:
                        jobs = res.json()
                        for job in jobs:
                            job_id = job["id"]
                            logger.info(f"Claimed job: {job['name']} ({job_id})")
                            task = asyncio.create_task(self.execute_job(job))
                            self.running_jobs[job_id] = task
                    elif res.status_code != 204: # 204 means no jobs available
                        logger.warning(f"Failed to claim: {res.status_code}")
                except Exception as e:
                    logger.error(f"Error claiming jobs: {e}")
            
            await asyncio.sleep(1)

    async def execute_job(self, job):
        job_id = job["id"]
        job_name = job["name"]
        payload = job.get("payload", {})
        
        logger.info(f"Executing job {job_name} ({job_id})")
        
        try:
            # 1. Update status to Running (already set in DB, but let's stream start log)
            start_logs = f"[INFO] Thread started. Initializing environment variables.\n[INFO] Job payload: {payload}"
            await self.send_job_status(job_id, "running", logs=start_logs)
            
            # 2. Run simulation time
            run_duration = payload.get("duration", random.randint(4, 9))
            for percent in [25, 50, 75]:
                await asyncio.sleep(run_duration / 4)
                progress_log = f"[INFO] Task progress: {percent}% completed. Running computations."
                await self.send_job_status(job_id, "running", logs=progress_log)
                
            await asyncio.sleep(run_duration / 4)

            # 3. Complete or fail job
            # If payload explicitly says "fail": true, or random flaky failures for sample invoice tasks
            should_fail = payload.get("fail", False)
            if not should_fail and "invoice" in job_name.lower():
                # Let E-commerce invoice job fail on its first run to show AI analyst
                # It has job name E-commerce Invoice Batch, which fails if no retry occurred yet
                should_fail = (job.get("retry_count", 0) == 0)

            if should_fail:
                error_msg = payload.get("error_message", "Database read timeout at record #422")
                logger.error(f"Job {job_name} failed: {error_msg}")
                await self.send_job_status(
                    job_id, 
                    "failed", 
                    logs="[ERROR] Fatal Exception: database cursor connection lost.\n[ERROR] Thread terminated.", 
                    error_message=error_msg
                )
            else:
                logger.info(f"Job {job_name} completed successfully.")
                await self.send_job_status(
                    job_id, 
                    "completed", 
                    logs="[INFO] Final synchronization completed.\n[INFO] Thread released."
                )
                
        except Exception as e:
            logger.error(f"Execution system exception in {job_name}: {e}")
            await self.send_job_status(job_id, "failed", error_message=str(e))
        finally:
            if job_id in self.running_jobs:
                del self.running_jobs[job_id]

    async def send_job_status(self, job_id, status, logs=None, error_message=None):
        try:
            await self.client.post(
                f"{API_V1}/jobs/{job_id}/status",
                json={
                    "status": status,
                    "logs": logs,
                    "error_message": error_message
                }
            )
        except Exception as e:
            logger.error(f"Failed to submit status for job {job_id}: {e}")

if __name__ == "__main__":
    worker = AetherWorker()
    try:
        asyncio.run(worker.start())
    except KeyboardInterrupt:
        logger.info("Worker stopped by user.")
