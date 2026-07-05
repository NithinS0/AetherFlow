from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from uuid import UUID
from app.database.session import get_db
from app.models import AIReport, User
from app.dependencies.auth import get_current_user
from app.ai.agents.doc_agent import DocAgent
from app.api.common import PaginationParams, FilterParams, ok, created, paginated
from pydantic import BaseModel, ConfigDict
from datetime import datetime

router = APIRouter()


# Schema structures
class AIReportOut(BaseModel):
    id: UUID
    report_type: str
    content: str
    generated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- API Endpoints ---

@router.get("")
async def list_reports(
    pagination: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(AIReport)
    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar() or 0
    res = await db.execute(stmt.order_by(AIReport.generated_at.desc()).offset(pagination.offset).limit(pagination.limit))
    reports = res.scalars().all()
    data = [AIReportOut.model_validate(r).model_dump(mode="json") for r in reports]
    return paginated(data, total, pagination, "Reports retrieved.")

@router.post("/generate", status_code=status.HTTP_201_CREATED)
async def generate_report(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = await DocAgent.generate_daily_report(db)
    return created(AIReportOut.model_validate(report).model_dump(mode="json"), "Report generated.")

