"""
GET /api/v1/search?q=...  — global full-text search across all resource types
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.models import User, Queue, Job, Worker, Incident, Project
from app.api.common import ok

router = APIRouter()


@router.get(
    "",
    summary="Global search",
    description="Full-text search across Queues, Jobs, Workers, Incidents, and Projects. "
                "Pass ?q= with at least 1 character.",
)
async def global_search(
    q: str = Query(..., min_length=1, description="Search query string"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    results = []
    term = f"%{q}%"

    queues = (await db.execute(
        select(Queue).where(or_(Queue.name.ilike(term), Queue.description.ilike(term))).limit(5)
    )).scalars().all()
    for queue in queues:
        results.append({"id": str(queue.id), "type": "queue", "title": queue.name,
                         "subtitle": queue.description or "Queue", "url": "/queues"})

    jobs = (await db.execute(select(Job).limit(5))).scalars().all()  # Job has no name col — search by type/status
    for job in jobs:
        results.append({"id": str(job.id), "type": "job", "title": str(job.id),
                         "subtitle": f"Status: {job.status}", "url": "/jobs"})

    workers = (await db.execute(
        select(Worker).where(Worker.name.ilike(term)).limit(5)
    )).scalars().all()
    for worker in workers:
        results.append({"id": str(worker.id), "type": "worker", "title": worker.name,
                         "subtitle": f"Status: {worker.status}", "url": "/workers"})

    incidents = (await db.execute(
        select(Incident).where(or_(Incident.title.ilike(term), Incident.description.ilike(term))).limit(5)
    )).scalars().all()
    for incident in incidents:
        results.append({"id": str(incident.id), "type": "incident", "title": incident.title,
                         "subtitle": f"Severity: {incident.severity}", "url": "/incidents"})

    projects = (await db.execute(
        select(Project).where(or_(Project.name.ilike(term), Project.description.ilike(term))).limit(5)
    )).scalars().all()
    for project in projects:
        results.append({"id": str(project.id), "type": "project", "title": project.name,
                         "subtitle": project.description or "Project", "url": "/projects"})

    return ok({"results": results, "count": len(results)}, f"Found {len(results)} result(s) for '{q}'.")
