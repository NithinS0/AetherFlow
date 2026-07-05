import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.session import async_engine, Base, AsyncSessionLocal
from app.database.init_db import init_db
from app.api import auth, organizations, teams, projects, roles, notifications, audit, queues, jobs, retry_policies, workers, executions, reliability, chaos, operations, ai_chat, ai_recommendations, ai_reports, ai_agents, incidents, channels, presence, approvals, analytics, search, settings as app_settings, plugins, api_keys, dead_letter
from app.api.sockets import socket_manager
from app.api.errors import register_exception_handlers

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("aetherflow.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Startup ---
    logger.info("Skipping runtime schema create; ensure migrations are applied before startup.")
    async with async_engine.begin() as conn:
        pass

    logger.info("Seeding initial database configurations...")
    async with AsyncSessionLocal() as session:
        await init_db(session)

    # Start the distributed scheduler coordinator
    from app.scheduler.scheduler_manager import scheduler_manager
    await scheduler_manager.start()
        
    yield
    
    # --- Shutdown ---
    await scheduler_manager.shutdown()
    logger.info("Shutdown operations complete.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan,
    version="1.0.0"
)

# CORS Policy configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL] if settings.FRONTEND_URL else ["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception Handlers Registration
register_exception_handlers(app)

# Router Registrations
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(organizations.router, prefix=f"{settings.API_V1_STR}/organizations", tags=["organizations"])
app.include_router(teams.router, prefix=f"{settings.API_V1_STR}/teams", tags=["teams"])
app.include_router(projects.router, prefix=f"{settings.API_V1_STR}/projects", tags=["projects"])
app.include_router(roles.router, prefix=f"{settings.API_V1_STR}", tags=["roles"]) # Exposes /roles and /permissions
app.include_router(notifications.router, prefix=f"{settings.API_V1_STR}/notifications", tags=["notifications"])
app.include_router(audit.router, prefix=f"{settings.API_V1_STR}/audit", tags=["audit"])

# --- Phase 2 Routers ---
app.include_router(queues.router, prefix=f"{settings.API_V1_STR}/queues", tags=["queues"])
app.include_router(jobs.router, prefix=f"{settings.API_V1_STR}/jobs", tags=["jobs"])
app.include_router(retry_policies.router, prefix=f"{settings.API_V1_STR}", tags=["retry-policies"])

# --- Phase 3 Routers ---
app.include_router(workers.router, prefix=f"{settings.API_V1_STR}/workers", tags=["workers"])
app.include_router(executions.router, prefix=f"{settings.API_V1_STR}/executions", tags=["executions"])
app.include_router(dead_letter.router, prefix=f"{settings.API_V1_STR}/dead-letter", tags=["dead-letter"])

# --- Phase 4 Routers ---
app.include_router(reliability.router, prefix=f"{settings.API_V1_STR}", tags=["reliability"])
app.include_router(chaos.router, prefix=f"{settings.API_V1_STR}", tags=["chaos"])

# --- Phase 5 Routers ---
app.include_router(operations.router, prefix=f"{settings.API_V1_STR}", tags=["operations"])

# --- Phase 6 Routers ---
app.include_router(ai_chat.router, prefix=f"{settings.API_V1_STR}/ai", tags=["ai-chat"])
app.include_router(ai_recommendations.router, prefix=f"{settings.API_V1_STR}/ai/recommendations", tags=["ai-recommendations"])
app.include_router(ai_reports.router, prefix=f"{settings.API_V1_STR}/ai/reports", tags=["ai-reports"])
app.include_router(ai_agents.router, prefix=f"{settings.API_V1_STR}/ai", tags=["ai-agents"])

# --- Phase 7 Routers ---
app.include_router(incidents.router, prefix=f"{settings.API_V1_STR}/incidents", tags=["incidents"])
app.include_router(channels.router, prefix=f"{settings.API_V1_STR}/channels", tags=["channels"])
app.include_router(presence.router, prefix=f"{settings.API_V1_STR}/presence", tags=["presence"])
app.include_router(approvals.router, prefix=f"{settings.API_V1_STR}/approvals", tags=["approvals"])

# --- Phase 8 Routers ---
app.include_router(analytics.router, prefix=f"{settings.API_V1_STR}/analytics", tags=["analytics"])

# --- Phase 9 Routers ---
app.include_router(search.router, prefix=f"{settings.API_V1_STR}/search", tags=["search"])
app.include_router(app_settings.router, prefix=f"{settings.API_V1_STR}/settings", tags=["settings"])
app.include_router(plugins.router, prefix=f"{settings.API_V1_STR}/plugins", tags=["plugins"])
app.include_router(api_keys.router, prefix=f"{settings.API_V1_STR}/api-keys", tags=["api-keys"])


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await socket_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        socket_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        socket_manager.disconnect(websocket)

@app.get("/")
def read_root():
    return {"status": "AetherFlow Enterprise API is active (Phase 8 Analytics & BI)"}
