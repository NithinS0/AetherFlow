import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Boolean, Table, Integer, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database.session import Base

class TimestampMixin:
    """Common fields for all enterprise models."""
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(UUID(as_uuid=True), nullable=True) 
    updated_by = Column(UUID(as_uuid=True), nullable=True)
    deleted_at = Column(DateTime, nullable=True) # Soft Delete support


# Many-to-Many / Join Tables
team_members = Table(
    "team_members",
    Base.metadata,
    Column("team_id", UUID(as_uuid=True), ForeignKey("teams.id", ondelete="CASCADE"), primary_key=True),
    Column("user_id", UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("joined_at", DateTime, default=datetime.utcnow)
)

role_permissions = Table(
    "role_permissions",
    Base.metadata,
    Column("role_id", UUID(as_uuid=True), ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
    Column("permission_id", UUID(as_uuid=True), ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True)
)

job_dependencies = Table(
    "job_dependencies",
    Base.metadata,
    Column("parent_job_id", UUID(as_uuid=True), ForeignKey("jobs.id", ondelete="CASCADE"), primary_key=True),
    Column("child_job_id", UUID(as_uuid=True), ForeignKey("jobs.id", ondelete="CASCADE"), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    teams = relationship("Team", secondary=team_members, back_populates="members")
    project_memberships = relationship("ProjectMember", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    settings = relationship("Setting", back_populates="user", cascade="all, delete-orphan")
    queues = relationship("Queue", back_populates="created_by")
    jobs = relationship("Job", back_populates="created_by")
    scheduled_jobs = relationship("ScheduledJob", back_populates="created_by")

    @property
    def role(self) -> str:
        if self.email in ["admin@aetherflow.io", "admin@aetherflow.com"]:
            return "Administrator"
        if self.email == "operator@aetherflow.com":
            return "Operator"
        return "Viewer"

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False, index=True)
    slug = Column(String, unique=True, nullable=False, index=True)
    logo_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True) # Soft delete

    # Relationships
    teams = relationship("Team", back_populates="organization", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="organization", cascade="all, delete-orphan")
    settings = relationship("Setting", back_populates="organization", cascade="all, delete-orphan")
    queues = relationship("Queue", back_populates="organization", cascade="all, delete-orphan")

class Team(Base):
    __tablename__ = "teams"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False, index=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    team_lead_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    organization = relationship("Organization", back_populates="teams")
    team_lead = relationship("User", foreign_keys=[team_lead_id])
    members = relationship("User", secondary=team_members, back_populates="teams")

class Project(Base):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False, index=True)
    description = Column(String, nullable=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    is_archived = Column(Boolean, default=False, nullable=False)
    avatar_url = Column(String, nullable=True)
    tags = Column(JSON, nullable=True) # JSON list: ["api", "service"]
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    organization = relationship("Organization", back_populates="projects")
    members = relationship("ProjectMember", back_populates="project", cascade="all, delete-orphan")
    queues = relationship("Queue", back_populates="project", cascade="all, delete-orphan")

class ProjectMember(Base):
    __tablename__ = "project_members"

    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    role_id = Column(UUID(as_uuid=True), ForeignKey("roles.id", ondelete="CASCADE"), nullable=False)
    joined_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="members")
    user = relationship("User", back_populates="project_memberships")
    role = relationship("Role")

class Role(Base):
    __tablename__ = "roles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False, index=True) # Administrator, Operator, Viewer
    description = Column(String, nullable=True)

    # Relationships
    permissions = relationship("Permission", secondary=role_permissions, back_populates="roles")

class Permission(Base):
    __tablename__ = "permissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String, unique=True, nullable=False, index=True) # e.g. "manage_org"
    description = Column(String, nullable=True)

    # Relationships
    roles = relationship("Role", secondary=role_permissions, back_populates="permissions")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String, nullable=False, index=True) # Login, Organization Created, etc.
    entity_type = Column(String, nullable=False) # e.g. "organization", "project"
    entity_id = Column(String, nullable=False)
    ip_address = Column(String, nullable=True)
    details = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    user = relationship("User", back_populates="audit_logs")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    type = Column(String, nullable=False, default="info") # info, warning, success
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    user = relationship("User", back_populates="notifications")

class Setting(Base):
    __tablename__ = "settings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True)
    settings_json = Column(JSON, nullable=False, default=dict) # E.g., {"theme": "dark", "timezone": "UTC"}
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="settings")
    organization = relationship("Organization", back_populates="settings")

# --- Phase 2 Specific Tables ---

class RetryPolicy(Base):
    __tablename__ = "retry_policies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False, index=True)
    type = Column(String, nullable=False, default="fixed")  # fixed, linear, exponential
    max_retries = Column(Integer, nullable=False, default=3)
    delay_seconds = Column(Integer, nullable=False, default=5)
    backoff_multiplier = Column(Float, nullable=False, default=2.0)
    retry_conditions = Column(JSON, nullable=True)  # e.g., ["*", "TimeoutError"]
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    queues = relationship("Queue", back_populates="retry_policy")

class Queue(Base):
    __tablename__ = "queues"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False, index=True)
    description = Column(String, nullable=True)
    priority = Column(String, nullable=False, default="medium")  # high, medium, low
    concurrency_limit = Column(Integer, nullable=False, default=5)
    max_queue_size = Column(Integer, nullable=False, default=1000)
    default_timeout = Column(Integer, nullable=False, default=60)  # seconds
    max_runtime = Column(Integer, nullable=False, default=300)  # seconds
    dlq_enabled = Column(Boolean, default=True, nullable=False)
    auto_retry = Column(Boolean, default=True, nullable=False)
    is_paused = Column(Boolean, default=False, nullable=False)
    is_archived = Column(Boolean, default=False, nullable=False)
    health_score = Column(Integer, default=100, nullable=False)
    tags = Column(JSON, nullable=True)  # List: ["email", "high-priority"]
    labels = Column(JSON, nullable=True)  # Dict: {"owner": "devops"}
    retry_policy_id = Column(UUID(as_uuid=True), ForeignKey("retry_policies.id", ondelete="SET NULL"), nullable=True)
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    organization = relationship("Organization", back_populates="queues")
    project = relationship("Project", back_populates="queues")
    retry_policy = relationship("RetryPolicy", back_populates="queues")
    created_by = relationship("User", back_populates="queues")
    jobs = relationship("Job", back_populates="queue", cascade="all, delete-orphan")
    scheduled_jobs = relationship("ScheduledJob", back_populates="queue", cascade="all, delete-orphan")

class ScheduledJob(Base):
    __tablename__ = "scheduled_jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False, index=True)
    queue_id = Column(UUID(as_uuid=True), ForeignKey("queues.id", ondelete="CASCADE"), nullable=False)
    cron_expression = Column(String, nullable=False)  # e.g., "*/5 * * * *"
    timezone = Column(String, nullable=False, default="UTC")
    payload = Column(JSON, nullable=True)
    is_enabled = Column(Boolean, default=True, nullable=False)
    last_run_at = Column(DateTime, nullable=True)
    next_run_at = Column(DateTime, nullable=True)
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    queue = relationship("Queue", back_populates="scheduled_jobs")
    created_by = relationship("User", back_populates="scheduled_jobs")

class BatchJob(Base):
    __tablename__ = "batch_jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False, index=True)
    status = Column(String, nullable=False, default="pending")  # pending, active, completed, failed, cancelled
    total_jobs = Column(Integer, nullable=False, default=0)
    completed_jobs = Column(Integer, nullable=False, default=0)
    failed_jobs = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    jobs = relationship("Job", back_populates="batch")

class Job(Base):
    __tablename__ = "jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    queue_id = Column(UUID(as_uuid=True), ForeignKey("queues.id", ondelete="CASCADE"), nullable=False)
    batch_id = Column(UUID(as_uuid=True), ForeignKey("batch_jobs.id", ondelete="SET NULL"), nullable=True)
    type = Column(String, nullable=False, default="immediate")  # immediate, delayed, scheduled, recurring, cron, batch, dependency, chained
    status = Column(String, nullable=False, default="pending")  # pending, queued, running, completed, failed, cancelled, dead_letter
    priority = Column(String, nullable=False, default="medium")  # high, medium, low
    payload = Column(JSON, nullable=True)
    metadata_json = Column(JSON, nullable=True)  # renamed from metadata to avoid SQLAlchemy conflicts
    scheduled_time = Column(DateTime, default=datetime.utcnow)
    execution_time = Column(DateTime, nullable=True)
    retry_count = Column(Integer, default=0, nullable=False)
    max_retries = Column(Integer, default=3, nullable=False)
    timeout_seconds = Column(Integer, default=60, nullable=False)
    idempotency_key = Column(String, unique=True, nullable=True)
    lock_token = Column(UUID(as_uuid=True), nullable=True)
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    queue = relationship("Queue", back_populates="jobs")
    batch = relationship("BatchJob", back_populates="jobs")
    created_by = relationship("User", back_populates="jobs")
    metadata_items = relationship("JobMetadata", back_populates="job", cascade="all, delete-orphan")

    # Dependency relationships (Self-referential many-to-many)
    dependencies = relationship(
        "Job",
        secondary=job_dependencies,
        primaryjoin=(id == job_dependencies.c.child_job_id),
        secondaryjoin=(id == job_dependencies.c.parent_job_id),
        backref="dependent_jobs"
    )

class JobMetadata(Base):
    __tablename__ = "job_metadata"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    key = Column(String, nullable=False, index=True)
    value = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    job = relationship("Job", back_populates="metadata_items")

# --- Phase 3 Distributed Worker Engine tables ---

class Worker(Base):
    __tablename__ = "workers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False, index=True)
    hostname = Column(String, nullable=False)
    version = Column(String, nullable=False)
    status = Column(String, nullable=False, default="idle")  # online, busy, idle, offline, maintenance, stopping
    supported_queues = Column(JSON, nullable=True)  # List: [queue_uuid, ...]
    capabilities = Column(JSON, nullable=True)  # List: ["api", "batch", "email"]
    started_at = Column(DateTime, default=datetime.utcnow)
    last_heartbeat_at = Column(DateTime, default=datetime.utcnow)

    heartbeats = relationship("WorkerHeartbeat", back_populates="worker", cascade="all, delete-orphan")
    executions = relationship("JobExecution", back_populates="worker", cascade="all, delete-orphan")
    events = relationship("WorkerEvent", back_populates="worker", cascade="all, delete-orphan")

class WorkerHeartbeat(Base):
    __tablename__ = "worker_heartbeats"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    worker_id = Column(UUID(as_uuid=True), ForeignKey("workers.id", ondelete="CASCADE"), nullable=False)
    cpu_usage = Column(Float, nullable=False, default=0.0)
    memory_usage = Column(Float, nullable=False, default=0.0)
    current_job_count = Column(Integer, nullable=False, default=0)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    worker = relationship("Worker", back_populates="heartbeats")

class JobExecution(Base):
    __tablename__ = "job_executions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    worker_id = Column(UUID(as_uuid=True), ForeignKey("workers.id", ondelete="CASCADE"), nullable=False)
    status = Column(String, nullable=False, default="running")  # running, completed, failed
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    duration = Column(Float, nullable=True)  # seconds
    output = Column(JSON, nullable=True)
    error = Column(JSON, nullable=True)

    worker = relationship("Worker", back_populates="executions")
    logs = relationship("JobLog", back_populates="execution", cascade="all, delete-orphan")

class JobLog(Base):
    __tablename__ = "job_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    execution_id = Column(UUID(as_uuid=True), ForeignKey("job_executions.id", ondelete="CASCADE"), nullable=False)
    level = Column(String, nullable=False, default="info")  # info, warning, error
    message = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    execution = relationship("JobExecution", back_populates="logs")

class WorkerEvent(Base):
    __tablename__ = "worker_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    worker_id = Column(UUID(as_uuid=True), ForeignKey("workers.id", ondelete="CASCADE"), nullable=False)
    event_type = Column(String, nullable=False, index=True)  # register, offline, crashed, drain, maintenance
    details = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    worker = relationship("Worker", back_populates="events")

# --- Phase 4 Reliability & Self-Healing tables ---

class SystemEvent(Base):
    __tablename__ = "system_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_type = Column(String, nullable=False, index=True)  # worker_registered, job_claimed, job_failed, etc.
    entity_type = Column(String, nullable=False)  # e.g., "worker", "job", "queue"
    entity_id = Column(String, nullable=False, index=True)
    details = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

class RecoveryEvent(Base):
    __tablename__ = "recovery_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    type = Column(String, nullable=False, index=True)  # orphan_job, stuck_lock, heartbeat_timeout
    worker_id = Column(UUID(as_uuid=True), nullable=True)
    queue_id = Column(UUID(as_uuid=True), nullable=True)
    job_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    duration_ms = Column(Integer, nullable=False, default=0)
    success = Column(Boolean, default=True, nullable=False)
    notes = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

class ChaosRun(Base):
    __tablename__ = "chaos_runs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scenario = Column(String, nullable=False)  # kill_worker, pause_worker, latency, fail_execution, queue_flood
    started_at = Column(DateTime, default=datetime.utcnow)
    finished_at = Column(DateTime, nullable=True)
    status = Column(String, nullable=False, default="active")  # active, completed
    affected_workers_count = Column(Integer, nullable=False, default=0)
    affected_jobs_count = Column(Integer, nullable=False, default=0)
    success = Column(Boolean, nullable=True)
    recovery_duration_ms = Column(Integer, nullable=True)

class ReliabilityMetric(Base):
    __tablename__ = "reliability_metrics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    availability_rate = Column(Float, nullable=False, default=100.0)
    recovery_success_rate = Column(Float, nullable=False, default=100.0)
    mttr_seconds = Column(Float, nullable=False, default=0.0)
    duplicate_prevented = Column(Integer, nullable=False, default=0)
    system_health_score = Column(Integer, nullable=False, default=100)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

# --- Phase 6 AI Intelligence Layer tables ---

class AiConversation(Base):
    __tablename__ = "ai_conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False, default="New Conversation")
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    messages = relationship("AiMessage", back_populates="conversation", cascade="all, delete-orphan")

class AiMessage(Base):
    __tablename__ = "ai_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("ai_conversations.id", ondelete="CASCADE"), nullable=False)
    sender = Column(String, nullable=False)  # user, assistant
    content = Column(String, nullable=False)  # Markdown Content
    timestamp = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("AiConversation", back_populates="messages")

class AiRecommendation(Base):
    __tablename__ = "ai_recommendations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    type = Column(String, nullable=False)  # concurrency, worker_count, retry_policy
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    priority = Column(String, nullable=False, default="medium")  # low, medium, high, critical
    status = Column(String, nullable=False, default="pending")  # pending, approved, rejected
    queue_id = Column(UUID(as_uuid=True), ForeignKey("queues.id", ondelete="SET NULL"), nullable=True)
    worker_id = Column(UUID(as_uuid=True), ForeignKey("workers.id", ondelete="SET NULL"), nullable=True)
    suggested_value = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    approvals = relationship("AiApproval", back_populates="recommendation", cascade="all, delete-orphan")

class AiReport(Base):
    __tablename__ = "ai_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    report_type = Column(String, nullable=False)  # daily, weekly, incident
    content = Column(String, nullable=False)  # Markdown
    generated_at = Column(DateTime, default=datetime.utcnow)

class AIActivity(Base):
    __tablename__ = "ai_activity"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    action_type = Column(String, nullable=False)  # recommendation_created, recommendation_approved, conversation_started
    details = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

class AgentStatus(Base):
    __tablename__ = "agent_status"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    agent_name = Column(String, unique=True, nullable=False)  # monitoring_agent, failure_analyst, etc.
    status = Column(String, nullable=False, default="idle")  # idle, running
    last_active_at = Column(DateTime, default=datetime.utcnow)


# ─── Phase 7 Collaboration & Incident Management ─────────────────────────────

class Channel(Base):
    """Chat channel scoped to an entity (org/team/project/queue/job/incident)."""
    __tablename__ = "channels"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    context_type = Column(String, nullable=False, default="org")  # org|team|project|queue|job|incident
    context_id = Column(String, nullable=True)
    is_private = Column(Boolean, default=False)
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    messages = relationship("Message", back_populates="channel", cascade="all, delete-orphan")


class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    channel_id = Column(UUID(as_uuid=True), ForeignKey("channels.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    content = Column(String, nullable=False)
    is_edited = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
    thread_parent_id = Column(UUID(as_uuid=True), ForeignKey("messages.id", ondelete="SET NULL"), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    channel = relationship("Channel", back_populates="messages")
    reactions = relationship("MessageReaction", back_populates="message", cascade="all, delete-orphan")


class MessageReaction(Base):
    __tablename__ = "message_reactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_id = Column(UUID(as_uuid=True), ForeignKey("messages.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    emoji = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    message = relationship("Message", back_populates="reactions")


class UserPresence(Base):
    __tablename__ = "user_presence"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    status = Column(String, nullable=False, default="offline")  # online|offline|away|busy
    activity = Column(String, nullable=True)  # dashboard|queue|worker|incident|settings
    last_seen_at = Column(DateTime, default=datetime.utcnow)


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    severity = Column(String, nullable=False, default="medium")  # low|medium|high|critical
    status = Column(String, nullable=False, default="open")  # open|investigating|in_progress|resolved|closed
    trigger = Column(String, nullable=False, default="manual")  # worker_crash|job_failure|queue_congestion|manual
    assigned_to_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    queue_id = Column(UUID(as_uuid=True), ForeignKey("queues.id", ondelete="SET NULL"), nullable=True)
    worker_id = Column(UUID(as_uuid=True), ForeignKey("workers.id", ondelete="SET NULL"), nullable=True)
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id", ondelete="SET NULL"), nullable=True)
    ai_analysis = Column(String, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    comments = relationship("IncidentComment", back_populates="incident", cascade="all, delete-orphan")


class IncidentComment(Base):
    __tablename__ = "incident_comments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    incident_id = Column(UUID(as_uuid=True), ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    comment_type = Column(String, nullable=False, default="comment")  # comment|status_change|assignment|escalation
    content = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    incident = relationship("Incident", back_populates="comments")


class Approval(Base):
    """Unified approval record for AI recommendations, queue changes, worker restarts, etc."""
    __tablename__ = "approvals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    approval_type = Column(String, nullable=False)  # ai_recommendation|queue_change|worker_restart|maintenance_mode
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    status = Column(String, nullable=False, default="pending")  # pending|approved|rejected
    severity = Column(String, nullable=False, default="medium")  # low|medium|high|critical
    requested_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewed_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    payload = Column(JSON, nullable=True)
    review_note = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime, nullable=True)


# Phase 8: Analytics & BI

class AnalyticsSnapshot(Base):
    __tablename__ = "analytics_snapshots"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    metrics = Column(JSON, nullable=False)


class AggregatedMetric(Base):
    __tablename__ = "aggregated_metrics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    metric_name = Column(String, nullable=False, index=True)
    period = Column(String, nullable=False) # daily, weekly, monthly
    timestamp = Column(DateTime, nullable=False, index=True)
    value = Column(Float, nullable=False)
    dimensions = Column(JSON, nullable=True) # e.g. {"queue_id": "...", "worker_id": "..."}


class Report(Base):
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    metrics = Column(JSON, nullable=False)
    filters = Column(JSON, nullable=True)
    schedule = Column(String, nullable=True) # e.g. cron
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    exports = relationship("ReportExport", back_populates="report", cascade="all, delete-orphan")


class ReportExport(Base):
    __tablename__ = "report_exports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    report_id = Column(UUID(as_uuid=True), ForeignKey("reports.id", ondelete="CASCADE"), nullable=False)
    format = Column(String, nullable=False, default="csv") # csv, pdf
    status = Column(String, nullable=False, default="pending") # pending, completed, failed
    file_url = Column(String, nullable=True)
    generated_at = Column(DateTime, default=datetime.utcnow)

    report = relationship("Report", back_populates="exports")


class ForecastResult(Base):
    __tablename__ = "forecast_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    metric_name = Column(String, nullable=False, index=True)
    forecast_date = Column(DateTime, nullable=False, index=True)
    predicted_value = Column(Float, nullable=False)
    lower_bound = Column(Float, nullable=True)
    upper_bound = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# --- Programmatically Merged Missing V2 Models ---

class AiAgent(Base, TimestampMixin):
    __tablename__ = "ai_agents"
    name = Column(String, unique=True, index=True)
    purpose = Column(String)
    
    activity = relationship("AgentActivity", back_populates="agent", cascade="all, delete-orphan")

class AgentActivity(Base, TimestampMixin):
    __tablename__ = "agent_activity"
    agent_id = Column(UUID(as_uuid=True), ForeignKey("ai_agents.id", ondelete="CASCADE"))
    action = Column(String)
    
    agent = relationship("AiAgent", back_populates="activity")

class AiApproval(Base, TimestampMixin):
    __tablename__ = "ai_approvals"
    recommendation_id = Column(UUID(as_uuid=True), ForeignKey("ai_recommendations.id", ondelete="CASCADE"))
    status = Column(String) # pending, approved, rejected
    
    recommendation = relationship("AiRecommendation", back_populates="approvals")

class UserProfile(Base, TimestampMixin):
    __tablename__ = "user_profiles"
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    bio = Column(String, nullable=True)
    location = Column(String, nullable=True)
    
    user = relationship("User", backref="user_profile")

class Session(Base, TimestampMixin):
    __tablename__ = "sessions"
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    token = Column(String, unique=True, index=True)
    expires_at = Column(DateTime)
    
    user = relationship("User", backref="sessions")

class ApiKey(Base, TimestampMixin):
    __tablename__ = "api_keys"
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True)
    key_hash = Column(String, unique=True, index=True)
    name = Column(String)
    key_prefix = Column(String, nullable=True)
    permissions = Column(String, default="read")
    last_used_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    is_revoked = Column(Boolean, default=False)
    
    user = relationship("User", backref="api_keys")

class PasswordResetToken(Base, TimestampMixin):
    __tablename__ = "password_reset_tokens"
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    token = Column(String, unique=True, index=True)
    expires_at = Column(DateTime)

class LoginHistory(Base, TimestampMixin):
    __tablename__ = "login_history"
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    ip_address = Column(String)
    user_agent = Column(String)
    status = Column(String) # success, failed
    
    user = relationship("User", backref="login_history")

class MessageThread(Base, TimestampMixin):
    __tablename__ = "message_threads"
    parent_message_id = Column(UUID(as_uuid=True), ForeignKey("messages.id", ondelete="CASCADE"))
    content = Column(String)
    
    parent_message = relationship("Message", backref="threads")

class IncidentTimeline(Base, TimestampMixin):
    __tablename__ = "incident_timeline"
    incident_id = Column(UUID(as_uuid=True), ForeignKey("incidents.id", ondelete="CASCADE"))
    event_description = Column(String)
    
    incident = relationship("Incident", backref="timeline")

class JobPayload(Base, TimestampMixin):
    __tablename__ = "job_payloads"
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id", ondelete="CASCADE"), unique=True)
    data = Column(JSON)
    
    job = relationship("Job")

class JobResult(Base, TimestampMixin):
    __tablename__ = "job_results"
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id", ondelete="CASCADE"), unique=True)
    output = Column(JSON)
    
    job = relationship("Job")

class AnalyticsMetric(Base, TimestampMixin):
    __tablename__ = "analytics_metrics"
    metric_type = Column(String)
    value = Column(String)
    
class WorkflowTemplate(Base, TimestampMixin):
    __tablename__ = "workflow_templates"
    name = Column(String)
    
    nodes = relationship("WorkflowNode", back_populates="template", cascade="all, delete-orphan")
    edges = relationship("WorkflowEdge", back_populates="template", cascade="all, delete-orphan")

class WorkflowNode(Base, TimestampMixin):
    __tablename__ = "workflow_nodes"
    template_id = Column(UUID(as_uuid=True), ForeignKey("workflow_templates.id", ondelete="CASCADE"))
    node_data = Column(JSON)
    
    template = relationship("WorkflowTemplate", back_populates="nodes")

class WorkflowEdge(Base, TimestampMixin):
    __tablename__ = "workflow_edges"
    template_id = Column(UUID(as_uuid=True), ForeignKey("workflow_templates.id", ondelete="CASCADE"))
    source_node = Column(String)
    target_node = Column(String)
    
    template = relationship("WorkflowTemplate", back_populates="edges")

class Plugin(Base, TimestampMixin):
    __tablename__ = "plugins"
    name = Column(String, unique=True)
    version = Column(String)
    
    installations = relationship("PluginInstallation", back_populates="plugin", cascade="all, delete-orphan")

class PluginInstallation(Base, TimestampMixin):
    __tablename__ = "plugin_installations"
    plugin_id = Column(UUID(as_uuid=True), ForeignKey("plugins.id", ondelete="CASCADE"))
    config = Column(JSON)
    
    plugin = relationship("Plugin", back_populates="installations")

class Webhook(Base, TimestampMixin):
    __tablename__ = "webhooks"
    target_url = Column(String)
    events = Column(JSON)

class OrganizationSetting(Base, TimestampMixin):
    __tablename__ = "organization_settings"
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), unique=True)
    timezone = Column(String, default="UTC")
    
    organization = relationship("Organization")

class QueueTemplate(Base, TimestampMixin):
    __tablename__ = "queue_templates"
    name = Column(String, nullable=False, unique=True)
    default_config = Column(JSON)

class QueueLabel(Base, TimestampMixin):
    __tablename__ = "queue_labels"
    queue_id = Column(UUID(as_uuid=True), ForeignKey("queues.id", ondelete="CASCADE"))
    key = Column(String, nullable=False)
    value = Column(String, nullable=False)
    
    queue = relationship("Queue")

class QueueTag(Base, TimestampMixin):
    __tablename__ = "queue_tags"
    queue_id = Column(UUID(as_uuid=True), ForeignKey("queues.id", ondelete="CASCADE"))
    tag = Column(String, nullable=False)
    
    queue = relationship("Queue")

class QueueHealth(Base, TimestampMixin):
    __tablename__ = "queue_health"
    queue_id = Column(UUID(as_uuid=True), ForeignKey("queues.id", ondelete="CASCADE"), unique=True)
    status = Column(String) # healthy, degraded, stalled
    
    queue = relationship("Queue")

class FailureHistory(Base, TimestampMixin):
    __tablename__ = "failure_history"
    component = Column(String)
    error_message = Column(String)

class RecoveryHistory(Base, TimestampMixin):
    __tablename__ = "recovery_history"
    component = Column(String)
    time_to_recover_ms = Column(String)

class ChaosResult(Base, TimestampMixin):
    __tablename__ = "chaos_results"
    run_id = Column(UUID(as_uuid=True), ForeignKey("chaos_runs.id", ondelete="CASCADE"))
    findings = Column(JSON)
    
    run = relationship("ChaosRun", backref="results")

class SystemMetric(Base, TimestampMixin):
    __tablename__ = "system_metrics"
    metric_name = Column(String, index=True)
    value = Column(String)

class WorkerGroup(Base, TimestampMixin):
    __tablename__ = "worker_groups"
    name = Column(String, nullable=False, unique=True)

class WorkerCapability(Base, TimestampMixin):
    __tablename__ = "worker_capabilities"
    worker_id = Column(UUID(as_uuid=True), ForeignKey("workers.id", ondelete="CASCADE"))
    capability_name = Column(String, nullable=False)
    
    worker = relationship("Worker")
