from sqlalchemy import Column, String, ForeignKey, JSON, Integer, Table
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin

job_dependencies = Table(
    "job_dependencies",
    Base.metadata,
    Column("parent_job_id", UUID(as_uuid=True), ForeignKey("jobs.id", ondelete="CASCADE"), primary_key=True),
    Column("child_job_id", UUID(as_uuid=True), ForeignKey("jobs.id", ondelete="CASCADE"), primary_key=True)
)

class Job(Base, TimestampMixin):
    __tablename__ = "jobs"
    queue_id = Column(UUID(as_uuid=True), ForeignKey("queues.id", ondelete="CASCADE"), index=True)
    status = Column(String, default="queued", index=True) # queued, running, completed, failed
    retry_count = Column(Integer, default=0)
    
    # Relationships
    payload = relationship("JobPayload", back_populates="job", uselist=False, cascade="all, delete-orphan")
    metadata_rel = relationship("JobMetadata", back_populates="job", uselist=False, cascade="all, delete-orphan")
    executions = relationship("JobExecution", back_populates="job", cascade="all, delete-orphan")
    logs = relationship("JobLog", back_populates="job", cascade="all, delete-orphan")
    results = relationship("JobResult", back_populates="job", uselist=False, cascade="all, delete-orphan")

class JobPayload(Base, TimestampMixin):
    __tablename__ = "job_payloads"
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id", ondelete="CASCADE"), unique=True)
    data = Column(JSON)
    
    job = relationship("Job", back_populates="payload")

class JobMetadata(Base, TimestampMixin):
    __tablename__ = "job_metadata"
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id", ondelete="CASCADE"), unique=True)
    meta_info = Column(JSON)
    
    job = relationship("Job", back_populates="metadata_rel")

class ScheduledJob(Base, TimestampMixin):
    __tablename__ = "scheduled_jobs"
    queue_id = Column(UUID(as_uuid=True), ForeignKey("queues.id", ondelete="CASCADE"))
    cron_expression = Column(String)

class BatchJob(Base, TimestampMixin):
    __tablename__ = "batch_jobs"
    name = Column(String)
    status = Column(String)

class JobExecution(Base, TimestampMixin):
    __tablename__ = "job_executions"
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id", ondelete="CASCADE"))
    worker_id = Column(UUID(as_uuid=True), index=True) # Assuming worker is another module
    status = Column(String)
    
    job = relationship("Job", back_populates="executions")

class JobLog(Base, TimestampMixin):
    __tablename__ = "job_logs"
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id", ondelete="CASCADE"))
    log_level = Column(String)
    message = Column(String)
    
    job = relationship("Job", back_populates="logs")

class JobResult(Base, TimestampMixin):
    __tablename__ = "job_results"
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id", ondelete="CASCADE"), unique=True)
    output = Column(JSON)
    
    job = relationship("Job", back_populates="results")
