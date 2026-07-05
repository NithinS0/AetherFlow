from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.services.analytics_service import AnalyticsService
from app.api.deps import get_current_user
from app.api.common import ok, created

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard_metrics(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await AnalyticsService.get_dashboard_metrics(db)
    return ok(result, "Dashboard metrics retrieved.")

@router.get("/queues")
async def get_queue_analytics(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await AnalyticsService.get_queue_analytics(db)
    return ok(result, "Queue analytics retrieved.")

@router.get("/workers")
async def get_worker_analytics(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await AnalyticsService.get_worker_analytics(db)
    return ok(result, "Worker analytics retrieved.")

@router.get("/jobs/distribution")
async def get_job_distribution(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await AnalyticsService.get_job_distribution(db)
    return ok(result, "Job distribution retrieved.")

@router.get("/incidents/summary")
async def get_incident_summary(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await AnalyticsService.get_incident_summary(db)
    return ok(result, "Incident summary retrieved.")

@router.get("/ai/summary")
async def get_ai_summary(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await AnalyticsService.get_ai_summary(db)
    return ok(result, "AI summary retrieved.")

@router.get("/trends")
async def get_trends(
    period: str = Query("daily"),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await AnalyticsService.get_trends(db, period)
    return ok(result, "Trends retrieved.")

@router.get("/forecast")
async def get_forecast(
    metric: str = Query(..., description="Metric to forecast (e.g. queue_growth)"),
    days: int = Query(14, description="Days ahead to forecast"),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await AnalyticsService.get_forecast(db, metric, days)
    return ok(result, "Forecast retrieved.")

@router.get("/heatmap")
async def get_heatmap(
    type: str = Query(..., description="Type of heatmap (failure|execution|worker)"),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await AnalyticsService.get_heatmap(db, type)
    return ok(result, "Heatmap retrieved.")

@router.get("/reports")
async def get_reports(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await AnalyticsService.get_reports(db)
    return ok(result, "Reports retrieved.")

@router.post("/reports", status_code=201)
async def create_report(
    data: dict,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await AnalyticsService.create_report(db, data, current_user)
    return created(result, "Report created.")

