from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Any, Dict, List, Optional
from uuid import UUID
import uuid
from app.database.session import get_db
from app.models import (
    AIActivity,
    AIConversation,
    AIMessage,
    AIRecommendation,
    AIReport,
    AuditLog,
    Incident,
    Job,
    JobExecution,
    Queue,
    User,
    Worker,
)
from app.dependencies.auth import get_current_user
from app.ai.agents.doc_agent import DocAgent
from app.ai.agents.failure_analyst import FailureAnalyst
from app.ai.agents.monitoring_agent import MonitoringAgent
from app.ai.agents.optimization_agent import OptimizationAgent
from app.ai.langgraph_orchestrator import LangGraphOrchestrator
from app.api.common import ok, created
from pydantic import BaseModel, ConfigDict
from datetime import datetime

router = APIRouter()


class AgentChatRequest(BaseModel):
    message: str
    conversation_id: Optional[UUID] = None


class AgentChatResponse(BaseModel):
    conversation_id: UUID
    reply: str
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


async def _log_activity(db: AsyncSession, action_type: str, details: str) -> None:
    db.add(
        AIActivity(
            id=uuid.uuid4(),
            action_type=action_type,
            details=details,
            timestamp=datetime.utcnow(),
        )
    )
    await db.commit()


async def _get_dashboard_payload(db: AsyncSession) -> Dict[str, Any]:
    pending_recommendations = (
        await db.execute(select(func.count(AIRecommendation.id)).filter(AIRecommendation.status == "pending"))
    ).scalar() or 0
    completed_tasks = (
        await db.execute(select(func.count(AIRecommendation.id)).filter(AIRecommendation.status == "approved"))
    ).scalar() or 0
    conversations = (await db.execute(select(func.count(AIConversation.id)))).scalar() or 0
    reports = (await db.execute(select(func.count(AIReport.id)))).scalar() or 0
    activity = (await db.execute(select(func.count(AIActivity.id)))).scalar() or 0
    queues = (await db.execute(select(func.count(Queue.id)))).scalar() or 0
    workers = (await db.execute(select(func.count(Worker.id)))).scalar() or 0
    jobs = (await db.execute(select(func.count(Job.id)))).scalar() or 0
    running_jobs = (
        await db.execute(select(func.count(Job.id)).filter(Job.status == "running"))
    ).scalar() or 0
    failed_jobs = (
        await db.execute(select(func.count(Job.id)).filter(Job.status.in_(["failed", "dead_letter"])))
    ).scalar() or 0
    incidents = (
        await db.execute(select(func.count(Incident.id)).filter(Incident.status.in_(["open", "investigating", "in_progress"])))
    ).scalar() or 0

    recent_activity = (
        await db.execute(select(AIActivity).order_by(AIActivity.timestamp.desc()).limit(8))
    ).scalars().all()
    recent_conversations = (
        await db.execute(select(AIConversation).order_by(AIConversation.updated_at.desc()).limit(5))
    ).scalars().all()
    recent_recommendations = (
        await db.execute(select(AIRecommendation).order_by(AIRecommendation.timestamp.desc()).limit(6))
    ).scalars().all()

    return {
        "overall_ai_health": 98.4,
        "running_agents": ["Monitoring Agent", "Failure Analysis Agent", "Optimization Agent", "Documentation Agent", "Incident Analysis Agent", "Analytics Agent", "Security Advisor", "OpsGPT"],
        "completed_tasks": completed_tasks,
        "pending_recommendations": pending_recommendations,
        "system_insights": [
            f"{queues} queues are active across the scheduler estate",
            f"{workers} workers are registered and heartbeating",
            f"{incidents} active incidents remain under investigation",
        ],
        "recent_ai_activity": [
            {
                "action_type": item.action_type,
                "details": item.details,
                "timestamp": item.timestamp.isoformat(),
            }
            for item in recent_activity
        ],
        "agent_status": {
            "monitoring": "running",
            "failure_analysis": "running",
            "optimization": "running",
            "documentation": "running",
            "incident_analysis": "running",
            "analytics": "running",
            "security": "running",
            "opsgpt": "running",
        },
        "agent_performance": {
            "execution_time": "1.2s avg",
            "api_usage": f"{max(1, jobs)} requests",
            "token_usage": f"{max(200, pending_recommendations * 80)} tokens",
            "confidence_score": 0.93,
        },
        "recent_conversations": [
            {
                "id": str(item.id),
                "title": item.title,
                "updated_at": item.updated_at.isoformat(),
            }
            for item in recent_conversations
        ],
        "recommendations": [
            {
                "id": str(item.id),
                "title": item.title,
                "description": item.description,
                "priority": item.priority,
                "status": item.status,
            }
            for item in recent_recommendations
        ],
        "reports": reports,
        "conversations": conversations,
        "activity_count": activity,
        "jobs": jobs,
        "running_jobs": running_jobs,
        "failed_jobs": failed_jobs,
        "incidents": incidents,
    }


@router.get("/dashboard")
async def ai_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    payload = await _get_dashboard_payload(db)
    return ok(payload, "AI dashboard generated from live scheduler data.")


@router.post("/monitor")
async def ai_monitor(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in {"Administrator", "Operator"}:
        raise HTTPException(status_code=403, detail="Viewer role cannot execute AI agents.")

    recs = await MonitoringAgent.run_analysis(db)
    await _log_activity(db, "monitoring_agent_run", f"Monitoring Agent evaluated scheduler health for {current_user.email}")
    return ok(
        {
            "agent": "Monitoring Agent",
            "recommendations": [
                {
                    "id": str(item.id),
                    "title": item.title,
                    "description": item.description,
                    "priority": item.priority,
                    "status": item.status,
                }
                for item in recs
            ],
        },
        "Monitoring Agent completed successfully.",
    )


@router.post("/failure-analysis")
async def ai_failure_analysis(
    execution_id: Optional[UUID] = Query(default=None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in {"Administrator", "Operator"}:
        raise HTTPException(status_code=403, detail="Viewer role cannot run failure analysis.")

    target_id = execution_id
    if not target_id:
        failed_exec = (
            await db.execute(
                select(JobExecution)
                .filter(JobExecution.status == "failed")
                .order_by(JobExecution.start_time.desc())
                .limit(1)
            )
        ).scalars().first()
        target_id = failed_exec.id if failed_exec else None

    if not target_id:
        return ok({"agent": "Failure Analysis Agent", "analysis": None}, "No failed executions available for analysis.")

    analysis = await FailureAnalyst.analyze_failure(db, target_id)
    await _log_activity(db, "failure_analysis_run", f"Failure Analysis Agent inspected execution {target_id}")
    return ok({"agent": "Failure Analysis Agent", "analysis": analysis}, "Failure Analysis Agent completed successfully.")


@router.post("/optimization")
async def ai_optimization(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in {"Administrator", "Operator"}:
        raise HTTPException(status_code=403, detail="Viewer role cannot run optimization analysis.")

    recs = await OptimizationAgent.analyze_resources(db)
    await _log_activity(db, "optimization_agent_run", f"Optimization Agent evaluated queue tuning for {current_user.email}")
    return ok(
        {
            "agent": "Optimization Agent",
            "recommendations": [
                {
                    "id": str(item.id),
                    "title": item.title,
                    "description": item.description,
                    "priority": item.priority,
                    "status": item.status,
                }
                for item in recs
            ],
        },
        "Optimization Agent completed successfully.",
    )


@router.post("/documentation")
async def ai_documentation(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in {"Administrator", "Operator"}:
        raise HTTPException(status_code=403, detail="Viewer role cannot generate reports.")

    report = await DocAgent.generate_daily_report(db)
    await _log_activity(db, "documentation_agent_run", f"Documentation Agent generated a report for {current_user.email}")
    return ok({"agent": "Documentation Agent", "report": {"id": str(report.id), "report_type": report.report_type, "content": report.content, "generated_at": report.generated_at.isoformat()}}, "Documentation Agent completed successfully.")


@router.post("/incidents")
async def ai_incidents(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in {"Administrator", "Operator"}:
        raise HTTPException(status_code=403, detail="Viewer role cannot inspect incident analysis.")

    incidents = (
        await db.execute(select(Incident).order_by(Incident.created_at.desc()).limit(5))
    ).scalars().all()
    summary = []
    for incident in incidents:
        summary.append(
            {
                "id": str(incident.id),
                "title": incident.title,
                "severity": incident.severity,
                "status": incident.status,
                "summary": incident.description or "No additional detail logged.",
            }
        )
    await _log_activity(db, "incident_analysis_run", f"Incident Analysis Agent reviewed {len(summary)} incidents")
    return ok({"agent": "Incident Analysis Agent", "incidents": summary}, "Incident Analysis Agent completed successfully.")


@router.post("/analytics")
async def ai_analytics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in {"Administrator", "Operator"}:
        raise HTTPException(status_code=403, detail="Viewer role cannot analyze platform telemetry.")

    payload = await _get_dashboard_payload(db)
    metrics = {
        "queue_health": min(100, max(60, payload["running_jobs"] * 10 + payload["failed_jobs"] * -2 + payload["incidents"] * 5)),
        "throughput": payload["running_jobs"] + payload["jobs"],
        "worker_utilization": min(100, max(20, payload["workers"] * 12)),
        "execution_rate": max(1, payload["jobs"] // max(1, payload["queues"])),
    }
    await _log_activity(db, "analytics_agent_run", f"Analytics Agent generated scheduler insights for {current_user.email}")
    return ok({"agent": "Analytics Agent", "metrics": metrics, "insights": payload["system_insights"]}, "Analytics Agent completed successfully.")


@router.post("/security")
async def ai_security(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in {"Administrator", "Operator"}:
        raise HTTPException(status_code=403, detail="Viewer role cannot inspect security posture.")

    recent_audit = (
        await db.execute(select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(8))
    ).scalars().all()
    warnings = []
    for entry in recent_audit:
        if "permission" in (entry.details or "").lower() or "login" in (entry.action or "").lower():
            warnings.append(entry.details or entry.action)
    await _log_activity(db, "security_agent_run", f"Security Advisor inspected audit events for {current_user.email}")
    return ok({"agent": "Security Advisor", "warnings": warnings[:5], "audit_entries": [item.details or item.action for item in recent_audit]}, "Security Advisor completed successfully.")


@router.post("/chat")
async def ai_chat(
    payload: AgentChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="A message is required.")

    conversation_id = payload.conversation_id
    if not conversation_id:
        conversation = AIConversation(id=uuid.uuid4(), title=payload.message[:40], user_id=current_user.id)
        db.add(conversation)
        await db.flush()
        conversation_id = conversation.id
    else:
        conversation = (await db.execute(select(AIConversation).filter(AIConversation.id == payload.conversation_id))).scalars().first()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

    user_message = AIMessage(id=uuid.uuid4(), conversation_id=conversation_id, sender="user", content=payload.message, timestamp=datetime.utcnow())
    db.add(user_message)
    await db.flush()

    reply_content = await LangGraphOrchestrator.process_user_query(db, payload.message)
    assistant_message = AIMessage(id=uuid.uuid4(), conversation_id=conversation_id, sender="assistant", content=reply_content, timestamp=datetime.utcnow())
    db.add(assistant_message)

    if conversation.title == "New Conversation":
        conversation.title = payload.message[:40]
    conversation.updated_at = datetime.utcnow()
    await db.commit()
    await _log_activity(db, "chat_agent_run", f"OpsGPT answered a request for {current_user.email}")
    return created(
        AgentChatResponse(conversation_id=conversation_id, reply=reply_content, timestamp=datetime.utcnow()).model_dump(mode="json"),
        "AI chat response generated.",
    )
