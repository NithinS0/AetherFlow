import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import JobExecution, JobLog

class FailureAnalyst:
    @staticmethod
    async def analyze_failure(db: AsyncSession, execution_id: uuid.UUID) -> dict:
        """
        Analyzes a specific execution failure. Emulates Llama3 root-cause analysis.
        """
        res = await db.execute(select(JobExecution).filter(JobExecution.id == execution_id))
        execution = res.scalars().first()
        if not execution:
            return {"error": "Execution node not found"}

        # Fetch logs for context
        logs_res = await db.execute(
            select(JobLog).filter(JobLog.execution_id == execution_id).order_by(JobLog.timestamp.asc())
        )
        logs = logs_res.scalars().all()
        log_lines = "\n".join([f"[{l.level.upper()}] {l.message}" for l in logs])

        error_detail = (execution.error or {}).get("detail", "Unknown execution crash")

        # Rules-based root-cause generation to simulate Groq output
        root_cause = "Unknown SRE stack trace halt exception."
        suggested_action = "Check database logs and server network ping."
        confidence = 0.65

        if "timeout" in error_detail.lower() or "timeout" in log_lines.lower():
            root_cause = "Task duration exceeded timeout threshold configured in Queue Channel."
            suggested_action = "Increase the timeout parameter of the Queue or divide payload into smaller batch sizes."
            confidence = 0.95
        elif "heartbeat" in error_detail.lower():
            root_cause = "Worker node lost connection. Missed cluster SRE heartbeats."
            suggested_action = "Inspect worker system CPU loads or re-initialize the container daemon node."
            confidence = 0.90
        elif "payload" in error_detail.lower():
            root_cause = "Payload specified simulated execution failure condition."
            suggested_action = "Verify payload config parameters. Exclude the simulate_fail flag."
            confidence = 0.99

        return {
            "execution_id": str(execution_id),
            "status": "failed",
            "error_detail": error_detail,
            "root_cause": root_cause,
            "confidence_score": confidence,
            "suggested_action": suggested_action,
            "priority": "high" if confidence > 0.8 else "medium"
        }
